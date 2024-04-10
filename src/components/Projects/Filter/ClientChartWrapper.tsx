"use client";

import ReactECharts, { EChartsReactProps } from "echarts-for-react";
import { useToggleSearchParam } from "../useToggleSearchParam";

export const ClientChartWrapper = ({
  projectKey,
  chartProps,
}: {
  projectKey?: string;
  chartProps: EChartsReactProps;
}) => {
  const toggleSearchParam = useToggleSearchParam();

  return (
    <ReactECharts
      {...chartProps}
      style={{ height: "100%", width: "100%", ...chartProps.style }}
      onEvents={{
        ...chartProps.onEvents,
        click: (params: { name: string }) => {
          toggleSearchParam(projectKey, params.name);
        },
      }}
    />
  );
};
