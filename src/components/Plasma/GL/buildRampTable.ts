import { Glyph } from "../types";

export type RampEntry = {
  r: number;
  g: number;
  b: number;
  glyphIndex: number;
};

const HEX_RE = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;

const parseColor = (value: string | undefined): [number, number, number] => {
  if (!value) {
    return [255, 255, 255];
  }
  const match = value.match(HEX_RE);
  if (!match) {
    return [255, 255, 255];
  }
  return [
    parseInt(match[1], 16),
    parseInt(match[2], 16),
    parseInt(match[3], 16),
  ];
};

export const buildRampTable = (
  ramp: Glyph[],
  glyphIndexLookup: Map<string, number>,
): RampEntry[] => {
  return ramp.map((glyph) => {
    const color = glyph.style?.color;
    const colorString = typeof color === "string" ? color : undefined;
    const [r, g, b] = parseColor(colorString);
    const glyphIndex = glyphIndexLookup.get(glyph.character) ?? 0;
    return { r, g, b, glyphIndex };
  });
};

export const packRampToRGBA = (entries: RampEntry[]): Uint8Array => {
  const packed = new Uint8Array(entries.length * 4);
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    packed[i * 4 + 0] = e.r;
    packed[i * 4 + 1] = e.g;
    packed[i * 4 + 2] = e.b;
    packed[i * 4 + 3] = e.glyphIndex;
  }
  return packed;
};
