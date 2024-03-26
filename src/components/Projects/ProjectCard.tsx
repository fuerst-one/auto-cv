import { ReactNode } from "react";
import { getJsxFormattedTextFromTextBlock } from "./getJsxFormattedTextFromTextBlock";
import { projectTypeColors } from "./projectTypeColors";
import { CvProject } from "@/server/notion/getCvProjects";
import { Tag } from "./Tag";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { FaImage } from "@react-icons/all-files/fa/FaImage";
import { FaExternalLinkAlt } from "@react-icons/all-files/fa/FaExternalLinkAlt";
import { FaChartLine } from "@react-icons/all-files/fa/FaChartLine";
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
  const { name, url, projectType, startDate, endDate, logo } = project;

  const description = getJsxFormattedTextFromTextBlock(project.description);
  const kpis = getJsxFormattedTextFromTextBlock(project.kpis);

  const { border, text } =
    projectTypeColors[projectType as keyof typeof projectTypeColors] ?? {};

  return (
    <div className={cn("space-y-2 border-l-2 px-6 py-3", border)}>
      <HeaderWrapper
        url={url}
        className={cn("flex items-center justify-between")}
      >
        <div>
          <h2 className="text-md font-bold leading-tight">
            {name}{" "}
            <span className={cn("font-medium", text)}>({projectType})</span>
          </h2>
          <div className="text-sm text-gray-600">
            <DateRange startDate={startDate} endDate={endDate} />
            {url && (
              <>
                <FaExternalLinkAlt className="mb-0.5 ml-1.5 inline-block text-xs text-gray-400 print:hidden" />
                <span className="hidden print:block">{url}</span>
              </>
            )}
          </div>
        </div>
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
      </HeaderWrapper>
      {kpis && (
        <div className="text-xs text-green-700">
          <FaChartLine className="inline" /> {kpis}
        </div>
      )}
      {description && <div className="text-xs">{description}</div>}
      {!compact && <MetaTable project={project} />}
    </div>
  );
};

const HeaderWrapper = ({
  url,
  className,
  children,
}: {
  url?: string | null;
  className?: string;
  children: ReactNode;
}) => {
  if (!url) {
    return <div className={className}>{children}</div>;
  }
  return (
    <Link
      href={url}
      target="_blank"
      className={cn(
        className,
        "cursor-pointer hover:text-blue-500 [&_div]:hover:text-blue-500 [&_span]:hover:text-blue-500 [&_svg]:hover:text-blue-500",
      )}
    >
      {children}
    </Link>
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
  return (
    <span>
      {startDateObj.format("YYYY/MM")} - {endDateObj.format("YYYY/MM")} (
      {duration})
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
