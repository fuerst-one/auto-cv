"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FrameBounds } from "../Plasma/types";
import { useInterval } from "../Plasma/useInterval";
import { getIsReducedMotion } from "../Plasma/getIsReducedMotion";
import { getLabelsGroups } from "./labelGroups";
import { LabelPlacement } from "../Plasma/getLabelGroupPlacements";
import { getResponsivePlacements } from "./getResponsivePlacements";
import {
  LANDING_CHARACTERS,
  PLASMA_FPS,
  PLASMA_LANDING_LENS_SCALE,
  PLASMA_LANDING_LENS_X_FRAC,
  PLASMA_LANDING_LENS_Y_FRAC,
  PLASMA_REDUCED_FPS,
} from "../Plasma/constants";
import { PlasmaCanvas, PlasmaCanvasHandle } from "../Plasma/PlasmaCanvas";
import { LabelOverlay } from "../Plasma/LabelOverlay";
import { LegalFooter } from "../Plasma/LegalFooter";
import { useResponsiveMetrics } from "../Plasma/useResponsiveMetrics";

const FOOTER_RESERVED_PX = 40;

export const PlasmaLanding = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { cellSize, fontPx } = useResponsiveMetrics();
  const [bounds, setBounds] = useState<FrameBounds | null>(null);

  useEffect(() => {
    const updateBounds = () => {
      if (!containerRef.current) {
        return;
      }
      const width = Math.floor(window.innerWidth / cellSize) - 1;
      const height =
        Math.floor((window.innerHeight - FOOTER_RESERVED_PX) / cellSize) - 1;
      setBounds({ width, height });
    };
    updateBounds();
    const resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(containerRef.current!);
    return () => resizeObserver.disconnect();
  }, [cellSize]);

  return (
    <div
      ref={containerRef}
      className="flex h-screen w-screen flex-col items-center justify-center"
    >
      <Frame bounds={bounds} cellSize={cellSize} fontPx={fontPx} />
      <LegalFooter />
    </div>
  );
};

type FrameProps = {
  bounds: FrameBounds | null;
  cellSize: number;
  fontPx: number;
};

const Frame = ({ bounds, cellSize, fontPx }: FrameProps) => {
  const canvasRef = useRef<PlasmaCanvasHandle | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleIsPlaying = () => setIsPlaying((prev) => !prev);

  const placements = useMemo<LabelPlacement[]>(() => {
    if (!bounds) {
      return [];
    }
    const groups = getLabelsGroups(
      isPlaying,
      toggleIsPlaying,
      bounds.width,
      fontPx,
    );
    return getResponsivePlacements(bounds, groups);
  }, [bounds, isPlaying, fontPx]);

  const applyStaticLens = useCallback(() => {
    if (!bounds) {
      return;
    }
    canvasRef.current?.setLensScale(PLASMA_LANDING_LENS_SCALE);
    canvasRef.current?.setCursor(
      bounds.width * PLASMA_LANDING_LENS_X_FRAC,
      bounds.height * PLASMA_LANDING_LENS_Y_FRAC,
    );
  }, [bounds]);

  useEffect(() => {
    if (bounds) {
      applyStaticLens();
      canvasRef.current?.renderPlasma();
    }
  }, [bounds, applyStaticLens]);

  useInterval(
    () => {
      if (bounds && isPlaying) {
        applyStaticLens();
        canvasRef.current?.renderPlasma();
      }
    },
    1000 / (getIsReducedMotion() ? PLASMA_REDUCED_FPS : PLASMA_FPS),
  );

  if (!bounds) {
    return null;
  }

  return (
    <div
      className="relative"
      style={{
        width: bounds.width * cellSize,
        height: bounds.height * cellSize,
      }}
    >
      <PlasmaCanvas
        ref={canvasRef}
        ramp={LANDING_CHARACTERS}
        cellSize={cellSize}
        cellWidth={cellSize}
        fontPx={fontPx}
        gridWidth={bounds.width}
        gridHeight={bounds.height}
      />
      <LabelOverlay
        placements={placements}
        cellSize={cellSize}
        fontPx={fontPx}
      />
    </div>
  );
};
