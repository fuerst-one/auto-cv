import Link from "next/link";
import { Layout } from "@/components/Layout";
import { ProjectCard } from "@/components/Projects/ProjectCard";
import { LogoMarquee } from "@/components/Projects/LogoMarquee";
import { getProjectLogoSources } from "@/components/Projects/getProjectLogoSources";
import { getCvProjects } from "@/server/notion/getCvProjects";
import {
  filterProjects,
  FilterParams,
} from "@/components/Projects/Filter/utils";
import { ProjectCollapse } from "@/components/Projects/ProjectCollapse";
import { Intro } from "@/components/Intro";
import { getClaim } from "@/components/Projects/getClaim";
import { FilterSqlConsole } from "@/components/Projects/Filter/FilterSqlConsole";
import {
  ProjectSearchParams,
  parseProjectSearchParams,
} from "@/components/Projects/parseSearchParams";
import { filterConfigs } from "@/components/Projects/filterConfigs";
import { ProjectAnalysisPanel } from "@/components/Projects/Filter/ProjectAnalysisPanel";

const SLICE_DEFAULT = 8;

export default async function Home({
  searchParams,
}: {
  searchParams: ProjectSearchParams;
}) {
  const projects = await getCvProjects();

  const filterParams = parseProjectSearchParams(searchParams);
  const firstFilterApplied = Object.entries(searchParams).find(
    ([key, value]) =>
      filterConfigs.find(({ projectKey }) => projectKey === key) && value,
  )?.[1];
  const hasFiltersApplied = !!firstFilterApplied;
  const hasUserFilters = Object.keys(filterParams).length > 0;
  const effectiveFilterParams: FilterParams = hasUserFilters
    ? filterParams
    : { ...filterParams, featured: ["true"] };
  const filteredProjects = filterProjects(projects, effectiveFilterParams);
  const featuredProjects = filteredProjects.slice(0, SLICE_DEFAULT);
  const otherProjects = filteredProjects.slice(SLICE_DEFAULT);
  const hasOtherProjects = otherProjects.length > 0;
  const descriptor =
    firstFilterApplied && firstFilterApplied !== "true"
      ? firstFilterApplied
      : "signature";

  const marqueeLogos = projects
    .flatMap((project) =>
      getProjectLogoSources(project).map((src) => ({
        src,
        alt: `${project.name} logo`,
      })),
    )
    .filter(
      (logo, index, array) =>
        array.findIndex((candidate) => candidate.src === logo.src) === index,
    );

  return (
    <Layout
      sidebarContent={
        <>
          <Intro claim={getClaim(filterParams)} />
          <ProjectAnalysisPanel projects={projects} />
        </>
      }
      topContent={
        marqueeLogos.length > 0 ? <LogoMarquee logos={marqueeLogos} /> : null
      }
    >
      <div className="pl-1 pr-1 lg:pl-4 lg:pr-4">
        <div className="mb-12 space-y-5">
          <span className="text-[0.65rem] font-[var(--font-plex)] uppercase tracking-wide text-emerald-300/80">
            Project Index
          </span>
          <h2 className="text-3xl font-semibold text-white">
            {filteredProjects.length} {descriptor} projects, handcrafted for
            momentum
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
            Every entry is a blend of systems thinking and generative
            aesthetics, surfaced by recency. Use the analysis tools to remix the
            view and dive deeper into the collaborations, stacks, and outcomes
            that matter to you.
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
    </Layout>
  );
}
