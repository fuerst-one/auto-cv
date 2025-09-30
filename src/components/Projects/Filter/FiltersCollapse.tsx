"use client";

import React, { useState } from "react";
import { ProjectFilters } from "./ProjectFilters";
import { CvProject } from "@/server/notion/getCvProjects";

export const FiltersCollapse = ({ projects }: { projects: CvProject[] }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  if (!projects) {
    return null;
  }

  return (
    <div>
      <button
        type="button"
        className="mb-6 w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-[var(--font-plex)] uppercase tracking-[0.2em] text-slate-200 transition hover:border-emerald-400/50 hover:text-white print:hidden"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? "Show" : "Hide"} analysis and filters
      </button>
      {!isCollapsed ? (
        <>
          <h2 className="hidden">Overview of my work experience</h2>
          <p className="mb-4 font-[var(--font-plex)] text-xs uppercase tracking-[0.16em] text-slate-400">
            Try clicking on something below to filter
          </p>
          <ProjectFilters projects={projects} />
          <hr className="my-10 border-white/10" />
        </>
      ) : null}
    </div>
  );
};
