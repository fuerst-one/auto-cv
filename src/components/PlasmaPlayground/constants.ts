import {
  PLAYGROUND_CHARACTERS,
  PLAYGROUND_CHARACTERS_HIGH,
  PLAYGROUND_CHARACTERS_LOW,
} from "../Plasma/constants";
import { Glyph } from "../Plasma/types";
import { Metrics } from "../Plasma/useResponsiveMetrics";
import { ContrastKey, KnobState, SizeKey } from "./types";

export const PLAYGROUND_PALETTES: Record<ContrastKey, Glyph[]> = {
  low: PLAYGROUND_CHARACTERS_LOW,
  medium: PLAYGROUND_CHARACTERS,
  high: PLAYGROUND_CHARACTERS_HIGH,
};

const halfRamp = (palette: Glyph[]): Glyph[] =>
  palette.slice(0, palette.length / 2);

export const WEBCAM_RAMPS: Record<ContrastKey, Glyph[]> = {
  low: halfRamp(PLAYGROUND_CHARACTERS_LOW),
  medium: halfRamp(PLAYGROUND_CHARACTERS),
  high: halfRamp(PLAYGROUND_CHARACTERS_HIGH),
};

export const SIZE_PRESETS: Record<SizeKey, Metrics> = {
  small: { cellSize: 8, cellWidth: 5, fontPx: 8 },
  medium: { cellSize: 12, cellWidth: 7, fontPx: 12 },
  large: { cellSize: 18, cellWidth: 11, fontPx: 18 },
};

export const CONTRAST_LUT_GAINS: Record<ContrastKey, number> = {
  low: 0.7,
  medium: 1.0,
  high: 1.6,
};

export const SPLASH_LOCAL_STORAGE_KEY = "plasma:splash";
export const KNOBS_LOCAL_STORAGE_KEY = "plasma:knobs";

export const DEFAULT_KNOBS: KnobState = {
  source: "plasma",
  size: "medium",
  contrast: "medium",
};
