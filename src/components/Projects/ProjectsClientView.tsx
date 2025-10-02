"use client";

import { useMemo } from "react";
import { CvProject } from "@/server/notion/getCvProjects";
import { FilterSqlConsole } from "./Filter/FilterSqlConsole";
import { ProjectCard } from "./ProjectCard";
import { ProjectCollapse } from "./ProjectCollapse";
import { ProjectSearchParams } from "./parseSearchParams";
import { filterProjects } from "./Filter/utils";
import { filterConfigs } from "./filterConfigs";
import { FiltersUrlSync } from "./FiltersUrlSync";
import { useFiltersStore } from "./filtersStore";

const SLICE_DEFAULT = 8;

export function ProjectsClientView({
  projects,
  initialSearchParams,
}: {
  projects: CvProject[];
  initialSearchParams: ProjectSearchParams;
}) {
  const filterParams = useFiltersStore((s) => s.filters);
  const filteredProjects = useMemo(
    () => filterProjects(projects, filterParams),
    [projects, filterParams],
  );

  const firstFilterApplied = useMemo(() => {
    const entries = Object.entries(filterParams);
    for (const [key, values] of entries) {
      const isKnownKey = !!filterConfigs.find(
        ({ projectKey }) => projectKey === key,
      );
      if (isKnownKey && values?.length) {
        return values[0];
      }
    }
    return undefined;
  }, [filterParams]);

  const descriptor =
    firstFilterApplied && firstFilterApplied !== "true"
      ? firstFilterApplied
      : "featured";

  const featuredProjects = filteredProjects.slice(0, SLICE_DEFAULT);
  const otherProjects = filteredProjects.slice(SLICE_DEFAULT);
  const hasOtherProjects = otherProjects.length > 0;

  return (
    <div className="pl-1 pr-1 lg:pl-4 lg:pr-4">
      <FiltersUrlSync initialSearchParams={initialSearchParams} />
      <div className="mb-12 space-y-5">
        <span className="text-[0.65rem] font-[var(--font-plex)] uppercase tracking-wide text-emerald-300/80">
          Project Index
        </span>
        <h2 className="text-3xl font-semibold text-white">
          {filteredProjects.length} {descriptor} projects, curated for impact
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
          Explore a curated collection of recent projects, each showcasing
          thoughtful design and technical depth. Use the analysis tools to
          filter, compare, and discover the collaborations, technologies, and
          results that drive real impact.
        </p>
        <div className="pt-2">
          <div className="space-y-4">
            <FilterSqlConsole filterParams={filterParams} projects={projects} />
          </div>
        </div>
      </div>
      <div className="space-y-8">
        {featuredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
        {hasOtherProjects && (
          <ProjectCollapse>
            {otherProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </ProjectCollapse>
        )}
      </div>
    </div>
  );
}
