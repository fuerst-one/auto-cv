import React from "react";
import { CvProject } from "@/server/notion/getCvProjects";
import { FilterConfig } from "./types";
import { PieChartFilter } from "./PieChartFilter";
import { BarChartFilter } from "./BarChartFilter";
import { TreemapFilter } from "./TreemapFilter";
import { filterConfigs } from "../filterConfigs";

export const ProjectFilters = ({ projects }: { projects: CvProject[] }) => {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-1">
      {filterConfigs.map((filterConfig) => (
        <div
          key={filterConfig.projectKey}
          className="border border-white/20 bg-black/60 p-3"
        >
          <h2 className="text-md mb-2 text-xs uppercase tracking-[0.3em] text-neutral-300">
            {filterConfig.label}
          </h2>
          <Filter filterConfig={filterConfig} projects={projects} />
        </div>
      ))}
    </div>
  );
};

const Filter = ({
  filterConfig,
  projects,
}: {
  filterConfig: FilterConfig;
  projects: CvProject[];
}) => {
  const { displayType } = filterConfig;
  if (displayType === "bar") {
    return <BarChartFilter filterConfig={filterConfig} projects={projects} />;
  }
  if (displayType === "pie") {
    return <PieChartFilter filterConfig={filterConfig} projects={projects} />;
  }
  if (displayType === "treemap") {
    return <TreemapFilter filterConfig={filterConfig} projects={projects} />;
  }
  return null;
};
