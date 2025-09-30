import { ClientChartWrapper } from "./ClientChartWrapper";
import { FilterConfig } from "./types";
import { getFilterOptionCounts } from "./utils";
import { CvProject } from "@/server/notion/getCvProjects";

export const PieChartFilter = ({
  filterConfig,
  projects,
}: {
  filterConfig: FilterConfig;
  projects: CvProject[];
}) => {
  const { projectKey } = filterConfig;
  const itemCounts = getFilterOptionCounts(projects, projectKey);

  const palette = [
    "#34d399",
    "#22d3ee",
    "#38bdf8",
    "#818cf8",
    "#a855f7",
    "#f59e0b",
  ];

  const data = itemCounts.map(({ itemKey, count, color }, index) => ({
    name: itemKey,
    value: count,
    itemStyle: color ? { color } : { color: palette[index % palette.length] },
  }));

  const seriesColors = data.map((d) => d.itemStyle?.color as string);

  return (
    <div className="flex h-[210px] w-full items-start justify-center">
      <ClientChartWrapper
        projectKey={projectKey}
        chartProps={{
          notMerge: true,
          option: {
            tooltip: {
              trigger: "item",
              formatter: "{b}: {c} ({d}%)",
            },
            series: [
              {
                name: "Project Types",
                type: "pie",
                colorBy: "data",
                color: seriesColors,
                radius: "95%",
                center: ["50%", "50%"],
                data: data,
                label: {
                  position: "inside",
                  color: "#e2e8f0",
                  fontFamily: "var(--font-plex)",
                  fontSize: 11,
                },
              },
            ],
          },
        }}
      />
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
