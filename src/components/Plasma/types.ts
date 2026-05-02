import { CSSProperties } from "react";

export type FrameBounds = {
  width: number;
  height: number;
};

export type Glyph = {
  character: string;
  style?: CSSProperties;
  className?: string;
};
