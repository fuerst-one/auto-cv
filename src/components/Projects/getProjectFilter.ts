import { CvProject } from "@/server/notion/getCvProjects";

type FilterKey = keyof Omit<CvProject, "description" | "clients">;

export const getProjectFilter =
  (searchParams: Record<FilterKey, string | string[]>) =>
  (project: CvProject) => {
    return Object.keys(project).every((_key) => {
      const key = _key as FilterKey;
      const searchValues = searchParams[key];
      if (!searchValues) {
        return true;
      }
      const isSearchValueInProjectValue = getIsSearchValueInProjectValue(
        project[key],
      );
      if (Array.isArray(searchValues)) {
        if (searchValues.length === 0) {
          return true;
        }
        return searchValues.some(isSearchValueInProjectValue);
      }
      return isSearchValueInProjectValue(searchValues);
    });
  };

const getIsSearchValueInProjectValue =
  (projectValue: CvProject[FilterKey]) => (searchValue: string) => {
    if (Array.isArray(projectValue)) {
      return projectValue.some((projectValue) => {
        return compareValues(projectValue, searchValue);
      });
    }
    return compareValues(projectValue, searchValue);
  };

const compareValues = (
  projectValue: string | number | boolean | null,
  searchValue: string,
) => {
  return (
    projectValue &&
    encodeURIComponent(projectValue).toLowerCase() === searchValue.toLowerCase()
  );
};
