import { CvProject } from "@/server/notion/getCvProjects";

export type DisplayType = "progress" | "pie";

export type FilterConfig = {
  projectKey: keyof CvProject;
  label: string;
  displayType: DisplayType;
};

export type FilterOption = {
  label: string;
  projectKey: keyof CvProject;
  displayType: DisplayType;
  itemCounts: ItemCount[];
};

export type ItemCount = {
  itemKey: string;
  count: number;
};