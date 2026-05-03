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
import { LegalFooter } from "../LegalFooter";
import { getPlaygroundLabels } from "./playgroundLabels";
import { getSplashLabels } from "./splashLabels";
import { useWebcamStream } from "./useWebcamStream";
import { useWebcamLuminance } from "./useWebcamLuminance";
import { useUploadLuminance } from "./useUploadLuminance";
import { getLuminanceFrame } from "./getLuminanceFrame";
import { getRadialFrame } from "./getRadialFrame";
import {
  PLASMA_COMPLEXITY,
  PLASMA_FPS,
  PLASMA_REDUCED_FPS,
  PLASMA_SPEED,
  PLASMA_ZOOM,
  WEBCAM_FPS,
} from "../constants";
import {
  DEFAULT_KNOBS,
  PLAYGROUND_PALETTES,
  SIZE_PRESETS,
  SPLASH_LOCAL_STORAGE_KEY,
  WEBCAM_RAMPS,
} from "./constants";
import { KnobId, KnobState, Source, SplashChoice } from "./types";

const FOOTER_RESERVED_PX = 40;

const readSplashChoice = (): SplashChoice => {
  if (typeof window === "undefined") {
    return null;
  }
  const stored = window.localStorage.getItem(SPLASH_LOCAL_STORAGE_KEY);
  if (stored === "camera" || stored === "upload" || stored === "plasma") {
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

const isSupportedUploadFile = (file: File): boolean =>
  file.type.startsWith("image/") || file.type.startsWith("video/");

const pickFileFromDataTransfer = (dataTransfer: DataTransfer): File | null => {
  const items = dataTransfer.items;
  if (items) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind !== "file") {
        continue;
      }
      const file = item.getAsFile();
      if (file && isSupportedUploadFile(file)) {
        return file;
      }
    }
  }
  const files = dataTransfer.files;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (isSupportedUploadFile(file)) {
      return file;
    }
  }
  return null;
};

export const PlasmaPlayground = () => {
  const [knobs, setKnobs] = useState<KnobState>(DEFAULT_KNOBS);
  const [openKnob, setOpenKnob] = useState<KnobId | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [bounds, setBounds] = useState<FrameBounds | null>(null);
  const [frame, setFrame] = useState<Glyph[][] | null>(null);
  const [splashChoice, setSplashChoice] = useState<SplashChoice>(null);
  const [splashHydrated, setSplashHydrated] = useState(false);
  const [pendingSource, setPendingSource] = useState<Source | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef<Glyph[][] | null>(null);

  const sizeMetrics = SIZE_PRESETS[knobs.size];
  const { cellSize, fontPx } = sizeMetrics;
  const cellWidth = sizeMetrics.cellWidth ?? cellSize;
  const showSplash = splashHydrated && splashChoice === null;
  const showChrome = splashHydrated && splashChoice !== null;
  const isCameraSource = knobs.source === "camera";
  const isUploadSource = knobs.source === "upload";

  const { stream, permission, request } = useWebcamStream(isCameraSource);
  const {
    videoRef,
    sample: sampleCamera,
    ready: cameraReady,
  } = useWebcamLuminance(stream);
  const { sample: sampleUpload, ready: uploadReady } =
    useUploadLuminance(uploadedFile);

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

  const requestSourceChange = useCallback(
    async (next: Source) => {
      if (next === knobs.source) {
        return;
      }
      if (next === "plasma" || next === "upload") {
        setKnobs((prev) => ({ ...prev, source: next }));
        setPendingSource(null);
        return;
      }
      if (permission === "granted") {
        setKnobs((prev) => ({ ...prev, source: next }));
        return;
      }
      setPendingSource(next);
      const result = await request();
      if (result === "granted") {
        setKnobs((prev) => ({ ...prev, source: next }));
        setPendingSource(null);
        return;
      }
      setPendingSource(null);
      writeSplashChoice("plasma");
      setSplashChoice("plasma");
    },
    [knobs.source, permission, request],
  );

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const adoptFile = useCallback((file: File) => {
    setUploadedFile(file);
    setKnobs((prev) =>
      prev.source === "upload" ? prev : { ...prev, source: "upload" },
    );
    setSplashChoice((prev) => {
      if (prev !== null) {
        return prev;
      }
      writeSplashChoice("upload");
      return "upload";
    });
  }, []);

  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (file && isSupportedUploadFile(file)) {
        adoptFile(file);
      }
    },
    [adoptFile],
  );

  const handleKnobChange = useCallback(
    <K extends keyof KnobState>(key: K, value: KnobState[K]) => {
      if (key === "source") {
        setOpenKnob(null);
        void requestSourceChange(value as Source);
        return;
      }
      setKnobs((prev) => ({ ...prev, [key]: value }));
      setOpenKnob(null);
    },
    [requestSourceChange],
  );

  const handleChooseCamera = useCallback(() => {
    writeSplashChoice("camera");
    setSplashChoice("camera");
    void requestSourceChange("camera");
  }, [requestSourceChange]);

  const handleChooseUpload = useCallback(() => {
    writeSplashChoice("upload");
    setSplashChoice("upload");
    void requestSourceChange("upload");
    openFilePicker();
  }, [requestSourceChange, openFilePicker]);

  const handleChoosePlasma = useCallback(() => {
    writeSplashChoice("plasma");
    setSplashChoice("plasma");
  }, []);

  useEffect(() => {
    if (pendingSource !== null) {
      return;
    }
    if (splashChoice === "camera") {
      if (knobs.source !== "plasma" || permission !== "idle") {
        return;
      }
      void requestSourceChange("camera");
      return;
    }
    if (splashChoice === "upload") {
      if (knobs.source === "plasma") {
        setKnobs((prev) => ({ ...prev, source: "upload" }));
      }
    }
  }, [
    splashChoice,
    pendingSource,
    knobs.source,
    permission,
    requestSourceChange,
  ]);

  useEffect(() => {
    const handleDragOver = (event: DragEvent) => {
      if (!event.dataTransfer) {
        return;
      }
      const items = event.dataTransfer.items;
      const hasFile =
        items && Array.from(items).some((item) => item.kind === "file");
      if (!hasFile) {
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    };
    const handleDrop = (event: DragEvent) => {
      if (!event.dataTransfer) {
        return;
      }
      const file = pickFileFromDataTransfer(event.dataTransfer);
      if (!file) {
        return;
      }
      event.preventDefault();
      adoptFile(file);
    };
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);
    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [adoptFile]);

  const showUploadPrompt = isUploadSource && !uploadedFile;

  const labelGroups: LabelGroup[] = useMemo(() => {
    if (showSplash) {
      return getSplashLabels({
        fontPx,
        onChooseCamera: handleChooseCamera,
        onChooseUpload: handleChooseUpload,
        onChoosePlasma: handleChoosePlasma,
      });
    }
    if (!showChrome) {
      return [];
    }
    return getPlaygroundLabels({
      isPaused,
      copyStatus,
      showUploadPrompt,
      onTogglePause: togglePause,
      onKnobToggle: toggleKnob,
      onCopy: handleCopy,
      onUpload: openFilePicker,
    });
  }, [
    showSplash,
    showChrome,
    fontPx,
    handleChooseCamera,
    handleChooseUpload,
    handleChoosePlasma,
    isPaused,
    copyStatus,
    showUploadPrompt,
    togglePause,
    toggleKnob,
    handleCopy,
    openFilePicker,
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
      source: null,
      size: null,
      contrast: null,
    };
    if (!bounds || !showChrome) {
      return empty;
    }
    const knobsGroup = labelGroups.find(
      (group) => group.yAlign === "bottom" && group.xAlign === "center",
    );
    if (!knobsGroup) {
      return empty;
    }
    const bottomPlacements = getLabelGroupPlacements(bounds, knobsGroup);
    const ids: KnobId[] = ["source", "size", "contrast"];
    return ids.reduce(
      (acc, id, idx) => ({ ...acc, [id]: bottomPlacements[idx] ?? null }),
      empty,
    );
  }, [bounds, labelGroups, showChrome]);

  const placementsRef = useRef(placements);
  placementsRef.current = placements;
  const knobsRef = useRef(knobs);
  knobsRef.current = knobs;
  const sampleCameraRef = useRef(sampleCamera);
  sampleCameraRef.current = sampleCamera;
  const cameraReadyRef = useRef(cameraReady);
  cameraReadyRef.current = cameraReady;
  const sampleUploadRef = useRef(sampleUpload);
  sampleUploadRef.current = sampleUpload;
  const uploadReadyRef = useRef(uploadReady);
  uploadReadyRef.current = uploadReady;

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
      const cellAspect = cellWidth / cellSize;

      let next: Glyph[][];
      if (k.source === "camera" && cameraReadyRef.current) {
        const sampleResult = sampleCameraRef.current({
          width,
          height,
          cellAspect,
          contrast: k.contrast,
        });
        next = sampleResult
          ? getLuminanceFrame({
              luminance: sampleResult.luminance,
              ramp,
              width,
              height,
            })
          : getAnimationFrame({
              width,
              height,
              complexity: PLASMA_COMPLEXITY,
              zoomFactor: 1 / PLASMA_ZOOM,
              speedFactor: PLASMA_SPEED,
              characters: palette,
              cellAspect,
            });
      } else if (k.source === "upload") {
        const sampleResult = uploadReadyRef.current
          ? sampleUploadRef.current({
              width,
              height,
              cellAspect,
              contrast: k.contrast,
            })
          : null;
        next = sampleResult
          ? getLuminanceFrame({
              luminance: sampleResult.luminance,
              ramp,
              width,
              height,
            })
          : getRadialFrame({ width, height, ramp, cellAspect });
      } else {
        next = getAnimationFrame({
          width,
          height,
          complexity: PLASMA_COMPLEXITY,
          zoomFactor: 1 / PLASMA_ZOOM,
          speedFactor: PLASMA_SPEED,
          characters: palette,
          cellAspect,
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

  const isAnimatedSource =
    knobs.source === "camera" ||
    (knobs.source === "upload" &&
      uploadedFile?.type.startsWith("video/") === true);
  const targetFps = isAnimatedSource ? WEBCAM_FPS : PLASMA_FPS;
  const reducedMotion =
    knobs.source === "plasma" && getIsReducedMotion()
      ? PLASMA_REDUCED_FPS
      : null;
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
          cameraSourceEnabled
          onChange={handleKnobChange}
          onClose={closeKnob}
        />
      </div>
      <LegalFooter />
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        aria-hidden
        className="pointer-events-none absolute h-px w-px opacity-0"
        style={{ top: 0, left: 0 }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileInputChange}
      />
    </div>
  );
};
