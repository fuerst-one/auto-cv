/* eslint-disable @next/next/no-img-element */
import { CvProject } from "@/server/notion/getCvProjects";
import { Slideshow } from "./Slideshow";
import { FormattedDate } from "../FormattedDate";
import { getJsxFormattedTextFromTextBlock } from "../Projects/getJsxFormattedTextFromTextBlock";
import { Badge } from "../ui/badge";

export const ProjectCard = ({ project }: { project: CvProject }) => {
  const {
    name,
    logo,
    websiteUrl,
    githubUrl,
    startDate,
    endDate,
    clients,
    screenshots,
  } = project;

  return (
    <div key={project.id} className="rounded-lg border p-4">
      <div className="mb-2 flex h-8 items-center justify-between gap-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          {name}
        </h3>
        {!!logo?.length && (
          <img
            src={logo[0] || "/logo.svg"}
            alt={`${name} logo`}
            className="h-full w-auto object-contain"
          />
        )}
      </div>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            {clients.map((client, idx) => (
              <Badge key={idx}>{client.name}</Badge>
            ))}
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            <FormattedDate date={startDate} /> -{" "}
            <FormattedDate date={endDate} />
          </div>
        </div>
        {(websiteUrl || githubUrl) && (
          <div className="text-right">
            {websiteUrl && (
              <a
                href={websiteUrl}
                className="block"
                target="_blank"
                rel="noopener noreferrer"
              >
                {websiteUrl}
              </a>
            )}
            {githubUrl && (
              <a
                href={githubUrl}
                className="block"
                target="_blank"
                rel="noopener noreferrer"
              >
                {githubUrl}
              </a>
            )}
          </div>
        )}
      </div>
      {!!screenshots?.length && <Slideshow images={screenshots} />}
      <p className="mb-4 mt-4 text-green-700 dark:text-green-300">
        {getJsxFormattedTextFromTextBlock(project.kpis)}
      </p>
      <p className="mb-4 text-lg text-gray-700 dark:text-gray-300">
        {getJsxFormattedTextFromTextBlock(project.description)}
      </p>
      <div className="text-xs">
        <h4 className="mb-1 text-gray-400 dark:text-gray-600">Experiences:</h4>
        <div className="mb-2 flex flex-wrap gap-1">
          {project.experiences.map((experience, idx) => (
            <Badge key={idx}>{experience}</Badge>
          ))}
        </div>
        <h4 className="mb-1 text-gray-400 dark:text-gray-600">Tools:</h4>
        <div className="mb-2 flex flex-wrap gap-1">
          {project.tools.map((tool, idx) => (
            <Badge key={idx}>{tool}</Badge>
          ))}
        </div>
        <h4 className="mb-1 text-gray-400 dark:text-gray-600">Languages:</h4>
        <div className="mb-2 flex flex-wrap gap-1">
          {project.languages.map((language, idx) => (
            <Badge key={idx}>{language}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
