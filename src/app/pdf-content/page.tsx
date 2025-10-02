import { getCvProjects } from "@/server/notion/getCvProjects";
import { filterProjects } from "@/components/Projects/Filter/utils";
import { getClaim } from "@/components/Projects/getClaim";
import {
  ProjectSearchParams,
  parseProjectSearchParams,
} from "@/components/Projects/parseSearchParams";
import { Suspense } from "react";
import { ProjectFilters } from "@/components/Projects/Filter/ProjectFilters";
import { ProjectCard } from "@/components/PDF/ProjectCard";
import Image from "next/image";
import { IconLink } from "@/components/IconLink";
import { FaGithub } from "@react-icons/all-files/fa/FaGithub";
import { FaLinkedin } from "@react-icons/all-files/fa/FaLinkedin";
import { FaMap } from "@react-icons/all-files/fa/FaMap";
import { FaEnvelope } from "@react-icons/all-files/fa/FaEnvelope";

export default async function PDFContent({
  searchParams,
}: {
  searchParams: Promise<ProjectSearchParams & { dark: string }>;
}) {
  const projects = await getCvProjects();
  const params = await searchParams;

  if (!projects?.length) {
    throw new Error("No projects found");
  }

  const filterParams = parseProjectSearchParams(params);
  const filteredProjects = filterProjects(projects, {
    ...filterParams,
    ...(!Object.keys(filterParams).length && { featured: ["true"] }),
  });
  const claim = getClaim(filterParams);

  return (
    <div className={params.dark ? "dark bg-gray-950 text-white" : ""}>
      <div className="container mx-auto max-w-screen-lg p-8">
        <header className="mb-24 text-center">
          <Image
            src="/avatar.png"
            alt="Alexander Fuerst"
            width={128}
            height={128}
            className="mx-auto mb-4 mt-12 h-32 w-32"
          />
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">
            Alexander Fuerst
          </h1>
          <p className="mb-6 text-xl text-secondary">Senior UI Engineer</p>
          <p className="text-center text-xl text-gray-600 dark:text-gray-400">
            {claim}
          </p>
        </header>
        <section className="mb-24">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
            The aggregate of my 9 years work experience
          </h2>
          <Suspense fallback={null}>
            <ProjectFilters projects={projects} />
          </Suspense>
        </section>
        <section className="mb-24">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
            My most interesting projects sorted by recency
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard project={project} key={project.id} />
            ))}
          </div>
        </section>
        <section className="mb-24">
          <h2 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Contact
          </h2>
          <table>
            <tbody>
              <tr>
                <td>
                  <IconLink
                    href="https://www.linkedin.com/in/fuerst-one/"
                    icon={FaEnvelope}
                    className="flex-none"
                  >
                    Mail
                  </IconLink>
                </td>
                <td>alexander@fuerst.one</td>
              </tr>
              <tr>
                <td>
                  <IconLink
                    href="https://fuerst.one"
                    icon={FaMap}
                    className="flex-none"
                  >
                    Homepage
                  </IconLink>
                </td>
                <td>https://fuerst.one</td>
              </tr>
              <tr>
                <td>
                  <IconLink
                    href="https://www.linkedin.com/in/fuerst-one/"
                    icon={FaLinkedin}
                    className="flex-none"
                  >
                    LinkedIn
                  </IconLink>
                </td>
                <td>https://www.linkedin.com/in/fuerst-one</td>
              </tr>
              <tr>
                <td>
                  <IconLink
                    href="https://github.com/fuerst-one"
                    icon={FaGithub}
                    className="flex-none"
                  >
                    GitHub
                  </IconLink>
                </td>
                <td>https://github.com/fuerst-one</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
