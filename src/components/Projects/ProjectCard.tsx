import { getJsxFormattedTextFromTextBlock } from "./getJsxFormattedTextFromTextBlock";
import { colors } from "./colors";
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
import { cn } from "@/lib/utils";

dayjs.extend(duration);
dayjs.extend(relativeTime);

export const ProjectCard = ({
  project,
  compact,
}: {
  project: CvProject;
  compact?: boolean;
}) => {
  const { name, projectType, websiteUrl, githubUrl, startDate, endDate, logo } =
    project;

  const description = getJsxFormattedTextFromTextBlock(project.description);
  const kpis = getJsxFormattedTextFromTextBlock(project.kpis);

  const { text } = colors.projectType![projectType] ?? {};

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_40px_rgba(8,11,19,0.45)] backdrop-blur transition",
        "hover:border-emerald-400/50 hover:bg-white/10",
      )}
    >
      <div className="relative flex items-start justify-between gap-4">
        <header className="space-y-3">
          <div className="space-y-1">
            <span className={cn("inline-flex items-center gap-2 font-[var(--font-plex)] text-[0.65rem] uppercase tracking-[0.35em] text-slate-400", text)}>
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              {projectType}
            </span>
            <h3 className="text-2xl font-semibold text-white">{name}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-[var(--font-plex)] tracking-[0.2em]">
              <DateRange startDate={startDate} endDate={endDate} />
            </span>
            {websiteUrl && (
              <Link
                href={websiteUrl}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[0.65rem] font-[var(--font-plex)] uppercase tracking-[0.3em] text-slate-200 transition hover:border-emerald-400/50 hover:text-white print:ml-0 print:block"
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
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[0.65rem] font-[var(--font-plex)] uppercase tracking-[0.3em] text-slate-200 transition hover:border-emerald-400/50 hover:text-white print:ml-0 print:block"
              >
                GitHub
                <FaGithub className="text-xs print:hidden" />
                <span className="hidden print:inline">: {githubUrl}</span>
              </Link>
            )}
          </div>
        </header>
        <div className="hidden shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-slate-200 shadow-inner sm:flex lg:hidden 2xl:flex print:hidden">
          {logo ? (
            <div className="h-8 w-20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo?.[0]}
                alt={name}
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <FaImage className="text-xl" />
          )}
        </div>
      </div>
      {kpis && (
        <div className="relative mt-4 flex items-center gap-2 text-sm text-emerald-300">
          <FaChartLine className="text-base" />
          <span>{kpis}</span>
        </div>
      )}
      {description && (
        <div className="mt-4 space-y-2 text-sm leading-relaxed text-slate-200">
          {description}
        </div>
      )}
      {!compact && <MetaTable project={project} />}
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
    <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
      {filteredFields.map(({ label, projectKey, value }) => (
        <div
          key={projectKey}
          className="flex flex-col gap-1 rounded-xl border border-white/10 bg-slate-900/40 p-3 sm:flex-row sm:items-baseline sm:gap-4"
        >
          <h3 className="w-36 shrink-0 font-[var(--font-plex)] text-[0.7rem] uppercase tracking-[0.35em] text-slate-400">
            {label}
          </h3>
          <Property projectKey={projectKey} value={value} />
        </div>
      ))}
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
  return <span className="text-slate-200">{value as string}</span>;
};
