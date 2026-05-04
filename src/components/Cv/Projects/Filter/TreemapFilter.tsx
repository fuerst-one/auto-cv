import { FilterConfig } from "./types";
import { useMemo } from "react";
import { CvProject } from "@/server/notion/getCvProjects";
import { getFilterOptionCounts } from "./utils";
import { ClientChartWrapper } from "./ClientChartWrapper";

const TREEMAP_ITEMS_MAX = 12;

const GRAYSCALE_PALETTE = [
  "#f5f5f5",
  "#dcdcdc",
  "#bdbdbd",
  "#a0a0a0",
  "#878787",
  "#6e6e6e",
  "#575757",
  "#454545",
  "#363636",
  "#2a2a2a",
  "#1f1f1f",
  "#161616",
];

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
    <div className="flex h-[120px] w-full items-start justify-center">
      <div className="h-full w-full overflow-hidden">
        <ClientChartWrapper
          projectKey={projectKey}
          chartProps={{
            option: {
              tooltip: {
                trigger: "item",
                formatter: "{b}: {c}",
                backgroundColor: "#000",
                borderColor: "#fff",
                textStyle: { color: "#fff" },
              },
              color: Array.from(
                { length: itemsLength },
                (_, i) => GRAYSCALE_PALETTE[i % GRAYSCALE_PALETTE.length],
              ),
              series: [
                {
                  name: "Project Types",
                  type: "treemap",
                  data: data,
                  roam: false,
                  width: "100%",
                  height: "100%",
                  itemStyle: {
                    borderColor: "#000",
                    borderWidth: 1,
                  },
                  label: {
                    show: true,
                    fontSize: 10,
                    color: "#fff",
                    textBorderColor: "#000",
                    textBorderWidth: 2,
                    fontFamily: "var(--font-plex), monospace",
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
