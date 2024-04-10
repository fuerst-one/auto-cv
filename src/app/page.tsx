import Link from "next/link";
import { Layout } from "@/components/Layout";
import { ProjectCard } from "@/components/Projects/ProjectCard";
import { CvProject, getCvProjects } from "@/server/notion/getCvProjects";
import {
  FilterParams,
  filterProjects,
} from "@/components/Projects/Filter/utils";
import { ProjectFilters } from "@/components/Projects/Filter/ProjectFilters";
import { ProjectCollapse } from "@/components/Projects/ProjectCollapse";
import { FilterConfig } from "@/components/Projects/Filter/types";
import { Intro } from "@/components/Intro";
import { getClaim } from "@/components/Projects/getClaim";

const SLICE_DEFAULT = 8;

type SearchParams = Partial<Record<keyof CvProject, string>>;

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const projects = await getCvProjects();

  const filterConfigs: FilterConfig[] = [
    {
      label: "Areas of expertise",
      projectKey: "experiences",
      displayType: "treemap",
    },
    {
      label: "Clients' industries",
      projectKey: "industries",
      displayType: "treemap",
    },
    {
      label: "Tools used in projects",
      projectKey: "tools",
      displayType: "bar",
    },
    {
      label: "Project types",
      projectKey: "projectType",
      displayType: "pie",
    },
  ];

  const filterParams = parseSearchParams(searchParams);

  const firstFilterApplied = Object.entries(searchParams).find(
    ([key, value]) =>
      filterConfigs.find(({ projectKey }) => projectKey === key) && value,
  )?.[1];
  const hasFiltersApplied = !!firstFilterApplied;

  const filteredProjects = filterProjects(projects, filterParams);
  const featuredProjects = filteredProjects.slice(0, SLICE_DEFAULT);
  const otherProjects = filteredProjects.slice(SLICE_DEFAULT);
  const hasOtherProjects = otherProjects.length > 0;

  return (
    <Layout sidebarContent={<Intro claim={getClaim(filterParams)} />}>
      <div className="pl-2 pr-2 lg:pl-4 lg:pr-4">
        {!hasFiltersApplied && (
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-bold">
              Overview of my work experience
            </h2>
            <ProjectFilters projects={projects} filterConfigs={filterConfigs} />
            <hr className="my-8" />
          </div>
        )}
        <div className="mb-4 text-2xl font-bold">
          <h2 className="inline">
            {filteredProjects.length} carefully curated
            {firstFilterApplied ? ` "${firstFilterApplied}"` : ""} projects{" "}
          </h2>
          <p className="inline">
            {hasFiltersApplied ? (
              <Link
                href="/"
                className="text-sm text-blue-500 hover:underline print:hidden"
              >
                (see all)
              </Link>
            ) : (
              <span className="text-sm text-gray-500">
                - try clicking on something above to filter
              </span>
            )}
          </p>
        </div>
        <div className="space-y-8">
          {featuredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              compact={!hasFiltersApplied}
            />
          ))}
          {hasOtherProjects && (
            <ProjectCollapse>
              {otherProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  compact={!hasFiltersApplied}
                />
              ))}
            </ProjectCollapse>
          )}
        </div>
      </div>
    </Layout>
  );
}

const parseSearchParams = (searchParams: SearchParams) => {
  return Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [key, value.split(",")]),
  ) as FilterParams;
};
