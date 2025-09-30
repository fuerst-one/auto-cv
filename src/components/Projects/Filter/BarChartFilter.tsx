import { Fragment } from "react";
import { Progress } from "@/components/ui/progress";
import { Tag } from "../Tag";
import { FilterConfig } from "./types";
import { getFilterOptionCounts } from "./utils";
import { CvProject } from "@/server/notion/getCvProjects";
import maxBy from "lodash/maxBy";

export const BarChartFilter = ({
  filterConfig,
  projects,
}: {
  filterConfig: FilterConfig;
  projects: CvProject[];
}) => {
  const { projectKey } = filterConfig;
  const itemCounts = getFilterOptionCounts(projects, projectKey);
  const maxCount = maxBy(itemCounts, "count")?.count ?? 0;

  if (!itemCounts.length || maxCount === 0) {
    return (
      <div className="flex h-[215px] w-full items-center justify-center text-xs text-slate-500">
        No data available yet
      </div>
    );
  }

  return (
    <div className="h-[215px] w-full overflow-y-auto pr-1">
      <div className="flex flex-col gap-2 text-xs text-slate-200">
        {itemCounts.map(({ itemKey, count }) => (
          <Fragment key={itemKey}>
            <Tag
              searchParamKey={projectKey}
              value={itemKey}
              className="flex items-center gap-0.5 border-none py-0"
            >
              <span className="w-1/2 flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap">
                {itemKey} <span className="text-emerald-200/70">({count})</span>
              </span>
              <Progress
                value={(count / maxCount) * 100}
                className="h-1.5 bg-emerald-500/10"
                indicatorClassName="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400"
              />
            </Tag>
          </Fragment>
        ))}
      </div>
    </div>
  );
};
