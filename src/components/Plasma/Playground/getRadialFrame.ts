import { Glyph } from "../types";
import { getLuminanceFrame } from "./getLuminanceFrame";
import { getRadialLuminance } from "./getRadialLuminance";

type GetRadialFrameArgs = {
  width: number;
  height: number;
  ramp: Glyph[];
  cellAspect: number;
};

export const getRadialFrame = ({
  width,
  height,
  ramp,
  cellAspect,
}: GetRadialFrameArgs): Glyph[][] => {
  const luminance = getRadialLuminance({ width, height, cellAspect });
  return getLuminanceFrame({ luminance, ramp, width, height });
};
