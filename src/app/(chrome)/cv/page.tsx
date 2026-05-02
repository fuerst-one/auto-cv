import { Layout } from "@/components/Layout";
import { ProjectsClientView } from "@/components/Cv/Projects/ProjectsClientView";
import { LogoMarquee } from "@/components/Cv/Projects/LogoMarquee";
import { getCvProjects } from "@/server/notion/getCvProjects";
import { Intro } from "@/components/Cv/Intro";
import { getClaim } from "@/components/Cv/Projects/getClaim";
import {
  ProjectSearchParams,
  parseProjectSearchParams,
} from "@/components/Cv/Projects/parseSearchParams";
import { ProjectAnalysisPanel } from "@/components/Cv/Projects/Filter/ProjectAnalysisPanel";

// Revalidate content every hour
export const revalidate = 3600;

export default async function Cv({
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
