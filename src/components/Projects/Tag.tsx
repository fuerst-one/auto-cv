"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { useToggleSearchParam } from "./useToggleSearchParam";

export const Tag = ({
  searchParamKey,
  value,
  className,
  children,
}: {
  searchParamKey?: string;
  value?: string;
  className?: string;
  children: ReactNode;
}) => {
  const toggleSearchParam = useToggleSearchParam();
  const hasSearchParam = !!searchParamKey && !!value;

  return (
    <span
      className={cn(
        "rounded-sm border border-gray-300 px-1 py-0.5",
        { "cursor-pointer hover:bg-gray-200": hasSearchParam },
        className,
      )}
      onClick={() => toggleSearchParam(searchParamKey, value)}
    >
      {children}
    </span>
  );
};
