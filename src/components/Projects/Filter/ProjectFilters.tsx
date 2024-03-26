import React from "react";
import { CvProject } from "@/server/notion/getCvProjects";
import { PieChartFilter } from "./PieChartFilter";
import { ProgressFilter } from "./ProgressFilter";
import { FilterConfig, FilterOption } from "./types";
import countBy from "lodash/countBy";

export const ProjectFilters = ({
  projects,
  filterConfigs,
}: {
  projects: CvProject[];
  filterConfigs: FilterConfig[];
}) => {
  const filterOptions: FilterOption[] = filterConfigs.map(
    ({ label, projectKey, displayType }) => ({
      label,
      projectKey: projectKey as keyof CvProject,
      displayType,
      itemCounts: getFilterOptionCounts(
        projects,
        projectKey as keyof CvProject,
      ),
    }),
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 2xl:grid-cols-4">
      {filterOptions.map(({ projectKey, label, displayType, itemCounts }) => (
        <div key={projectKey}>
          <h2 className="text-md mb-2 font-bold">{label}</h2>
          {displayType === "progress" ? (
            <ProgressFilter projectKey={projectKey} itemCounts={itemCounts} />
          ) : (
            <PieChartFilter projectKey={projectKey} itemCounts={itemCounts} />
          )}
        </div>
      ))}
    </div>
  );
};

const getFilterOptionCounts = (projects: CvProject[], key: keyof CvProject) => {
  const countsByKey = countBy(projects.map((project) => project[key]).flat());
  const countsSorted = Object.entries(countsByKey).sort((a, b) => b[1] - a[1]);
  return countsSorted.map(([itemKey, count]) => ({ itemKey, count }));
};
