import { UMAP } from "umap-js";
import type { CvProject } from "./getCvProjects";

const UMAP_SEED = 42;
const UMAP_NEIGHBORS_TARGET = 8;
const UMAP_MIN_DIST = 0.3;

type CvProjectInput = Omit<CvProject, "position3d">;

type Vocabulary = {
  terms: string[];
  idf: Map<string, number>;
};

type Vocabularies = {
  tools: Vocabulary;
  industries: Vocabulary;
  experiences: Vocabulary;
  languages: Vocabulary;
};

const buildVocabulary = (
  projects: CvProjectInput[],
  selector: (p: CvProjectInput) => string[] | null | undefined,
): Vocabulary => {
  const docFreq = new Map<string, number>();
  for (const project of projects) {
    const seen = new Set((selector(project) ?? []).filter(Boolean));
    for (const term of seen) {
      docFreq.set(term, (docFreq.get(term) ?? 0) + 1);
    }
  }
  const terms = Array.from(docFreq.keys()).sort((a, b) => a.localeCompare(b));
  const idf = new Map<string, number>();
  const totalDocs = projects.length;
  for (const term of terms) {
    const df = docFreq.get(term)!;
    idf.set(term, Math.log(totalDocs / df));
  }
  return { terms, idf };
};

const buildVocabularies = (projects: CvProjectInput[]): Vocabularies => ({
  tools: buildVocabulary(projects, (p) => p.tools),
  industries: buildVocabulary(projects, (p) => p.industries),
  experiences: buildVocabulary(projects, (p) => p.experiences),
  languages: buildVocabulary(projects, (p) => p.languages),
});

const tfIdfBlock = (vocab: Vocabulary, values: string[]): number[] => {
  const present = new Set(values);
  return vocab.terms.map((term) =>
    present.has(term) ? (vocab.idf.get(term) ?? 0) : 0,
  );
};

const buildFeatureVector = (
  project: CvProjectInput,
  vocab: Vocabularies,
): number[] => [
  ...tfIdfBlock(vocab.tools, project.tools ?? []),
  ...tfIdfBlock(vocab.industries, project.industries ?? []),
  ...tfIdfBlock(vocab.experiences, project.experiences ?? []),
  ...tfIdfBlock(vocab.languages, project.languages ?? []),
];

const l2Normalize = (vector: number[]): number[] => {
  const magnitude = Math.sqrt(vector.reduce((sum, x) => sum + x * x, 0));
  return magnitude === 0 ? vector : vector.map((x) => x / magnitude);
};

// mulberry32: tiny seedable RNG so identical project data always yields
// the same 3D layout across server restarts and cache rebuilds.
const seededRandom = (seed: number) => {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const normalizeToUnitCube = (
  points: number[][],
): [number, number, number][] => {
  const dims = [0, 1, 2] as const;
  const mins = dims.map((d) => Math.min(...points.map((p) => p[d])));
  const maxs = dims.map((d) => Math.max(...points.map((p) => p[d])));
  return points.map((p) => {
    const out = dims.map((d) => {
      const range = maxs[d] - mins[d];
      if (range === 0) return 0;
      return ((p[d] - mins[d]) / range) * 2 - 1;
    });
    return [out[0], out[1], out[2]] as [number, number, number];
  });
};

export const embedProjectsTo3D = (projects: CvProjectInput[]): CvProject[] => {
  if (projects.length === 0) return [];
  if (projects.length === 1) {
    return [{ ...projects[0], position3d: [0, 0, 0] }];
  }

  const vocab = buildVocabularies(projects);

  const featureVectors = projects.map((p) =>
    l2Normalize(buildFeatureVector(p, vocab)),
  );

  const umap = new UMAP({
    nComponents: 3,
    nNeighbors: Math.min(UMAP_NEIGHBORS_TARGET, projects.length - 1),
    minDist: UMAP_MIN_DIST,
    spread: 1.0,
    random: seededRandom(UMAP_SEED),
  });
  const embedding = umap.fit(featureVectors);
  const positions = normalizeToUnitCube(embedding);

  return projects.map((project, index) => ({
    ...project,
    position3d: positions[index],
  }));
};
