import { Metrics } from "../useResponsiveMetrics";
import { ContrastKey, KnobState, SizeKey } from "./types";

export const SIZE_PRESETS: Record<SizeKey, Metrics> = {
  small: { cellSize: 16, fontPx: 11 },
  medium: { cellSize: 20, fontPx: 14 },
  large: { cellSize: 26, fontPx: 18 },
};

export const CONTRAST_PRESETS: Record<ContrastKey, number> = {
  low: 0.7,
  medium: 1.0,
  high: 1.6,
};

export const PLASMA_FPS = 10;
export const WEBCAM_FPS = 24;

export const PLASMA_COMPLEXITY = 4;
export const PLASMA_ZOOM = 25;
export const PLASMA_SPEED = 0.25;

export const SPLASH_LOCAL_STORAGE_KEY = "plasma:splash";

export const DEFAULT_KNOBS: KnobState = {
  mode: "plasma",
  size: "medium",
  contrast: "medium",
  blendStrength: 0.5,
};
