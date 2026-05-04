"use client";

import { useId, useMemo, useState } from "react";
import { CvProject } from "@/server/notion/getCvProjects";
import { cn } from "@/lib/utils";
import { ProjectGraph3D } from "./ProjectGraph3D";
import { useFiltersStore } from "./filtersStore";
import { filterProjects } from "./Filter/utils";
import { filterConfigs } from "./filterConfigs";
import { FilterConfig } from "./Filter/types";
import { BarChartFilter } from "./Filter/BarChartFilter";
import { PieChartFilter } from "./Filter/PieChartFilter";
import { TreemapFilter } from "./Filter/TreemapFilter";

const GRAPH_TAB_ID = "graph";

type TabId = typeof GRAPH_TAB_ID | string;

export const ProjectAnalysisTabs = ({
  projects,
}: {
  projects: CvProject[];
}) => {
  const [activeTab, setActiveTab] = useState<TabId>(GRAPH_TAB_ID);
  const filterParams = useFiltersStore((s) => s.filters);
  const filteredProjects = useMemo(
    () => filterProjects(projects, filterParams),
    [projects, filterParams],
  );

  const tabListId = useId();
  const tabs: { id: TabId; label: string }[] = [
    { id: GRAPH_TAB_ID, label: "Graph" },
    ...filterConfigs.map((c) => ({ id: c.projectKey, label: c.label })),
  ];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Project analysis"
        className="flex flex-wrap gap-1.5"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${tabListId}-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`${tabListId}-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "-mb-px border px-3 py-1 text-[0.6rem] uppercase tracking-[0.2em] transition",
                isActive
                  ? "border-white bg-white text-black"
                  : "border-white/30 bg-black/40 text-neutral-300 hover:border-white hover:text-white",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${tabListId}-panel-${activeTab}`}
        aria-labelledby={`${tabListId}-tab-${activeTab}`}
        className="relative h-[30vh] w-full overflow-hidden border border-white/30 bg-black/50"
      >
        {activeTab === GRAPH_TAB_ID ? (
          <ProjectGraph3D projects={projects} />
        ) : (
          <ChartTabContent
            filterConfig={getFilterConfig(activeTab)}
            projects={filteredProjects}
          />
        )}
      </div>
    </div>
  );
};

const getFilterConfig = (projectKey: string): FilterConfig | null =>
  filterConfigs.find((c) => c.projectKey === projectKey) ?? null;

const ChartTabContent = ({
  filterConfig,
  projects,
}: {
  filterConfig: FilterConfig | null;
  projects: CvProject[];
}) => {
  if (!filterConfig) return null;

  if (projects.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center px-6 text-xs text-neutral-500">
        Nothing matches this filter — try loosening it.
      </div>
    );
  }

  const { displayType } = filterConfig;
  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {displayType === "bar" && (
          <BarChartFilter filterConfig={filterConfig} projects={projects} />
        )}
        {displayType === "pie" && (
          <PieChartFilter filterConfig={filterConfig} projects={projects} />
        )}
        {displayType === "treemap" && (
          <TreemapFilter filterConfig={filterConfig} projects={projects} />
        )}
      </div>
    </div>
  );
};
