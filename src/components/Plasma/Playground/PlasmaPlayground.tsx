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
import { KnobDropdown } from "./KnobDropdown";
import { PlaygroundFooter } from "./PlaygroundFooter";
import { getPlaygroundLabels } from "./playgroundLabels";
import { getSplashLabels } from "./splashLabels";
import { useWebcamStream } from "./useWebcamStream";
import { useWebcamLuminance } from "./useWebcamLuminance";
import { getWebcamFrame } from "./getWebcamFrame";
import {
  DEFAULT_KNOBS,
  PLASMA_COMPLEXITY,
  PLASMA_FPS,
  PLASMA_SPEED,
  PLASMA_ZOOM,
  PLAYGROUND_PALETTES,
  SIZE_PRESETS,
  SPLASH_LOCAL_STORAGE_KEY,
  WEBCAM_FPS,
  WEBCAM_RAMPS,
} from "./constants";
import { KnobId, KnobState, Mode, SplashChoice } from "./types";

const FOOTER_RESERVED_PX = 40;

const readSplashChoice = (): SplashChoice => {
  if (typeof window === "undefined") {
    return null;
  }
  const stored = window.localStorage.getItem(SPLASH_LOCAL_STORAGE_KEY);
  if (stored === "camera" || stored === "plasma-only") {
    return stored;
  }
  return null;
};

const writeSplashChoice = (choice: Exclude<SplashChoice, null>) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(SPLASH_LOCAL_STORAGE_KEY, choice);
};

export const PlasmaPlayground = () => {
  const [knobs, setKnobs] = useState<KnobState>(DEFAULT_KNOBS);
  const [openKnob, setOpenKnob] = useState<KnobId | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [bounds, setBounds] = useState<FrameBounds | null>(null);
  const [frame, setFrame] = useState<Glyph[][] | null>(null);
  const [splashChoice, setSplashChoice] = useState<SplashChoice>(null);
  const [splashHydrated, setSplashHydrated] = useState(false);
  const [pendingMode, setPendingMode] = useState<Mode | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef<Glyph[][] | null>(null);

  const sizeMetrics = SIZE_PRESETS[knobs.size];
  const { cellSize, fontPx } = sizeMetrics;
  const cellWidth = sizeMetrics.cellWidth ?? cellSize;
  const showSplash = splashHydrated && splashChoice === null;
  const showChrome = splashHydrated && splashChoice !== null;
  const isWebcamMode = knobs.mode !== "plasma";

  const { stream, permission, request } = useWebcamStream(isWebcamMode);
  const { videoRef, sample, ready } = useWebcamLuminance(stream);

  useEffect(() => {
    setSplashChoice(readSplashChoice());
    setSplashHydrated(true);
  }, []);

  useEffect(() => {
    const update = () => {
      const width = Math.floor(window.innerWidth / cellWidth) - 1;
      const height =
        Math.floor((window.innerHeight - FOOTER_RESERVED_PX) / cellSize) - 1;
      setBounds({ width: Math.max(10, width), height: Math.max(10, height) });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [cellSize, cellWidth]);

  const togglePause = useCallback(() => setIsPaused((p) => !p), []);
  const toggleKnob = useCallback(
    (id: KnobId) => setOpenKnob((cur) => (cur === id ? null : id)),
    [],
  );
  const closeKnob = useCallback(() => setOpenKnob(null), []);

  const handleCopy = useCallback(() => {
    const current = frameRef.current;
    if (!current || typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }
    const text = current
      .map((row) => row.map((glyph) => glyph.character).join(""))
      .join("\n");
    void navigator.clipboard.writeText(text).then(() => {
      setCopyStatus("copied");
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = setTimeout(() => {
        setCopyStatus("idle");
        copyTimerRef.current = null;
      }, 1500);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const requestModeChange = useCallback(
    async (next: Mode) => {
      if (next === knobs.mode) {
        return;
      }
      if (next === "plasma") {
        setKnobs((prev) => ({ ...prev, mode: "plasma" }));
        setPendingMode(null);
        return;
      }
      if (permission === "granted") {
        setKnobs((prev) => ({ ...prev, mode: next }));
        return;
      }
      setPendingMode(next);
      const result = await request();
      if (result === "granted") {
        setKnobs((prev) => ({ ...prev, mode: next }));
        setPendingMode(null);
        return;
      }
      setPendingMode(null);
      writeSplashChoice("plasma-only");
      setSplashChoice("plasma-only");
    },
    [knobs.mode, permission, request],
  );

  const handleKnobChange = useCallback(
    <K extends keyof KnobState>(key: K, value: KnobState[K]) => {
      if (key === "mode") {
        setOpenKnob(null);
        void requestModeChange(value as Mode);
        return;
      }
      setKnobs((prev) => ({ ...prev, [key]: value }));
      setOpenKnob(null);
    },
    [requestModeChange],
  );

  const handleChooseCamera = useCallback(() => {
    writeSplashChoice("camera");
    setSplashChoice("camera");
    void requestModeChange("ascii");
  }, [requestModeChange]);

  const handleChoosePlasma = useCallback(() => {
    writeSplashChoice("plasma-only");
    setSplashChoice("plasma-only");
  }, []);

  useEffect(() => {
    if (splashChoice !== "camera" || pendingMode !== null) {
      return;
    }
    if (knobs.mode !== "plasma" || permission !== "idle") {
      return;
    }
    void requestModeChange("ascii");
  }, [splashChoice, pendingMode, knobs.mode, permission, requestModeChange]);

  const labelGroups: LabelGroup[] = useMemo(() => {
    if (showSplash) {
      return getSplashLabels({
        fontPx,
        onChooseCamera: handleChooseCamera,
        onChoosePlasma: handleChoosePlasma,
      });
    }
    if (!showChrome) {
      return [];
    }
    return getPlaygroundLabels({
      isPaused,
      copyStatus,
      onTogglePause: togglePause,
      onKnobToggle: toggleKnob,
      onCopy: handleCopy,
    });
  }, [
    showSplash,
    showChrome,
    fontPx,
    handleChooseCamera,
    handleChoosePlasma,
    isPaused,
    copyStatus,
    togglePause,
    toggleKnob,
    handleCopy,
  ]);

  const placements = useMemo<LabelPlacement[]>(() => {
    if (!bounds) {
      return [];
    }
    return labelGroups.flatMap((group) =>
      getLabelGroupPlacements(bounds, group),
    );
  }, [bounds, labelGroups]);

  const knobPlacements = useMemo<Record<KnobId, LabelPlacement | null>>(() => {
    const empty: Record<KnobId, LabelPlacement | null> = {
      mode: null,
      size: null,
      contrast: null,
    };
    if (!bounds || !showChrome) {
      return empty;
    }
    const knobsGroup = labelGroups.find(
      (group) => group.yAlign === "bottom" && group.xAlign === "left",
    );
    if (!knobsGroup) {
      return empty;
    }
    const bottomPlacements = getLabelGroupPlacements(bounds, knobsGroup);
    const ids: KnobId[] = ["mode", "size", "contrast"];
    return ids.reduce(
      (acc, id, idx) => ({ ...acc, [id]: bottomPlacements[idx] ?? null }),
      empty,
    );
  }, [bounds, labelGroups, showChrome]);

  const placementsRef = useRef(placements);
  placementsRef.current = placements;
  const knobsRef = useRef(knobs);
  knobsRef.current = knobs;
  const sampleRef = useRef(sample);
  sampleRef.current = sample;
  const readyRef = useRef(ready);
  readyRef.current = ready;

  const blankLabelsInPlace = useCallback((target: Glyph[][]) => {
    for (const { row, startCol, label } of placementsRef.current) {
      const targetRow = target[row];
      if (!targetRow) {
        continue;
      }
      for (let i = 0; i < label.label.length; i++) {
        if (targetRow[startCol + i]) {
          targetRow[startCol + i] = { character: " " };
        }
      }
    }
  }, []);

  const renderFrame = useCallback(
    (currentBounds: FrameBounds) => {
      const k = knobsRef.current;
      const palette = PLAYGROUND_PALETTES[k.contrast];
      const ramp = WEBCAM_RAMPS[k.contrast];
      const { width, height } = currentBounds;

      const sampleResult =
        k.mode !== "plasma" && readyRef.current
          ? sampleRef.current({
              width,
              height,
              cellAspect: cellWidth / cellSize,
              contrast: k.contrast,
            })
          : null;

      let next: Glyph[][];
      if (k.mode === "ascii" && sampleResult) {
        next = getWebcamFrame({
          luminance: sampleResult.luminance,
          ramp,
          width,
          height,
        });
      } else {
        next = getAnimationFrame({
          width,
          height,
          complexity: PLASMA_COMPLEXITY,
          zoomFactor: 1 / PLASMA_ZOOM,
          speedFactor: PLASMA_SPEED,
          characters: palette,
          cellAspect: cellWidth / cellSize,
        });
      }
      blankLabelsInPlace(next);
      frameRef.current = next;
      setFrame(next);
    },
    [blankLabelsInPlace, cellWidth, cellSize],
  );

  useEffect(() => {
    if (bounds) {
      renderFrame(bounds);
    }
  }, [bounds, renderFrame, knobs.size, knobs.contrast]);

  const targetFps = isWebcamMode ? WEBCAM_FPS : PLASMA_FPS;
  const reducedMotion =
    knobs.mode === "plasma" && getIsReducedMotion() ? 0.5 : null;
  const intervalMs = 1000 / (reducedMotion ?? targetFps);

  useInterval(() => {
    if (bounds && !isPaused) {
      renderFrame(bounds);
    }
  }, intervalMs);

  const openKnobPlacement = openKnob ? knobPlacements[openKnob] : null;
  const canvasWidthPx = (bounds?.width ?? 0) * cellWidth;
  const canvasHeightPx = (bounds?.height ?? 0) * cellSize;

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <div
        className="relative"
        style={{ width: canvasWidthPx, height: canvasHeightPx }}
      >
        <PlasmaCanvas
          frame={frame}
          cellSize={cellSize}
          cellWidth={cellWidth}
          fontPx={fontPx}
        />
        <LabelOverlay
          placements={placements}
          cellSize={cellSize}
          cellWidth={cellWidth}
          fontPx={fontPx}
        />
        <KnobDropdown
          openKnob={openKnob}
          placement={openKnobPlacement}
          cellSize={cellSize}
          cellWidth={cellWidth}
          knobs={knobs}
          webcamModesEnabled
          onChange={handleKnobChange}
          onClose={closeKnob}
        />
      </div>
      <PlaygroundFooter />
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        aria-hidden
        className="pointer-events-none absolute h-px w-px opacity-0"
        style={{ top: 0, left: 0 }}
      />
    </div>
  );
};
