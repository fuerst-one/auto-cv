"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { FaExternalLinkAlt } from "@react-icons/all-files/fa/FaExternalLinkAlt";
import { FaGithub } from "@react-icons/all-files/fa/FaGithub";
import { FaChartLine } from "@react-icons/all-files/fa/FaChartLine";
import { FaTimes } from "@react-icons/all-files/fa/FaTimes";
import Link from "next/link";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import { CvProject } from "@/server/notion/getCvProjects";
import { ProjectScreenshots } from "./ProjectScreenshots";
import { ProjectMetaTable } from "./ProjectMetaTable";
import { getJsxFormattedTextFromTextBlock } from "./getJsxFormattedTextFromTextBlock";
import { getProjectLogoSources } from "./getProjectLogoSources";
import { colors } from "./colors";
import { useProjectFocusStore } from "./projectFocusStore";
import { cn } from "@/lib/utils";

dayjs.extend(duration);
dayjs.extend(relativeTime);

export const ProjectDetailDialog = ({
  projects,
}: {
  projects: CvProject[];
}) => {
  const focusedId = useProjectFocusStore((s) => s.focusedProjectId);
  const setFocused = useProjectFocusStore((s) => s.setFocusedProjectId);
  const project = focusedId
    ? (projects.find((p) => p.id === focusedId) ?? null)
    : null;

  const isOpen = !!project;

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setFocused(null);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[101] flex max-h-[90vh] w-[min(64rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col border border-white/30 bg-black text-neutral-100 shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          aria-describedby={undefined}
        >
          {project ? (
            <ProjectDetailContent project={project} />
          ) : (
            <Dialog.Title className="sr-only">Project details</Dialog.Title>
          )}
          <Dialog.Close
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center border border-white/30 bg-black/60 text-neutral-200 transition hover:border-white hover:text-white focus-visible:border-white focus-visible:text-white focus-visible:outline-none"
            aria-label="Close project details"
          >
            <FaTimes className="text-base" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const ProjectDetailContent = ({ project }: { project: CvProject }) => {
  const {
    name,
    projectType,
    websiteUrl,
    githubUrl,
    startDate,
    endDate,
    screenshots,
  } = project;

  const description = getJsxFormattedTextFromTextBlock(project.description);
  const kpis = getJsxFormattedTextFromTextBlock(project.kpis);
  const logos = getProjectLogoSources(project);
  const primaryLogo = logos[0];
  const color = colors.projectType?.[projectType];

  return (
    <div className="flex max-h-[90vh] flex-col">
      <div className="space-y-3 border-b border-white/15 p-6">
        <div className="-mt-2 flex items-center justify-between gap-3 pr-12">
          <span
            className={cn(
              "inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.2em]",
              color?.text,
            )}
          >
            <span
              className={cn(
                "inline-block size-2 shrink-0 rounded-[50%] border",
                color?.background,
                color?.border,
              )}
            />
            {projectType}
          </span>
          {primaryLogo && (
            <div className="flex h-9 shrink-0 items-center justify-center border border-white/30 bg-white/20 px-3 text-neutral-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={primaryLogo}
                alt={`${name} logo`}
                className="h-5 w-auto object-contain grayscale [mix-blend-mode:screen]"
                loading="lazy"
              />
            </div>
          )}
        </div>
        <Dialog.Title className="text-3xl font-semibold text-white">
          {name}
        </Dialog.Title>
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {screenshots && screenshots.length > 0 && (
          <ProjectScreenshots screenshots={screenshots} projectName={name} />
        )}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-neutral-400">
            <DateRange startDate={startDate} endDate={endDate} />
          </span>
          {websiteUrl && (
            <Link
              href={websiteUrl}
              target="_blank"
              className="inline-flex items-center gap-2 border border-white/30 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-neutral-200 transition hover:border-white hover:text-white"
            >
              Website
              <FaExternalLinkAlt className="text-xs" />
            </Link>
          )}
          {githubUrl && (
            <Link
              href={githubUrl}
              target="_blank"
              className="inline-flex items-center gap-2 border border-white/30 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-neutral-200 transition hover:border-white hover:text-white"
            >
              GitHub
              <FaGithub className="text-xs" />
            </Link>
          )}
        </div>
        {kpis && (
          <div className="flex items-start gap-2 text-sm text-white">
            <FaChartLine className="mt-1 shrink-0 text-base" />
            <span>{kpis}</span>
          </div>
        )}
        {description && (
          <div className="space-y-2 text-sm leading-relaxed text-neutral-200">
            {description}
          </div>
        )}
        <ProjectMetaTable project={project} />
      </div>
    </div>
  );
};

const DateRange = ({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string | null;
}) => {
  const startDateObj = dayjs(startDate);
  let endDateObj = endDate ? dayjs(endDate) : dayjs();
  if (endDateObj.isAfter(dayjs())) {
    endDateObj = dayjs();
  }
  const durationLabel = dayjs
    .duration(endDateObj.diff(startDateObj))
    .humanize();
  const startDateFormatted = startDateObj.format("YYYY/MM");
  const endDateFormatted = endDateObj.format("YYYY/MM");

  if (startDateFormatted === endDateFormatted) {
    return (
      <span>
        {startDateFormatted} · {durationLabel}
      </span>
    );
  }

  return (
    <span>
      {startDateFormatted} – {endDateFormatted} · {durationLabel}
    </span>
  );
};
