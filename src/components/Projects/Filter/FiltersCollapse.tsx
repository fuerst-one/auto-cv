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
        className="mb-4 w-full rounded border px-2 py-1 text-center hover:bg-gray-100 print:hidden"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? "Show" : "Hide"} analysis and filters
      </button>
      {!isCollapsed ? (
        <>
          <h2 className="hidden">Overview of my work experience</h2>
          <p className="mb-2 text-gray-500">
            Try clicking on something below to filter
          </p>
          <ProjectFilters projects={projects} />
          <hr className="my-8" />
        </>
      ) : null}
    </div>
  );
};
