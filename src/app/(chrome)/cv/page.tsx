import { Layout } from "@/components/Layout";
import { ProjectsClientView } from "@/components/Cv/Projects/ProjectsClientView";
import { LogoMarquee } from "@/components/Cv/Projects/LogoMarquee";
import { getCachedCvProjects } from "@/server/notion/getCachedCvProjects";
import { getCachedCvOwnerPublic } from "@/server/notion/getCachedCvOwner";
import { Intro } from "@/components/Cv/Intro";
import { OwnerFacts } from "@/components/Cv/OwnerFacts";
import { getClaim } from "@/components/Cv/Projects/getClaim";
import {
  ProjectSearchParams,
  parseProjectSearchParams,
} from "@/components/Cv/Projects/parseSearchParams";
import { ProjectAnalysisPanel } from "@/components/Cv/Projects/Filter/ProjectAnalysisPanel";

export const revalidate = false;

export default async function Cv({
  searchParams,
}: {
  searchParams: Promise<ProjectSearchParams>;
}) {
  const [projects, owner] = await Promise.all([
    getCachedCvProjects(),
    getCachedCvOwnerPublic(),
  ]);
  const params = await searchParams;
  const filterParams = parseProjectSearchParams(params);

  return (
    <Layout
      sidebarContent={
        <>
          <Intro claim={getClaim(filterParams)} />
          <OwnerFacts owner={owner} />
          <ProjectAnalysisPanel projects={projects} />
        </>
      }
      topContent={<LogoMarquee projects={projects} />}
    >
      <ProjectsClientView projects={projects} initialSearchParams={params} />
    </Layout>
  );
}
