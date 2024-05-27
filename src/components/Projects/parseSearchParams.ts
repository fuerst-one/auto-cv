import { CvProject } from "@/server/notion/getCvProjects";
import { FilterParams } from "./Filter/utils";

export type ProjectSearchParams = Partial<Record<keyof CvProject, string>>;

export const parseProjectSearchParams = (searchParams: ProjectSearchParams) => {
  return Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [key, value.split(",")]),
  ) as FilterParams;
};
