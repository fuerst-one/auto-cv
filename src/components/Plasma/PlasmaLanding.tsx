"use client";

import { useEffect, useRef, useState } from "react";
import { FrameBounds, Glyph } from "./types";
import { getAnimationFrame } from "./getAnimationFrame";
import { useInterval } from "./useInterval";
import { getIsReducedMotion } from "./getIsReducedMotion";
import { getLabelsGroups } from "./labelGroups";
import { LabelPlacement } from "./getLabelGroupPlacements";
import { getResponsivePlacements } from "./getResponsivePlacements";
import {
  LANDING_CHARACTERS,
  PLASMA_COMPLEXITY,
  PLASMA_FPS,
  PLASMA_REDUCED_FPS,
  PLASMA_SPEED,
  PLASMA_ZOOM,
} from "./constants";
import { PlasmaCanvas } from "./PlasmaCanvas";
import { LabelOverlay } from "./LabelOverlay";
import { LegalFooter } from "./LegalFooter";
import { useResponsiveMetrics } from "./useResponsiveMetrics";

const FOOTER_RESERVED_PX = 40;

const LOADING_FRAME: Glyph[][] = [
  "FUERST.ONE".split("").map((character) => ({
    character,
    style: { fontWeight: 700 },
  })),
];

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
  const [frame, setFrame] = useState<Glyph[][] | null>(null);
  const [placements, setPlacements] = useState<LabelPlacement[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleIsPlaying = () => setIsPlaying((prev) => !prev);

  const renderFrame = (currentBounds: FrameBounds, playing: boolean) => {
    const nextFrame = getAnimationFrame({
      ...currentBounds,
      complexity: PLASMA_COMPLEXITY,
      zoomFactor: 1 / PLASMA_ZOOM,
      speedFactor: PLASMA_SPEED,
      characters: LANDING_CHARACTERS,
    });
    const groups = getLabelsGroups(
      playing,
      toggleIsPlaying,
      currentBounds.width,
      fontPx,
    );
    const nextPlacements = getResponsivePlacements(currentBounds, groups);
    for (const { row, startCol, label } of nextPlacements) {
      for (let i = 0; i < label.label.length; i++) {
        nextFrame[row][startCol + i] = { character: " " };
      }
    }
    setFrame(nextFrame);
    setPlacements(nextPlacements);
  };

  useEffect(() => {
    if (bounds) {
      renderFrame(bounds, isPlaying);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bounds, isPlaying]);

  useInterval(
    () => {
      if (bounds && isPlaying) {
        renderFrame(bounds, isPlaying);
      }
    },
    1000 / (getIsReducedMotion() ? PLASMA_REDUCED_FPS : PLASMA_FPS),
  );

  if (!frame) {
    return (
      <div style={{ marginTop: -cellSize }}>
        <PlasmaCanvas
          frame={LOADING_FRAME}
          cellSize={cellSize}
          fontPx={fontPx}
        />
      </div>
    );
  }

  return (
    <div
      className="relative"
      style={{
        width: frame[0].length * cellSize,
        height: frame.length * cellSize,
      }}
    >
      <PlasmaCanvas frame={frame} cellSize={cellSize} fontPx={fontPx} />
      <LabelOverlay
        placements={placements}
        cellSize={cellSize}
        fontPx={fontPx}
      />
    </div>
  );
};
