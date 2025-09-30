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
        "inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.65rem] font-[var(--font-plex)] uppercase tracking-[0.18em] text-slate-200 transition",
        {
          "cursor-pointer border-emerald-400/40 text-emerald-200 hover:border-emerald-300/60 hover:text-white":
            hasSearchParam,
        },
        className,
      )}
      onClick={() => toggleSearchParam(searchParamKey, value)}
    >
      {children}
    </span>
  );
};
