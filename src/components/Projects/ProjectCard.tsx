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

  const { border, text } = colors.projectType![projectType] ?? {};

  return (
    <article className={cn("space-y-2 border-l-2 px-6 py-3", border)}>
      <div className="flex items-center justify-between">
        <header>
          <h3 className="text-md font-bold leading-tight">
            {name}{" "}
            <span className={cn("font-medium", text)}>({projectType})</span>
          </h3>
          <div className="text-sm text-gray-600">
            <DateRange startDate={startDate} endDate={endDate} />
            {websiteUrl && (
              <Link
                href={websiteUrl}
                target="_blank"
                className="ml-1 inline-flex items-center gap-1 rounded-sm bg-gray-100 px-1 text-xs font-medium print:ml-0 print:block print:px-0"
              >
                Website<span className="hidden print:inline">: </span>
                <FaExternalLinkAlt className="print:hidden" />
                <span className="hidden print:inline">{websiteUrl}</span>
              </Link>
            )}
            {githubUrl && (
              <Link
                href={websiteUrl}
                target="_blank"
                className="ml-1 inline-flex items-center gap-1 rounded-sm bg-gray-100 px-1 text-xs font-medium print:ml-0 print:block print:px-0"
              >
                Github<span className="hidden print:inline">: </span>
                <FaGithub className="print:hidden" />
                <span className="hidden print:inline">{githubUrl}</span>
              </Link>
            )}
          </div>
        </header>
        <div className="hidden sm:block lg:hidden 2xl:block print:hidden">
          {logo ? (
            <div className="h-6 w-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo?.[0]}
                alt={name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <FaImage className="text-xl text-gray-400" />
          )}
        </div>
      </div>
      {kpis && (
        <div className="text-xs text-green-700">
          <FaChartLine className="inline" /> {kpis}
        </div>
      )}
      {description && <div className="text-xs">{description}</div>}
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
        {startDateFormatted} ({duration})
      </span>
    );
  }

  return (
    <span>
      {startDateFormatted} - {endDateFormatted} ({duration})
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
    <div className="flex flex-col">
      {filteredFields.map(({ label, projectKey, value }) => (
        <div
          key={projectKey}
          className="-mx-1 flex items-center justify-start gap-1 rounded-sm px-2 py-1 text-xs leading-tight odd:bg-gray-100"
        >
          <h3 className="w-[150px] shrink-0">{label}</h3>
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
      <div className="flex flex-wrap gap-1">
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
      <div className="flex flex-wrap gap-1">
        {(value as string[]).map((i, idx) => (
          <Tag key={idx} searchParamKey={projectKey} value={i}>
            {i}
          </Tag>
        ))}
      </div>
    );
  }
  return value as string;
};
