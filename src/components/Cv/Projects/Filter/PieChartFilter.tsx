import { ClientChartWrapper } from "./ClientChartWrapper";
import { FilterConfig } from "./types";
import { getFilterOptionCounts } from "./utils";
import { CvProject } from "@/server/notion/getCvProjects";

const GRAYSCALE_PALETTE = [
  "#f5f5f5",
  "#bdbdbd",
  "#8a8a8a",
  "#5a5a5a",
  "#3a3a3a",
  "#1f1f1f",
];

export const PieChartFilter = ({
  filterConfig,
  projects,
}: {
  filterConfig: FilterConfig;
  projects: CvProject[];
}) => {
  const { projectKey } = filterConfig;
  const itemCounts = getFilterOptionCounts(projects, projectKey);

  const data = itemCounts.map(({ itemKey, count }, index) => ({
    name: itemKey,
    value: count,
    itemStyle: {
      color: GRAYSCALE_PALETTE[index % GRAYSCALE_PALETTE.length],
      borderColor: "#000",
      borderWidth: 1,
    },
  }));

  const seriesColors = data.map((d) => d.itemStyle.color);

  return (
    <div className="flex h-[120px] w-full items-start justify-center">
      <ClientChartWrapper
        projectKey={projectKey}
        chartProps={{
          notMerge: true,
          option: {
            tooltip: {
              trigger: "item",
              formatter: "{b}: {c} ({d}%)",
              backgroundColor: "#000",
              borderColor: "#fff",
              textStyle: { color: "#fff" },
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
                  color: "#fff",
                  textBorderColor: "#000",
                  textBorderWidth: 2,
                  fontFamily: "var(--font-plex), monospace",
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
