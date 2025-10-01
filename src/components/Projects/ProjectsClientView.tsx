"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CvProject } from "@/server/notion/getCvProjects";
import { FilterSqlConsole } from "./Filter/FilterSqlConsole";
import { ProjectCard } from "./ProjectCard";
import { ProjectCollapse } from "./ProjectCollapse";
import { ProjectSearchParams } from "./parseSearchParams";
import { filterProjects, FilterParams } from "./Filter/utils";
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
  const hasUserFilters = Object.keys(filterParams).length > 0;
  const effectiveFilterParams: FilterParams = useMemo(() => {
    return hasUserFilters
      ? filterParams
      : { ...filterParams, featured: ["true"] };
  }, [filterParams, hasUserFilters]);

  const filteredProjects = useMemo(
    () => filterProjects(projects, effectiveFilterParams),
    [projects, effectiveFilterParams],
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
    return undefined as string | undefined;
  }, [filterParams]);

  const descriptor =
    firstFilterApplied && firstFilterApplied !== "true"
      ? firstFilterApplied
      : "signature";

  const featuredProjects = filteredProjects.slice(0, SLICE_DEFAULT);
  const otherProjects = filteredProjects.slice(SLICE_DEFAULT);
  const hasOtherProjects = otherProjects.length > 0;
  const hasFiltersApplied = !!firstFilterApplied;

  return (
    <div className="pl-1 pr-1 lg:pl-4 lg:pr-4">
      <FiltersUrlSync initialSearchParams={initialSearchParams} />
      <div className="mb-12 space-y-5">
        <span className="text-[0.65rem] font-[var(--font-plex)] uppercase tracking-wide text-emerald-300/80">
          Project Index
        </span>
        <h2 className="text-3xl font-semibold text-white">
          {filteredProjects.length} {descriptor} projects, handcrafted for
          momentum
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
          Every entry is a blend of systems thinking and generative aesthetics,
          surfaced by recency. Use the analysis tools to remix the view and dive
          deeper into the collaborations, stacks, and outcomes that matter to
          you.
        </p>
        <div className="pt-2">
          <div className="space-y-4">
            <FilterSqlConsole
              filterParams={effectiveFilterParams}
              projects={projects}
            />
          </div>
        </div>
        {hasFiltersApplied && (
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-sm font-[var(--font-plex)] uppercase tracking-wide text-emerald-300 transition hover:text-white print:hidden"
          >
            Reset filters
          </Link>
        )}
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
