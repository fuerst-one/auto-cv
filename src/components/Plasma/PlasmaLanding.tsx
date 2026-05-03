"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FrameBounds } from "./types";
import { useInterval } from "./useInterval";
import { getIsReducedMotion } from "./getIsReducedMotion";
import { getLabelsGroups } from "./labelGroups";
import { LabelPlacement } from "./getLabelGroupPlacements";
import { getResponsivePlacements } from "./getResponsivePlacements";
import {
  LANDING_CHARACTERS,
  PLASMA_FPS,
  PLASMA_REDUCED_FPS,
} from "./constants";
import {
  PlasmaCanvasGL,
  PlasmaCanvasGLHandle,
  isWebGL2Supported,
} from "./PlasmaCanvasGL/PlasmaCanvasGL";
import { LabelOverlay } from "./LabelOverlay";
import { LegalFooter } from "./LegalFooter";
import { useResponsiveMetrics } from "./useResponsiveMetrics";

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
  const glRef = useRef<PlasmaCanvasGLHandle | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [useGL, setUseGL] = useState(false);

  const toggleIsPlaying = () => setIsPlaying((prev) => !prev);

  useEffect(() => {
    setUseGL(isWebGL2Supported());
  }, []);

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

  useEffect(() => {
    if (bounds && useGL) {
      glRef.current?.renderPlasma();
    }
  }, [bounds, useGL]);

  useInterval(
    () => {
      if (bounds && isPlaying) {
        glRef.current?.renderPlasma();
      }
    },
    1000 / (getIsReducedMotion() ? PLASMA_REDUCED_FPS : PLASMA_FPS),
  );

  if (!bounds || !useGL) {
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
      <PlasmaCanvasGL
        ref={glRef}
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
