"use client";

import React, { useState } from "react";
import { Tag } from "./Tag";
import { CvProject } from "@/server/notion/getCvProjects";

const SLICE_DEFAULT = 5;

export type FilterOption = {
  label: string;
  projectKey: keyof CvProject;
  itemCounts: {
    itemKey: string;
    count: number;
  }[];
};

export const ProjectFilter = ({
  filterOption,
}: {
  filterOption: FilterOption;
}) => {
  const { label, projectKey, itemCounts } = filterOption;

  const [isCollapsed, setIsCollapsed] = useState(true);
  const sliceIndex = isCollapsed ? SLICE_DEFAULT : itemCounts.length;

  return (
    <div key={projectKey} className="px-2 py-1">
      <h2 className="mb-2 text-md font-bold">{label}</h2>
      <div className="flex flex-wrap gap-1 text-xs">
        {itemCounts.slice(0, sliceIndex).map(({ itemKey, count }) => (
          <Tag
            key={itemKey}
            searchParamKey={projectKey}
            value={itemKey}
            className="flex gap-0.5"
          >
            <div>{itemKey}</div>
            <div className="text-gray-600">({count})</div>
          </Tag>
        ))}
        {itemCounts.length > SLICE_DEFAULT && (
          <div onClick={() => setIsCollapsed(!isCollapsed)}>
            <Tag className="flex cursor-pointer gap-0.5 border-none hover:text-blue-500 print:hidden">
              <div>{isCollapsed ? "More" : "Less"}...</div>
            </Tag>
          </div>
        )}
      </div>
    </div>
  );
};
