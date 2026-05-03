import { mod } from "./mod";
import {
  ANGLE_INCREMENTS,
  CENTER_XS,
  CENTER_YS,
  CHARACTERS,
  RADII,
  SINE_TABLE,
} from "../constants";
import { Glyph } from "../types";

const angles = [0.0, 0.0, 0.0, 0.0];
let hueShift = 0;

export const getAnimationFrame = ({
  width,
  height,
  complexity,
  zoomFactor,
  speedFactor,
  characters = CHARACTERS,
  cellAspect = 1,
}: {
  width: number;
  height: number;
  complexity: number;
  zoomFactor: number;
  speedFactor: number;
  characters?: Glyph[];
  cellAspect?: number;
}) => {
  const frame: Glyph[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({ character: " " })),
  );

  const sxs: number[] = Array.from({ length: complexity });
  const ys: number[] = Array.from({ length: complexity });
  for (let i = 0; i < complexity; i++) {
    sxs[i] = Math.cos(angles[i]) * RADII[i] + CENTER_XS[i];
    ys[i] = Math.sin(angles[i]) * RADII[i] + CENTER_YS[i];
  }

  const xAspectSq = cellAspect * cellAspect;

  for (let y = 0; y < height; y++) {
    const xs = sxs.slice();
    for (let x = 0; x < width; x++) {
      let value = hueShift;
      for (let i = 0; i < complexity; i++) {
        const index = Math.round(
          (xs[i] * xs[i] * xAspectSq + ys[i] * ys[i]) * zoomFactor,
        );
        value += SINE_TABLE[(index >> 5) & 0xff];
      }
      const index = mod(Math.floor(value), characters.length);
      frame[y][x] = characters[index];
      for (let i = 0; i < complexity; i++) {
        xs[i] -= 1;
      }
    }
    for (let i = 0; i < complexity; i++) {
      ys[i] -= 1;
    }
  }

  const randomFactor = 0.5 + Math.random();

  for (let i = 0; i < complexity; i++) {
    angles[i] += ANGLE_INCREMENTS[i] * speedFactor * randomFactor;
  }
  hueShift += speedFactor * randomFactor;

  return frame;
};
