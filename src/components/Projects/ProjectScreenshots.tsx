"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { FaChevronLeft } from "@react-icons/all-files/fa/FaChevronLeft";
import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import { cn } from "@/lib/utils";

export const ProjectScreenshots = ({
  screenshots,
  projectName,
}: {
  screenshots: string[];
  projectName: string;
}) => {
  const sanitizedScreenshots = useMemo(
    () => screenshots.filter(Boolean),
    [screenshots],
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!sanitizedScreenshots.length) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex((previous) => {
      if (previous < sanitizedScreenshots.length) {
        return previous;
      }

      return 0;
    });
  }, [sanitizedScreenshots]);

  if (!sanitizedScreenshots.length) {
    return null;
  }

  const showNavigation = sanitizedScreenshots.length > 1;
  const goToIndex = (index: number) => {
    if (!showNavigation) return;
    const nextIndex = (index + sanitizedScreenshots.length) % sanitizedScreenshots.length;
    setActiveIndex(nextIndex);
  };

  return (
    <div className="group/screenshot mt-4 select-none print:hidden">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
        <div className="relative aspect-video w-full">
          {sanitizedScreenshots.map((src, index) => (
            <Fragment key={`${src}-${index}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${projectName} screenshot ${index + 1}`}
                loading="lazy"
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
                  index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0",
                )}
              />
            </Fragment>
          ))}
        </div>
        {showNavigation && (
          <>
            <button
              type="button"
              onClick={() => goToIndex(activeIndex - 1)}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-950/70 text-slate-100 opacity-0 transition hover:border-emerald-400/50 hover:text-white group-hover/screenshot:opacity-100"
              aria-label="Previous screenshot"
            >
              <FaChevronLeft className="text-base" />
            </button>
            <button
              type="button"
              onClick={() => goToIndex(activeIndex + 1)}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-950/70 text-slate-100 opacity-0 transition hover:border-emerald-400/50 hover:text-white group-hover/screenshot:opacity-100"
              aria-label="Next screenshot"
            >
              <FaChevronRight className="text-base" />
            </button>
          </>
        )}
      </div>
      {showNavigation && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {sanitizedScreenshots.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show screenshot ${index + 1}`}
              className={cn(
                "h-2.5 w-2.5 rounded-full border border-white/30 transition",
                index === activeIndex
                  ? "bg-emerald-400/80 border-emerald-300/80"
                  : "bg-transparent hover:border-emerald-300/60 hover:bg-emerald-300/30",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};
