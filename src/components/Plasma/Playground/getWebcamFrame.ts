import { Glyph } from "../types";

type GetWebcamFrameArgs = {
  luminance: Uint8Array;
  ramp: Glyph[];
  width: number;
  height: number;
};

export const getWebcamFrame = ({
  luminance,
  ramp,
  width,
  height,
}: GetWebcamFrameArgs): Glyph[][] => {
  const lastIdx = ramp.length - 1;
  const scale = ramp.length / 256;
  const frame: Glyph[][] = Array.from(
    { length: height },
    () => new Array<Glyph>(width),
  );
  for (let y = 0; y < height; y++) {
    const row = frame[y];
    const offset = y * width;
    for (let x = 0; x < width; x++) {
      const lum = luminance[offset + x];
      const scaled = (lum * scale) | 0;
      const idx = lastIdx - (scaled > lastIdx ? lastIdx : scaled);
      row[x] = ramp[idx];
    }
  }
  return frame;
};
