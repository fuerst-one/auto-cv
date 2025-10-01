import { Layout } from "@/components/Layout";
import { ProjectsClientView } from "@/components/Projects/ProjectsClientView";
import { LogoMarquee } from "@/components/Projects/LogoMarquee";
import { getProjectLogoSources } from "@/components/Projects/getProjectLogoSources";
import { getCvProjects } from "@/server/notion/getCvProjects";
import { Intro } from "@/components/Intro";
import { getClaim } from "@/components/Projects/getClaim";
import {
  ProjectSearchParams,
  parseProjectSearchParams,
} from "@/components/Projects/parseSearchParams";
import { ProjectAnalysisPanel } from "@/components/Projects/Filter/ProjectAnalysisPanel";

// Client-side filtering handles slicing

export default async function Home({
  searchParams,
}: {
  searchParams: ProjectSearchParams;
}) {
  const projects = await getCvProjects();
  const filterParams = parseProjectSearchParams(searchParams);

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
      <ProjectsClientView
        projects={projects}
        initialSearchParams={searchParams}
      />
    </Layout>
  );
}
