import { CvProject } from "@/server/notion/getCvProjects";
import { FilterParams, filterProjects } from "./Projects/Filter/utils";

export type CvPresetId = "highlights" | "frontend" | "dataviz" | "ecommerce";

export type CvPreset = {
  id: CvPresetId;
  label: string;
  description: string;
  filter: FilterParams;
  topN?: number;
};

export const CV_PRESETS: Record<CvPresetId, CvPreset> = {
  highlights: {
    id: "highlights",
    label: "Highlights",
    description: "Greatest hits — top featured projects.",
    filter: { featured: ["true"] },
    topN: 4,
  },
  frontend: {
    id: "frontend",
    label: "Full-Stack Dev",
    description: "From business logic to UI — full products.",
    filter: { tools: ["Next.js", "Node", "Laravel"] },
    topN: 6,
  },
  dataviz: {
    id: "dataviz",
    label: "Data Viz",
    description: "Maps, Charts, Canvases — data-driven design.",
    filter: { tools: ["DeckGL", "Cosmograph", "ECharts"] },
    topN: 6,
  },
  ecommerce: {
    id: "ecommerce",
    label: "E-Commerce & CRO",
    description: "Conversion-driven storefronts & B2B platforms.",
    filter: { industries: ["E-Commerce", "Marketing"] },
    topN: 6,
  },
};

export const CV_PRESET_ORDER: CvPresetId[] = [
  "highlights",
  "frontend",
  "dataviz",
  "ecommerce",
];

export const DEFAULT_PRESET_ID: CvPresetId = "highlights";

export const isCvPresetId = (value: unknown): value is CvPresetId =>
  typeof value === "string" && value in CV_PRESETS;

export const resolvePreset = (value: unknown): CvPreset =>
  CV_PRESETS[isCvPresetId(value) ? value : DEFAULT_PRESET_ID];

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
