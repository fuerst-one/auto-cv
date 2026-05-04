"use client";

import { useMemo } from "react";
import { CvProject } from "@/server/notion/getCvProjects";
import { FilterSqlConsole } from "./Filter/FilterSqlConsole";
import { ProjectCard } from "./ProjectCard";
import { ProjectCollapse } from "./ProjectCollapse";
import { filterProjects } from "./Filter/utils";
import { FiltersUrlSync } from "./FiltersUrlSync";
import { useFiltersStore } from "./filtersStore";
import { CV_PRESETS, findActivePreset, normalizeFilters } from "../cvPresets";
import { ProjectAnalysisTabs } from "./ProjectAnalysisTabs";
import { ProjectFocusUrlSync } from "./ProjectFocusUrlSync";
import { useProjectFocusStore } from "./projectFocusStore";
import { FaArrowLeft } from "@react-icons/all-files/fa/FaArrowLeft";

const SLICE_DEFAULT = 8;

export function ProjectsClientView({ projects }: { projects: CvProject[] }) {
  const filterParams = useFiltersStore((s) => s.filters);
  const focusedId = useProjectFocusStore((s) => s.focusedProjectId);
  const setFocused = useProjectFocusStore((s) => s.setFocusedProjectId);
  const setHovered = useProjectFocusStore((s) => s.setHoveredProjectId);

  const filteredProjects = useMemo(
    () => filterProjects(projects, filterParams),
    [projects, filterParams],
  );

  const focusedProject = useMemo(
    () => (focusedId ? projects.find((p) => p.id === focusedId) : null),
    [projects, focusedId],
  );

  const headline = useMemo(() => {
    if (filteredProjects.length === 0) {
      return "Nothing matches this filter — try loosening it.";
    }
    const activePresetId = findActivePreset(normalizeFilters(filterParams));
    if (activePresetId) {
      return CV_PRESETS[activePresetId].headline;
    }
    return `${filteredProjects.length} projects matching your filter.`;
  }, [filteredProjects.length, filterParams]);

  const featuredProjects = filteredProjects.slice(0, SLICE_DEFAULT);
  const otherProjects = filteredProjects.slice(SLICE_DEFAULT);
  const hasOtherProjects = otherProjects.length > 0;

  return (
    <>
      <FiltersUrlSync />
      <ProjectFocusUrlSync />
      <div className="pl-1 pr-1 lg:pl-4 lg:pr-4">
        <div className="mb-8">
          <FilterSqlConsole filterParams={filterParams} projects={projects} />
        </div>
        <div className="mb-8">
          <ProjectAnalysisTabs projects={projects} />
        </div>
        {focusedProject ? (
          <FocusedProjectView
            project={focusedProject}
            onBack={() => setFocused(null)}
          />
        ) : (
          <>
            <div className="mb-12 space-y-5">
              <h2 className="text-3xl font-semibold text-white">{headline}</h2>
              <p className="max-w-2xl text-sm leading-relaxed text-neutral-400">
                Explore a curated collection of recent projects, each showcasing
                thoughtful design and technical depth. Use the analysis tools to
                filter, compare, and discover the collaborations, technologies,
                and results that drive real impact.
              </p>
            </div>
            <div className="space-y-8">
              {featuredProjects.map((project) => (
                <ProjectCardWithHover
                  key={project.id}
                  project={project}
                  onHoverChange={(hovered) =>
                    setHovered(hovered ? project.id : null)
                  }
                />
              ))}
              {hasOtherProjects && (
                <ProjectCollapse>
                  {otherProjects.map((project) => (
                    <ProjectCardWithHover
                      key={project.id}
                      project={project}
                      onHoverChange={(hovered) =>
                        setHovered(hovered ? project.id : null)
                      }
                    />
                  ))}
                </ProjectCollapse>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

const ProjectCardWithHover = ({
  project,
  onHoverChange,
}: {
  project: CvProject;
  onHoverChange: (hovered: boolean) => void;
}) => (
  <div
    onPointerEnter={() => onHoverChange(true)}
    onPointerLeave={() => onHoverChange(false)}
  >
    <ProjectCard project={project} />
  </div>
);

const FocusedProjectView = ({
  project,
  onBack,
}: {
  project: CvProject;
  onBack: () => void;
}) => (
  <div className="space-y-6">
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-2 border border-white/30 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.2em] text-neutral-200 transition hover:border-white hover:text-white"
    >
      <FaArrowLeft className="text-xs" />
      Back to filter
    </button>
    <ProjectCard project={project} />
  </div>
);
