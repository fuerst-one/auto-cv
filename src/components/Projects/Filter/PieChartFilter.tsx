"use client";

import { PieChart } from "@/components/ui/pie-chart";
import { projectTypeColors } from "../projectTypeColors";
import { ItemCount } from "./types";
import { useToggleSearchParam } from "../useToggleSearchParam";

export const PieChartFilter = ({
  projectKey,
  itemCounts,
}: {
  projectKey: string;
  itemCounts: ItemCount[];
}) => {
  const toggleSearchParam = useToggleSearchParam();
  return (
    <div className="flex h-[210px] w-full items-start justify-center">
      <PieChart
        data={itemCounts.map(({ itemKey, count }) => ({
          id: itemKey.slice(0, 9),
          value: count,
        }))}
        colors={itemCounts.map(
          ({ itemKey }) =>
            projectTypeColors[itemKey as keyof typeof projectTypeColors].hex +
            "cc",
        )}
        enableArcLabels={true}
        enableArcLinkLabels={false}
        onClick={(e) => {
          toggleSearchParam(projectKey, e.id as string);
        }}
      />
    </div>
  );
};
