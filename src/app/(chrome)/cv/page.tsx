import { Layout } from "@/components/Layout";
import { ProjectsClientView } from "@/components/Cv/Projects/ProjectsClientView";
import { LogoMarquee } from "@/components/Cv/Projects/LogoMarquee";
import { getCachedCvProjects } from "@/server/notion/getCachedCvProjects";
import { getCachedCvOwnerPublic } from "@/server/notion/getCachedCvOwner";
import { Intro } from "@/components/Cv/Intro";
import { OwnerFacts } from "@/components/Cv/OwnerFacts";

export const revalidate = false;

export default async function Cv() {
  const [projects, owner] = await Promise.all([
    getCachedCvProjects(),
    getCachedCvOwnerPublic(),
  ]);

  return (
    <Layout
      sidebarContent={
        <>
          <Intro />
          <LogoMarquee projects={projects} />
          <OwnerFacts owner={owner} />
        </>
      }
    >
      <ProjectsClientView projects={projects} />
    </Layout>
  );
}
