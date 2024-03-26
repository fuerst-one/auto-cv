"use client";

import React, { Fragment, useState } from "react";
import { Tag } from "./Tag";
import { CvProject } from "@/server/notion/getCvProjects";
import { Progress } from "../ui/progress";
import maxBy from "lodash/maxBy";

const SLICE_DEFAULT = 6;

export type FilterOption = {
  label: string;
  projectKey: keyof CvProject;
  itemCounts: ItemCount[];
};

type ItemCount = {
  itemKey: string;
  count: number;
};

export const ProjectFilter = ({
  filterOption,
}: {
  filterOption: FilterOption;
}) => {
  const { label, projectKey, itemCounts } = filterOption;

  return (
    <div className="px-2 py-1">
      <h2 className="text-md mb-2 font-bold">{label}</h2>
      <ProgressFilter projectKey={projectKey} itemCounts={itemCounts} />
    </div>
  );
};

const ProgressFilter = ({
  projectKey,
  itemCounts,
}: {
  projectKey: string;
  itemCounts: ItemCount[];
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const sliceIndex = isCollapsed ? SLICE_DEFAULT : itemCounts.length;
  const hasOtherItems = itemCounts.length > SLICE_DEFAULT;
  const maxCount = maxBy(itemCounts, "count")!.count;

  return (
    <div className="flex flex-col gap-1 text-xs">
      {itemCounts.slice(0, sliceIndex).map(({ itemKey, count }) => (
        <Fragment key={itemKey}>
          <Progress value={(count / maxCount) * 100} />
          <Tag
            searchParamKey={projectKey}
            value={itemKey}
            className="-mt-0.5 mb-0.5 flex gap-0.5 border-none py-0"
          >
            <div>{itemKey}</div>
            <div className="text-gray-600">({count})</div>
          </Tag>
        </Fragment>
      ))}
      {hasOtherItems && (
        <div onClick={() => setIsCollapsed(!isCollapsed)}>
          <Tag className="flex cursor-pointer gap-0.5 border-none hover:text-blue-500 print:hidden">
            <div>{isCollapsed ? "More" : "Less"}...</div>
          </Tag>
        </div>
      )}
    </div>
  );
};
