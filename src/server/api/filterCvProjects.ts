import { CvProject } from "../notion/getCvProjects";
import {
  FilterParams,
  filterProjects,
} from "@/components/Cv/Projects/Filter/utils";

export type ApiFilterParams = {
  categorical: FilterParams;
  clientIds: string[];
  query: string | null;
  from: string | null;
  to: string | null;
  sort: SortOrder;
};

export type SortOrder = "wow" | "date" | "name";

export const SORT_ORDERS: SortOrder[] = ["wow", "date", "name"];

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const isValidIsoDate = (value: string): boolean => {
  if (!ISO_DATE_REGEX.test(value)) return false;
  const time = Date.parse(value);
  return !Number.isNaN(time);
};

export const filterCvProjectsForApi = (
  projects: CvProject[],
  params: ApiFilterParams,
): CvProject[] => {
  let result = filterProjects(projects, params.categorical);

  if (params.clientIds.length) {
    const clientIdSet = new Set(params.clientIds);
    result = result.filter((project) =>
      project.clients.some((client) => clientIdSet.has(client.id)),
    );
  }

  if (params.from || params.to) {
    result = result.filter((project) =>
      isInDateRange(project, params.from, params.to),
    );
  }

  if (params.query) {
    result = filterByQuery(result, params.query);
  }

  return sortProjects(result, params.sort);
};

const isInDateRange = (
  project: CvProject,
  from: string | null,
  to: string | null,
): boolean => {
  const projectStart = Date.parse(project.startDate);
  const projectEnd = project.endDate ? Date.parse(project.endDate) : Date.now();
  const fromTime = from ? Date.parse(from) : -Infinity;
  const toTime = to ? Date.parse(to) : Infinity;
  return projectEnd >= fromTime && projectStart <= toTime;
};

const filterByQuery = (projects: CvProject[], query: string): CvProject[] => {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return projects;

  return projects.filter((project) => {
    const haystack = buildHaystack(project);
    return terms.every((term) => haystack.includes(term));
  });
};

const buildHaystack = (project: CvProject): string => {
  const descriptionText = project.description.rich_text
    .map((c) => c.plain_text)
    .join(" ");
  const kpisText = project.kpis.rich_text.map((c) => c.plain_text).join(" ");
  const clientNames = project.clients.map((c) => c.name).join(" ");
  return [
    project.name,
    descriptionText,
    kpisText,
    clientNames,
    project.tools.join(" "),
    project.industries.join(" "),
    project.experiences.join(" "),
    project.languages.join(" "),
    project.projectType,
    project.workplace,
  ]
    .join(" ")
    .toLowerCase();
};

const sortProjects = (projects: CvProject[], order: SortOrder): CvProject[] => {
  const sorted = [...projects];
  switch (order) {
    case "wow":
      return sorted.sort((a, b) => {
        if (b.wowFactor !== a.wowFactor) return b.wowFactor - a.wowFactor;
        return compareEndDateDesc(a, b);
      });
    case "date":
      return sorted.sort((a, b) => {
        const endDiff = compareEndDateDesc(a, b);
        if (endDiff !== 0) return endDiff;
        return Date.parse(b.startDate) - Date.parse(a.startDate);
      });
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
};

const compareEndDateDesc = (a: CvProject, b: CvProject): number => {
  if (a.endDate === null && b.endDate === null) return 0;
  if (a.endDate === null) return -1;
  if (b.endDate === null) return 1;
  return Date.parse(b.endDate) - Date.parse(a.endDate);
};
