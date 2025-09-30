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
        <span className="text-[0.65rem] font-[var(--font-plex)] uppercase tracking-wide text-emerald-300/80">
          Project Analysis
        </span>
        <p className="text-xs text-slate-400">
          Explore the collaborations, stacks, and outcomes fueling my recent
          work.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex h-[220px] items-center justify-center text-xs text-slate-500">
            Loading analysis…
          </div>
        }
      >
        <ProjectFilters projects={projects} />
      </Suspense>
    </div>
  );
}
