import { Layout } from "@/components/Layout";
import { ProjectCard } from "@/components/Projects/ProjectCard";
import { CvProject, getCvProjects } from "@/server/notion/getCvProjects";
import {
  FilterParams,
  filterProjects,
} from "@/components/Projects/filterProjects";
import countBy from "lodash/countBy";
import {
  FilterOption,
  ProjectFilter,
} from "@/components/Projects/ProjectFilter";
import { ProjectCollapse } from "@/components/Projects/ProjectCollapse";
import Link from "next/link";
import { DevLog } from "@/components/DevLog";

type SearchParams = Partial<Record<keyof CvProject, string>>;

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const projects = await getCvProjects();

  const filterLabels: SearchParams = {
    projectType: "Project Types",
    industries: "Industries",
    experiences: "Experiences",
    tools: "Tools",
  };

  const filterParams = {
    ...parseSearchParams(searchParams),
    status: ["Completed", "On Hold", "In Progress"],
  };

  const hasFiltersApplied = Object.entries(searchParams).some(
    ([key, value]) => key in filterLabels && !!value,
  );

  const filteredProjects = filterProjects(projects, filterParams);

  const filterOptions: FilterOption[] = Object.entries(filterLabels).map(
    ([projectKey, label]) => ({
      label,
      projectKey: projectKey as keyof CvProject,
      itemCounts: getFilterOptionCounts(
        filteredProjects,
        projectKey as keyof CvProject,
      ),
    }),
  );

  const featuredProjects = filteredProjects.slice(0, 10);
  const otherProjects = filteredProjects.slice(10);
  const hasOtherProjects = otherProjects.length > 0;

  return (
    <Layout claim={getClaim(filterParams)}>
      <div className="pl-2 pr-2 lg:ml-auto lg:mr-0 lg:w-1/2 lg:pr-8">
        {!hasFiltersApplied && (
          <div className="grid grid-cols-2 gap-4">
            {filterOptions.map((filterOption) => (
              <ProjectFilter
                key={filterOption.projectKey}
                filterOption={filterOption}
              />
            ))}
          </div>
        )}
        <div className="mt-8 text-xs">
          {filteredProjects.length} Projects{" "}
          {hasFiltersApplied && (
            <Link href="/" className="text-blue-500 hover:underline">
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
      <DevLog projects={countBy(projects, "status")} />
    </Layout>
  );
}

const parseSearchParams = (searchParams: SearchParams) => {
  return Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [key, value.split(",")]),
  ) as FilterParams;
};

const getFilterOptionCounts = (projects: CvProject[], key: keyof CvProject) => {
  const countsByKey = countBy(projects.map((project) => project[key]).flat());
  const countsSorted = Object.entries(countsByKey).sort((a, b) => b[1] - a[1]);
  return countsSorted.map(([itemKey, count]) => ({ itemKey, count }));
};

const getClaim = (filterParams: FilterParams) => {
  const { projectType, experiences } = filterParams;

  if (
    experiences?.includes("UI-Design") ||
    experiences?.includes("UX-Design")
  ) {
    return "Usability first, then conversion, aesthetics after. Dare I can do all at the same time?";
  }
  if (experiences?.includes("Conversion Rate Optimization")) {
    return "I like nudging users and social proof, but how about we test it?";
  }
  if (experiences?.includes("Fronted-Development")) {
    return "Having a design is one thing, making it work is another. Let's make it work, shall we?";
  }
  if (
    experiences?.includes("Backend-Development") ||
    experiences?.includes("Fullstack-Development")
  ) {
    return "I like to make things work, but have you ever used something that works and makes you happy?";
  }
  if (projectType?.includes("Entrepreneurial")) {
    return "Let's get some data, build something beautiful and sell it, shall we?";
  }
  if (projectType?.includes("Freelance")) {
    return "I'm a freelancer, so I am a master of my trades. Want proof?";
  }
  if (projectType?.includes("Pro-Bono / Open Source")) {
    return "I like to share and build things together. Want to join me?";
  }
  return "I like to explore and invent things. Want me to support you?";
};
