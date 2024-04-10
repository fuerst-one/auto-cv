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

  const data = itemCounts.map(({ itemKey, count, color }) => ({
    name: itemKey,
    value: count,
    itemStyle: {
      color,
    },
  }));

  return (
    <div className="flex h-[210px] w-full items-start justify-center">
      <ClientChartWrapper
        projectKey={projectKey}
        chartProps={{
          option: {
            tooltip: {
              trigger: "item",
              formatter: "{b}: {c} ({d}%)",
            },
            series: [
              {
                name: "Project Types",
                type: "pie",
                radius: "95%",
                center: ["50%", "50%"],
                data: data,
                label: {
                  position: "inside",
                  color: "white",
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
