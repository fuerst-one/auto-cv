import { Suspense } from "react";
import { CvProject } from "@/server/notion/getCvProjects";
import { ProjectFilters } from "./ProjectFilters";

export function ProjectAnalysisPanel({ projects }: { projects: CvProject[] }) {
  if (!projects?.length) {
    return null;
  }

  return (
    <div className="space-y-3 print:hidden">
      <div className="space-y-1">
        <span className="text-[0.65rem] uppercase tracking-[0.3em] text-neutral-400">
          Project Breakdown
        </span>
      </div>
      <Suspense
        fallback={
          <div className="flex h-[220px] items-center justify-center text-xs text-neutral-500">
            Loading analysis…
          </div>
        }
      >
        <ProjectFilters projects={projects} />
      </Suspense>
    </div>
  );
}
