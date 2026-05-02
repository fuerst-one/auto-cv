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
        "inline-flex items-center gap-1 border border-white/30 bg-black/60 px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-neutral-200 transition",
        {
          "cursor-pointer hover:border-white hover:text-white": hasSearchParam,
        },
        className,
      )}
      onClick={() => toggleSearchParam(searchParamKey, value)}
    >
      {children}
    </span>
  );
};
