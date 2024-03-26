"use client";

import { useState, Fragment } from "react";
import { Progress } from "@/components/ui/progress";
import { Tag } from "../Tag";
import { ItemCount } from "./types";
import maxBy from "lodash/maxBy";

const SLICE_DEFAULT = 6;

export const ProgressFilter = ({
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
