import Link from "next/link";
import { Layout } from "@/components/Layout";
import { ProjectCard } from "@/components/Projects/ProjectCard";
import { getCvProjects } from "@/server/notion/getCvProjects";
import { filterProjects } from "@/components/Projects/Filter/utils";
import { ProjectCollapse } from "@/components/Projects/ProjectCollapse";
import { Intro } from "@/components/Intro";
import { getClaim } from "@/components/Projects/getClaim";
import { FiltersCollapse } from "@/components/Projects/Filter/FiltersCollapse";
import {
  ProjectSearchParams,
  parseProjectSearchParams,
} from "@/components/Projects/parseSearchParams";
import { filterConfigs } from "@/components/Projects/filterConfigs";

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
  const filteredProjects = filterProjects(projects, {
    ...filterParams,
    ...(!Object.keys(filterParams).length && { featured: ["true"] }),
  });
  const featuredProjects = filteredProjects.slice(0, SLICE_DEFAULT);
  const otherProjects = filteredProjects.slice(SLICE_DEFAULT);
  const hasOtherProjects = otherProjects.length > 0;

  return (
    <Layout sidebarContent={<Intro claim={getClaim(filterParams)} />}>
      <div className="pl-2 pr-2 lg:pl-4 lg:pr-4">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">
            My {filteredProjects.length} most interesting
            {firstFilterApplied ? ` "${firstFilterApplied}"` : ""} projects{" "}
            sorted by most recent
          </h2>
          {!hasFiltersApplied && (
            <div className="my-4">
              <FiltersCollapse projects={projects} />
            </div>
          )}
          <p className="text-sm">
            {hasFiltersApplied && (
              <Link
                href="/"
                className="text-blue-500 hover:underline print:hidden"
              >
                See all projects
              </Link>
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
