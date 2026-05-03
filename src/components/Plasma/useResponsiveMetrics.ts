"use client";

import { useEffect, useState } from "react";

export type Metrics = {
  cellSize: number;
  fontPx: number;
  cellWidth?: number;
};

const MOBILE_BREAKPOINT_PX = 640;
const MOBILE_METRICS: Metrics = { cellSize: 20, fontPx: 14 };
const DESKTOP_METRICS: Metrics = { cellSize: 24, fontPx: 16 };

const compute = (): Metrics => {
  if (typeof window === "undefined") {
    return DESKTOP_METRICS;
  }
  return window.innerWidth < MOBILE_BREAKPOINT_PX
    ? MOBILE_METRICS
    : DESKTOP_METRICS;
};

export const useResponsiveMetrics = (): Metrics => {
  const [metrics, setMetrics] = useState<Metrics>(compute);
  useEffect(() => {
    const update = () => {
      const next = compute();
      setMetrics((prev) =>
        prev.cellSize === next.cellSize && prev.fontPx === next.fontPx
          ? prev
          : next,
      );
    };
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return metrics;
};
