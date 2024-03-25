import { Layout } from "@/components/Layout";
import { ProjectCard } from "@/components/Projects/ProjectCard";
import { CvProject, getCvProjects } from "@/server/notion/getCvProjects";
import { getProjectFilter } from "@/components/Projects/getProjectFilter";
import countBy from "lodash/countBy";
import {
  FilterOption,
  ProjectFilter,
} from "@/components/Projects/ProjectFilter";
import { ProjectCollapse } from "@/components/Projects/ProjectCollapse";

export default async function Home({
  searchParams,
}: {
  searchParams: Record<keyof CvProject, string | string[]>;
}) {
  const projects = await getCvProjects();

  const filterLabels: Partial<Record<keyof CvProject, string>> = {
    projectType: "Project Types",
    industries: "Industries",
    experiences: "Experiences",
    tools: "Tools",
  };

  const filterOptions: FilterOption[] = Object.entries(filterLabels).map(
    ([projectKey, label]) => ({
      label,
      projectKey: projectKey as keyof CvProject,
      itemCounts: getFilterOptionCounts(
        projects,
        projectKey as keyof CvProject,
      ),
    }),
  );

  const hasFiltersApplied = Object.entries(searchParams).some(
    ([key, value]) => key in filterLabels && !!value,
  );

  const filterProject = getProjectFilter({
    ...searchParams,
    status: ["Completed", "On Hold", "In Progress"],
  });

  const filteredProjects = projects.filter(filterProject);
  const featuredProjects = filteredProjects.slice(0, 10);
  const otherProjects = filteredProjects.slice(10);
  const hasOtherProjects = otherProjects.length > 0;

  return (
    <Layout>
      <div className="pl-2 pr-2 lg:ml-auto lg:mr-0 lg:w-1/2 lg:pr-8">
        {!hasFiltersApplied && (
          <>
            <div className="space-y-4">
              {filterOptions.map((filterOption) => (
                <ProjectFilter
                  key={filterOption.projectKey}
                  filterOption={filterOption}
                />
              ))}
            </div>
            <hr className="my-8" />
          </>
        )}
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

const getFilterOptionCounts = (projects: CvProject[], key: keyof CvProject) => {
  const countsByKey = countBy(projects.map((project) => project[key]).flat());
  const countsSorted = Object.entries(countsByKey).sort((a, b) => b[1] - a[1]);
  return countsSorted.map(([itemKey, count]) => ({ itemKey, count }));
};
