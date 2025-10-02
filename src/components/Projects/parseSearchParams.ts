import { CvProject } from "@/server/notion/getCvProjects";
import { FilterParams } from "./Filter/utils";

export type ProjectSearchParams = Partial<
  Record<keyof CvProject, string | string[]>
>;

export const parseProjectSearchParams = (searchParams: ProjectSearchParams) => {
  if (Object.entries(searchParams).length === 0) {
    return { featured: ["true"] };
  }

  const entries = Object.entries(searchParams).flatMap(([key, rawValue]) => {
    if (rawValue == null) {
      return [] as [string, string[]][];
    }

    const rawValues = Array.isArray(rawValue) ? rawValue : [rawValue];
    const normalizedValues = Array.from(
      new Set(
        rawValues
          .flatMap((v) => v.split(","))
          .map((v) => v.trim())
          .filter(Boolean),
      ),
    );

    if (!normalizedValues.length) {
      return [] as [string, string[]][];
    }

    return [[key, normalizedValues]] as [string, string[]][];
  });

  return Object.fromEntries(entries) as FilterParams;
};
