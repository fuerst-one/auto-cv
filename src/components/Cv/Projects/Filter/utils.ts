import { CvProject } from "@/server/notion/getCvProjects";
import countBy from "lodash/countBy";
import { colors } from "../colors";

type FilterKey = keyof Omit<CvProject, "description" | "kpis" | "clients">;
export type FilterParams = Partial<Record<FilterKey, string[]>>;

export const getFilterOptionCounts = (
  projects: CvProject[],
  key: keyof CvProject,
) => {
  const countsByKey = countBy(projects.map((project) => project[key]).flat());
  const countsSorted = Object.entries(countsByKey).sort((a, b) => b[1] - a[1]);
  return countsSorted.map(([itemKey, count]) => ({
    itemKey,
    count,
    color: colors[key]?.[itemKey]?.hex,
  }));
};

export const filterProjects = (
  projects: CvProject[],
  searchParams: FilterParams,
) => {
  return projects.filter((project) => {
    return Object.keys(searchParams).every((_key) => {
      const key = _key as FilterKey;
      const searchValues = searchParams[key];
      if (!searchValues?.length) {
        return true;
      }
      return getIsMatchingProject(project[key], searchValues);
    });
  });
};

const getIsMatchingProject = (
  projectValue: CvProject[FilterKey],
  searchValues: string[],
) => {
  return searchValues.some((searchValue) => {
    if (Array.isArray(projectValue)) {
      return projectValue.some((projectValue) => {
        return compareValues(projectValue, searchValue);
      });
    }
    return compareValues(projectValue, searchValue);
  });
};

const compareValues = (
  projectValue: string | number | boolean | null,
  searchValue: string,
) => {
  return (
    projectValue &&
    projectValue.toString().toLowerCase() === searchValue.toLowerCase()
  );
};
