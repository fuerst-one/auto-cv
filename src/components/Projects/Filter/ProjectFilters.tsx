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
          className="rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.08),transparent_65%)] p-5 backdrop-blur"
        >
          <h2 className="text-md mb-3 text-xs font-[var(--font-plex)] uppercase tracking-wide text-emerald-200/80">
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
