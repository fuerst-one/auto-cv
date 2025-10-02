import { Layout } from "@/components/Layout";
import { ProjectsClientView } from "@/components/Projects/ProjectsClientView";
import { LogoMarquee } from "@/components/Projects/LogoMarquee";
import { getCvProjects } from "@/server/notion/getCvProjects";
import { Intro } from "@/components/Intro";
import { getClaim } from "@/components/Projects/getClaim";
import {
  ProjectSearchParams,
  parseProjectSearchParams,
} from "@/components/Projects/parseSearchParams";
import { ProjectAnalysisPanel } from "@/components/Projects/Filter/ProjectAnalysisPanel";

// Revalidate content every hour
export const revalidate = 3600;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<ProjectSearchParams>;
}) {
  const projects = await getCvProjects();
  const params = await searchParams;
  const filterParams = parseProjectSearchParams(params);

  return (
    <Layout
      sidebarContent={
        <>
          <Intro claim={getClaim(filterParams)} />
          <ProjectAnalysisPanel projects={projects} />
        </>
      }
      topContent={<LogoMarquee projects={projects} />}
    >
      <ProjectsClientView projects={projects} initialSearchParams={params} />
    </Layout>
  );
}
