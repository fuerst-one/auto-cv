import { Layout } from "@/components/Layout";
import { ProjectCard } from "@/components/Projects/ProjectCard";
import { CvProject, getCvProjects } from "@/server/notion/getCvProjects";
import {
  FilterParams,
  filterProjects,
} from "@/components/Projects/Filter/filterProjects";
import { ProjectFilters } from "@/components/Projects/Filter/ProjectFilters";
import { ProjectCollapse } from "@/components/Projects/ProjectCollapse";
import Link from "next/link";
import { FilterConfig } from "@/components/Projects/Filter/types";
import { getClaim } from "@/components/Projects/getClaim";
import { DevLog } from "@/components/DevLog";

const SLICE_DEFAULT = 10;

type SearchParams = Partial<Record<keyof CvProject, string>>;

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const projects = await getCvProjects();

  const filterConfigs: FilterConfig[] = [
    { projectKey: "projectType", label: "Project Types", displayType: "pie" },
    { projectKey: "industries", label: "Industries", displayType: "progress" },
    {
      projectKey: "experiences",
      label: "Experiences",
      displayType: "progress",
    },
    { projectKey: "tools", label: "Tools", displayType: "progress" },
  ];

  const filterParams = {
    ...parseSearchParams(searchParams),
    // Force status filter to be applied
    status: ["Completed", "On Hold", "In Progress"],
  };

  const hasFiltersApplied = Object.entries(searchParams).some(
    ([key, value]) =>
      filterConfigs.find(({ projectKey }) => projectKey === key) && !!value,
  );

  const filteredProjects = filterProjects(projects, filterParams);
  const featuredProjects = filteredProjects.slice(0, SLICE_DEFAULT);
  const otherProjects = filteredProjects.slice(SLICE_DEFAULT);
  const hasOtherProjects = otherProjects.length > 0;

  return (
    <Layout claim={getClaim(filterParams)}>
      <div className="pl-2 pr-2 lg:ml-auto lg:mr-0 lg:w-1/2 lg:pr-8">
        {!hasFiltersApplied && (
          <ProjectFilters projects={projects} filterConfigs={filterConfigs} />
        )}
        <div className="mt-8 text-xs">
          {filteredProjects.length} Projects{" "}
          {hasFiltersApplied && (
            <Link
              href="/"
              className="text-blue-500 hover:underline print:hidden"
            >
              {" "}
              (see all)
            </Link>
          )}
        </div>
        <hr className="my-8" />
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
      <DevLog searchParams={searchParams} />
    </Layout>
  );
}

const parseSearchParams = (searchParams: SearchParams) => {
  return Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [key, value.split(",")]),
  ) as FilterParams;
};
