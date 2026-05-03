"use client";

import { useEffect, useRef, useState } from "react";
import { FrameBounds } from "../Plasma/types";
import { useInterval } from "../Plasma/useInterval";
import { getIsReducedMotion } from "../Plasma/getIsReducedMotion";
import { PlasmaCanvas, PlasmaCanvasHandle } from "../Plasma/PlasmaCanvas";
import {
  CHARACTERS,
  PLASMA_FPS,
  PLASMA_REDUCED_FPS,
} from "../Plasma/constants";

const CELL_SIZE_PX = 20;
const FONT_PX = 15;

export const PlasmaBackground = () => {
  const [bounds, setBounds] = useState<FrameBounds | null>(null);
  const canvasRef = useRef<PlasmaCanvasHandle | null>(null);

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
      canvasRef.current?.renderPlasma();
    },
    1000 / (getIsReducedMotion() ? PLASMA_REDUCED_FPS : PLASMA_FPS),
  );

  if (!bounds) {
    return null;
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-40"
    >
      <PlasmaCanvas
        ref={canvasRef}
        ramp={CHARACTERS}
        cellSize={CELL_SIZE_PX}
        cellWidth={CELL_SIZE_PX}
        fontPx={FONT_PX}
        gridWidth={bounds.width}
        gridHeight={bounds.height}
      />
    </div>
  );
};
