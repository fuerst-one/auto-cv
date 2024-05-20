import { FilterConfig } from "./types";
import { useMemo } from "react";
import { CvProject } from "@/server/notion/getCvProjects";
import { getFilterOptionCounts } from "./utils";
import Color from "color";
import { ClientChartWrapper } from "./ClientChartWrapper";

const TREEMAP_ITEMS_MAX = 12;

export const TreemapFilter = ({
  filterConfig,
  projects,
}: {
  filterConfig: FilterConfig;
  projects: CvProject[];
}) => {
  const { projectKey } = filterConfig;
  const itemCounts = getFilterOptionCounts(projects, projectKey);
  const itemsLength = Math.min(itemCounts.length, TREEMAP_ITEMS_MAX);
  const data = useMemo(() => {
    return [
      ...itemCounts.slice(0, itemsLength).map(({ itemKey, count }) => ({
        name: itemKey,
        value: count,
      })),
    ];
  }, [itemCounts, itemsLength]);

  return (
    <div className="flex h-[210px] w-full items-start justify-center">
      <div className="h-full w-full overflow-hidden rounded">
        <ClientChartWrapper
          projectKey={projectKey}
          chartProps={{
            option: {
              tooltip: {
                trigger: "item",
                formatter: "{b}: {c}",
              },
              color: Array.from({ length: itemsLength }, (_, i) =>
                Color("#0a1e3f")
                  .mix(Color("#acdef8"), i / itemsLength)
                  .hex(),
              ),
              series: [
                {
                  name: "Project Types",
                  type: "treemap",
                  data: data,
                  roam: false,
                  width: "100%",
                  height: "100%",
                  label: {
                    show: true,
                    fontSize: 10,
                  },
                  breadcrumb: {
                    show: false,
                  },
                },
              ],
            },
          }}
        />
      </div>
      <dl className="hidden">
        {itemCounts.map(({ itemKey, count }) => (
          <div key={itemKey}>
            <dt>{itemKey}</dt>
            <dd>{count}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};
