"use client";

import { useEffect, useState } from "react";
import { FrameBounds, Glyph } from "./types";
import { getAnimationFrame } from "./getAnimationFrame";
import { useInterval } from "./useInterval";
import { getIsReducedMotion } from "./getIsReducedMotion";
import { PlasmaCanvas } from "./PlasmaCanvas";

const CELL_SIZE_PX = 20;
const FONT_PX = 15;
const COMPLEXITY = 4;
const ZOOM = 25;
const SPEED = 0.25;
const FPS = 8;

export const PlasmaBackground = () => {
  const [bounds, setBounds] = useState<FrameBounds | null>(null);
  const [frame, setFrame] = useState<Glyph[][] | null>(null);

  useEffect(() => {
    const updateBounds = () => {
      const width = Math.ceil(window.innerWidth / CELL_SIZE_PX);
      const height = Math.ceil(window.innerHeight / CELL_SIZE_PX);
      setBounds({ width, height });
    };
    updateBounds();
    window.addEventListener("resize", updateBounds);
    return () => window.removeEventListener("resize", updateBounds);
  }, []);

  useInterval(
    () => {
      if (!bounds) {
        return;
      }
      setFrame(
        getAnimationFrame({
          ...bounds,
          complexity: COMPLEXITY,
          zoomFactor: 1 / ZOOM,
          speedFactor: SPEED,
        }),
      );
    },
    1000 / (getIsReducedMotion() ? 0.5 : FPS),
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-40"
    >
      <PlasmaCanvas frame={frame} cellSize={CELL_SIZE_PX} fontPx={FONT_PX} />
    </div>
  );
};
