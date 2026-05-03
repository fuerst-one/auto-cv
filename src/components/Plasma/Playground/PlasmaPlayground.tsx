"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FrameBounds, Glyph, LabelGroup } from "../types";
import { PlasmaCanvas } from "../PlasmaCanvas";
import { LabelOverlay } from "../LabelOverlay";
import {
  getLabelGroupPlacements,
  LabelPlacement,
} from "../getLabelGroupPlacements";
import { getAnimationFrame } from "../getAnimationFrame";
import { useInterval } from "../useInterval";
import { getIsReducedMotion } from "../getIsReducedMotion";
import { PLAYGROUND_CHARACTERS } from "../constants";
import { KnobDropdown } from "./KnobDropdown";
import { PlaygroundFooter } from "./PlaygroundFooter";
import { getPlaygroundLabels } from "./playgroundLabels";
import {
  DEFAULT_KNOBS,
  PLASMA_COMPLEXITY,
  PLASMA_FPS,
  PLASMA_SPEED,
  PLASMA_ZOOM,
  SIZE_PRESETS,
} from "./constants";
import { KnobId, KnobState } from "./types";

const FOOTER_RESERVED_PX = 40;

export const PlasmaPlayground = () => {
  const [knobs, setKnobs] = useState<KnobState>(DEFAULT_KNOBS);
  const [openKnob, setOpenKnob] = useState<KnobId | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [bounds, setBounds] = useState<FrameBounds | null>(null);
  const [frame, setFrame] = useState<Glyph[][] | null>(null);

  const { cellSize, fontPx } = SIZE_PRESETS[knobs.size];

  useEffect(() => {
    const update = () => {
      const width = Math.floor(window.innerWidth / cellSize) - 1;
      const height =
        Math.floor((window.innerHeight - FOOTER_RESERVED_PX) / cellSize) - 1;
      setBounds({ width: Math.max(10, width), height: Math.max(10, height) });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [cellSize]);

  const togglePause = useCallback(() => setIsPaused((p) => !p), []);
  const toggleKnob = useCallback(
    (id: KnobId) => setOpenKnob((cur) => (cur === id ? null : id)),
    [],
  );
  const closeKnob = useCallback(() => setOpenKnob(null), []);
  const handleKnobChange = useCallback(
    <K extends keyof KnobState>(key: K, value: KnobState[K]) => {
      setKnobs((prev) => ({ ...prev, [key]: value }));
      setOpenKnob(null);
    },
    [],
  );

  const labelGroups: LabelGroup[] = useMemo(
    () =>
      getPlaygroundLabels({
        knobs,
        isPaused,
        onTogglePause: togglePause,
        onKnobToggle: toggleKnob,
      }),
    [knobs, isPaused, togglePause, toggleKnob],
  );

  const placements = useMemo<LabelPlacement[]>(() => {
    if (!bounds) {
      return [];
    }
    return labelGroups.flatMap((group) =>
      getLabelGroupPlacements(bounds, group),
    );
  }, [bounds, labelGroups]);

  const knobPlacements = useMemo<Record<KnobId, LabelPlacement | null>>(() => {
    if (!bounds) {
      return { mode: null, size: null, contrast: null, blend: null };
    }
    const knobsGroup = labelGroups.find(
      (group) => group.yAlign === "bottom" && group.xAlign === "left",
    );
    if (!knobsGroup) {
      return { mode: null, size: null, contrast: null, blend: null };
    }
    const bottomPlacements = getLabelGroupPlacements(bounds, knobsGroup);
    const ids: KnobId[] = ["mode", "size", "contrast", "blend"];
    return ids.reduce(
      (acc, id, idx) => ({ ...acc, [id]: bottomPlacements[idx] ?? null }),
      {} as Record<KnobId, LabelPlacement | null>,
    );
  }, [bounds, labelGroups]);

  const placementsRef = useRef(placements);
  placementsRef.current = placements;

  const renderFrame = useCallback((currentBounds: FrameBounds) => {
    const next = getAnimationFrame({
      width: currentBounds.width,
      height: currentBounds.height,
      complexity: PLASMA_COMPLEXITY,
      zoomFactor: 1 / PLASMA_ZOOM,
      speedFactor: PLASMA_SPEED,
      characters: PLAYGROUND_CHARACTERS,
    });
    for (const { row, startCol, label } of placementsRef.current) {
      const targetRow = next[row];
      if (!targetRow) {
        continue;
      }
      for (let i = 0; i < label.label.length; i++) {
        if (targetRow[startCol + i]) {
          targetRow[startCol + i] = { character: " " };
        }
      }
    }
    setFrame(next);
  }, []);

  useEffect(() => {
    if (bounds) {
      renderFrame(bounds);
    }
  }, [bounds, renderFrame]);

  useInterval(
    () => {
      if (bounds && !isPaused) {
        renderFrame(bounds);
      }
    },
    1000 / (getIsReducedMotion() ? 0.5 : PLASMA_FPS),
  );

  const openKnobPlacement = openKnob ? knobPlacements[openKnob] : null;

  const canvasWidthPx = (bounds?.width ?? 0) * cellSize;
  const canvasHeightPx = (bounds?.height ?? 0) * cellSize;

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <div
        className="relative"
        style={{ width: canvasWidthPx, height: canvasHeightPx }}
      >
        <PlasmaCanvas frame={frame} cellSize={cellSize} fontPx={fontPx} />
        <LabelOverlay
          placements={placements}
          cellSize={cellSize}
          fontPx={fontPx}
        />
        <KnobDropdown
          openKnob={openKnob}
          placement={openKnobPlacement}
          cellSize={cellSize}
          knobs={knobs}
          webcamModesEnabled={false}
          onChange={handleKnobChange}
          onClose={closeKnob}
        />
      </div>
      <PlaygroundFooter />
    </div>
  );
};
