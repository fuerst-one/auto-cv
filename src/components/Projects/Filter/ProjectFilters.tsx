import React from "react";
import { CvProject } from "@/server/notion/getCvProjects";
import { FilterConfig } from "./types";
import { PieChartFilter } from "./PieChartFilter";
import { BarChartFilter } from "./BarChartFilter";
import { TreemapFilter } from "./TreemapFilter";
import { filterConfigs } from "../filterConfigs";

export const ProjectFilters = ({ projects }: { projects: CvProject[] }) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {filterConfigs.map((filterConfig) => (
        <div
          key={filterConfig.projectKey}
          className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
        >
          <h2 className="text-md mb-4 font-[var(--font-plex)] text-xs uppercase tracking-[0.3em] text-slate-300">
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
