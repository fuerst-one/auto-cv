import { getJsxFormattedTextFromTextBlock } from "./getJsxFormattedTextFromTextBlock";
import { CvProject } from "@/server/notion/getCvProjects";
import { Tag } from "./Tag";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { FaImage } from "@react-icons/all-files/fa/FaImage";
import { FaExternalLinkAlt } from "@react-icons/all-files/fa/FaExternalLinkAlt";
import { FaChartLine } from "@react-icons/all-files/fa/FaChartLine";
import { FaGithub } from "@react-icons/all-files/fa/FaGithub";
import { ProjectScreenshots } from "./ProjectScreenshots";
import { getProjectLogoSources } from "./getProjectLogoSources";

dayjs.extend(duration);
dayjs.extend(relativeTime);

export const ProjectCard = ({ project }: { project: CvProject }) => {
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

  return (
    <article className="group relative border border-white/30 bg-black/85 p-6 transition hover:border-white">
      <div className="relative flex items-start justify-between gap-4">
        <header className="space-y-3">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.2em] text-neutral-400">
              <span className="h-1 w-1 bg-white" />
              {projectType}
            </span>
            <h3 className="text-2xl font-semibold text-white">{name}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
            <span className="tracking-normal">
              <DateRange startDate={startDate} endDate={endDate} />
            </span>
            {websiteUrl && (
              <Link
                href={websiteUrl}
                target="_blank"
                className="inline-flex items-center gap-2 border border-white/30 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-neutral-200 transition hover:border-white hover:text-white print:ml-0 print:block"
              >
                Website
                <FaExternalLinkAlt className="text-xs print:hidden" />
                <span className="hidden print:inline">: {websiteUrl}</span>
              </Link>
            )}
            {githubUrl && (
              <Link
                href={githubUrl}
                target="_blank"
                className="inline-flex items-center gap-2 border border-white/30 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-neutral-200 transition hover:border-white hover:text-white print:ml-0 print:block"
              >
                GitHub
                <FaGithub className="text-xs print:hidden" />
                <span className="hidden print:inline">: {githubUrl}</span>
              </Link>
            )}
          </div>
        </header>
        <div className="flex shrink-0 items-center justify-center border border-white/30 bg-black px-3 py-2 text-neutral-200 print:hidden">
          {primaryLogo ? (
            <div className="h-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={primaryLogo}
                alt={`${name} logo`}
                className="h-full w-auto object-contain grayscale [mix-blend-mode:screen]"
                loading="lazy"
              />
            </div>
          ) : (
            <FaImage className="text-xl" />
          )}
        </div>
      </div>
      {screenshots && screenshots.length > 0 && (
        <ProjectScreenshots screenshots={screenshots} projectName={name} />
      )}
      {kpis && (
        <div className="relative mt-4 flex items-center gap-2 text-sm text-white">
          <FaChartLine className="text-base" />
          <span>{kpis}</span>
        </div>
      )}
      {description && (
        <div className="mt-4 space-y-2 text-sm leading-relaxed text-neutral-200">
          {description}
        </div>
      )}
      <MetaTable project={project} />
    </article>
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
  const duration = dayjs.duration(endDateObj.diff(startDateObj)).humanize();
  const startDateFormatted = startDateObj.format("YYYY/MM");
  const endDateFormatted = endDateObj.format("YYYY/MM");

  if (startDateFormatted === endDateFormatted) {
    return (
      <span>
        {startDateFormatted} · {duration}
      </span>
    );
  }

  return (
    <span>
      {startDateFormatted} – {endDateFormatted} · {duration}
    </span>
  );
};

const MetaTable = ({ project }: { project: CvProject }) => {
  const rows: Partial<Record<keyof CvProject, string>> = {
    clients: "Clients",
    industries: "Industries",
    experiences: "Experiences",
    tools: "Tools",
    languages: "Languages",
  };

  const filteredFields = Object.entries(rows)
    .filter(([projectKey]) => {
      const value = project[projectKey as keyof CvProject];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== null;
    })
    .map(([key, label]) => ({
      label,
      projectKey: key as keyof CvProject,
      value: project[key as keyof CvProject],
    }));

  return (
    <div className="mt-6 space-y-3 border border-white/20 bg-black/60 p-4 text-sm text-neutral-200">
      {filteredFields.map(({ label, projectKey, value }) => {
        const preview = formatPreviewValue(value);

        return (
          <details
            key={projectKey}
            className="group border border-white/15 bg-black/60 p-3"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left text-[0.7rem] uppercase tracking-[0.3em] text-neutral-300 [&::-webkit-details-marker]:hidden">
              <span>{label}</span>
              <span className="flex items-center gap-2 text-[0.6rem] tracking-[0.25em] text-neutral-500">
                <span className="truncate text-neutral-300/80" title={preview}>
                  {preview}
                </span>
                <span
                  className="text-neutral-400 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                >
                  ▾
                </span>
              </span>
            </summary>
            <div className="mt-3 border-t border-white/10 pt-3 text-[0.75rem] tracking-normal text-neutral-200">
              <Property projectKey={projectKey} value={value} />
            </div>
          </details>
        );
      })}
    </div>
  );
};

const Property = <TKey extends keyof CvProject>({
  projectKey,
  value,
}: {
  projectKey: TKey;
  value: CvProject[TKey];
}) => {
  if (projectKey === "clients") {
    return (
      <div className="flex flex-wrap gap-2">
        {(value as { id: string; name: string }[]).map((item) => (
          <Tag key={item.id} className="flex gap-0.5">
            <div>{item.name}</div>
          </Tag>
        ))}
      </div>
    );
  }
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-2">
        {(value as string[]).map((i, idx) => (
          <Tag key={idx} searchParamKey={projectKey} value={i}>
            {i}
          </Tag>
        ))}
      </div>
    );
  }
  return <span className="text-neutral-200">{value as string}</span>;
};

const formatPreviewValue = (value: CvProject[keyof CvProject]) => {
  if (Array.isArray(value)) {
    const names = value
      .map((item) => {
        if (!item) {
          return null;
        }
        if (typeof item === "string") {
          return item;
        }
        if (typeof item === "object" && "name" in item) {
          return String(item.name);
        }
        return null;
      })
      .filter((item): item is string => !!item);

    if (!names.length) {
      return "None";
    }

    if (names.length <= 2) {
      return names.join(", ");
    }

    return `${names.slice(0, 2).join(", ")} +${names.length - 2} more`;
  }

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (!value) {
    return "None";
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof (value as { name?: unknown }).name === "string"
  ) {
    return String((value as { name: string }).name);
  }

  return String(value);
};
