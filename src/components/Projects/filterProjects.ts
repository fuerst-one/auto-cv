import { CvProject } from "@/server/notion/getCvProjects";

type FilterKey = keyof Omit<CvProject, "description" | "kpis" | "clients">;
export type FilterParams = Partial<Record<FilterKey, string[]>>;

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
