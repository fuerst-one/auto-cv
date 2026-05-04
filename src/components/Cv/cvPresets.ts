import { CvProject } from "@/server/notion/getCvProjects";
import { FilterParams, filterProjects } from "./Projects/Filter/utils";

export type CvPresetId =
  | "highlights"
  | "frontend"
  | "dataviz"
  | "conversion"
  | "all";

export type CvPreset = {
  id: CvPresetId;
  label: string;
  description: string;
  headline: string;
  filter: FilterParams;
  topN?: number;
};

export const CV_PRESETS: Record<CvPresetId, CvPreset> = {
  highlights: {
    id: "highlights",
    label: "Highlights",
    description: "Greatest hits — top featured projects.",
    headline: "Hand-picked: the projects I'd show first in a meeting.",
    filter: { featured: ["true"] },
    topN: 4,
  },
  frontend: {
    id: "frontend",
    label: "Full-Stack",
    description: "From business logic to UI — full products.",
    headline: "Full-stack builds, from data model to polished UI.",
    filter: { tools: ["Next.js", "Node", "Laravel"] },
    topN: 6,
  },
  dataviz: {
    id: "dataviz",
    label: "Data Viz",
    description: "Maps, Charts, Canvases — data-driven design.",
    headline: "Transforming your bits and bytes to actionable design.",
    filter: { tools: ["DeckGL", "Cosmograph", "ECharts"] },
    topN: 6,
  },
  conversion: {
    id: "conversion",
    label: "CRO & A11y",
    description:
      "Where behavioral psychology meets the funnel — CRO work across industries.",
    headline: "Persuasive, accessible, conversion-driven design.",
    filter: {
      experiences: ["Conversion Rate Optimization", "Behaviour Psychology"],
    },
    topN: 6,
  },
  all: {
    id: "all",
    label: "All",
    description: "The full archive — every project listed.",
    headline: "Every project, end to end — the complete archive.",
    filter: {},
  },
};

export const CV_PRESET_ORDER: CvPresetId[] = [
  "highlights",
  "frontend",
  "dataviz",
  "conversion",
  "all",
];

export const DEFAULT_PRESET_ID: CvPresetId = "highlights";

export const isCvPresetId = (value: unknown): value is CvPresetId =>
  typeof value === "string" && value in CV_PRESETS;

export const resolvePreset = (value: unknown): CvPreset =>
  CV_PRESETS[isCvPresetId(value) ? value : DEFAULT_PRESET_ID];

export type NormalizedFilters = Record<string, string[]>;

export const normalizeFilters = (filters: FilterParams): NormalizedFilters => {
  return Object.fromEntries(
    Object.entries(filters)
      .filter(([, values]) => values && values.length)
      .map(([key, values]) => [key, Array.from(new Set(values)).sort()]),
  );
};

export const findActivePreset = (
  filters: NormalizedFilters,
): CvPresetId | null => {
  const filterKeys = Object.keys(filters).sort();
  for (const id of CV_PRESET_ORDER) {
    const preset = CV_PRESETS[id];
    const presetKeys = Object.keys(preset.filter).sort();
    if (presetKeys.length !== filterKeys.length) {
      continue;
    }
    if (presetKeys.some((k, i) => k !== filterKeys[i])) {
      continue;
    }
    const allMatch = presetKeys.every((key) => {
      const presetValues = [...(preset.filter[key as keyof FilterParams] ?? [])]
        .map((v) => v.toLowerCase())
        .sort();
      const currentValues = [...(filters[key] ?? [])]
        .map((v) => v.toLowerCase())
        .sort();
      if (presetValues.length !== currentValues.length) {
        return false;
      }
      return presetValues.every((v, i) => v === currentValues[i]);
    });
    if (allMatch) {
      return id;
    }
  }
  return null;
};

export const sortAndCapForPreset = (
  projects: CvProject[],
  preset: CvPreset,
): CvProject[] => {
  const filtered = filterProjects(projects, preset.filter);
  const sorted = [...filtered].sort((a, b) => {
    if (b.wowFactor !== a.wowFactor) {
      return b.wowFactor - a.wowFactor;
    }
    return (b.startDate ?? "").localeCompare(a.startDate ?? "");
  });
  return preset.topN ? sorted.slice(0, preset.topN) : sorted;
};
