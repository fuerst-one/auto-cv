import { ContrastKey } from "./types";

export type Drawable = HTMLImageElement | HTMLVideoElement;

export type DrawableSize = {
  width: number;
  height: number;
};

export type SamplerArgs = {
  width: number;
  height: number;
  cellAspect: number;
  contrast: ContrastKey;
  mirror?: boolean;
};

export type LuminanceSample = {
  luminance: Uint8Array;
  rgba: Uint8ClampedArray;
};

type SamplerContext = {
  canvasRef: { current: HTMLCanvasElement | null };
  ctxRef: { current: CanvasRenderingContext2D | null };
  luminanceRef: { current: Uint8Array | null };
  lastSizeRef: { current: { width: number; height: number } };
};

export const createSamplerContext = (): SamplerContext => ({
  canvasRef: { current: null },
  ctxRef: { current: null },
  luminanceRef: { current: null },
  lastSizeRef: { current: { width: 0, height: 0 } },
});

const computeCoverCrop = (
  source: DrawableSize,
  targetWidth: number,
  targetHeight: number,
  cellAspect: number,
) => {
  const targetAspect = (targetWidth * cellAspect) / targetHeight;
  const sourceAspect = source.width / source.height;
  let sx = 0;
  let sy = 0;
  let sw = source.width;
  let sh = source.height;
  if (sourceAspect > targetAspect) {
    sw = source.height * targetAspect;
    sx = (source.width - sw) / 2;
  } else if (sourceAspect < targetAspect) {
    sh = source.width / targetAspect;
    sy = (source.height - sh) / 2;
  }
  return { sx, sy, sw, sh };
};

export const sampleDrawableToLuminance = (
  ctx: SamplerContext,
  drawable: Drawable,
  source: DrawableSize,
  args: SamplerArgs,
  lutCache: Map<ContrastKey, Uint8Array>,
): LuminanceSample | null => {
  const { width, height, cellAspect, contrast, mirror = false } = args;
  if (width <= 0 || height <= 0 || source.width === 0 || source.height === 0) {
    return null;
  }

  let canvas = ctx.canvasRef.current;
  if (!canvas) {
    canvas = document.createElement("canvas");
    ctx.canvasRef.current = canvas;
  }
  const sized = ctx.lastSizeRef.current;
  if (sized.width !== width || sized.height !== height) {
    canvas.width = width;
    canvas.height = height;
    ctx.ctxRef.current = canvas.getContext("2d", { willReadFrequently: true });
    ctx.lastSizeRef.current = { width, height };
    ctx.luminanceRef.current = new Uint8Array(width * height);
  }
  const canvasCtx = ctx.ctxRef.current;
  const luminance = ctx.luminanceRef.current;
  if (!canvasCtx || !luminance) {
    return null;
  }

  const { sx, sy, sw, sh } = computeCoverCrop(
    source,
    width,
    height,
    cellAspect,
  );

  canvasCtx.save();
  if (mirror) {
    canvasCtx.setTransform(-1, 0, 0, 1, width, 0);
  }
  canvasCtx.drawImage(drawable, sx, sy, sw, sh, 0, 0, width, height);
  canvasCtx.restore();

  const data = canvasCtx.getImageData(0, 0, width, height).data;
  const lut = lutCache.get(contrast) ?? lutCache.get("medium")!;
  for (let i = 0, p = 0; i < luminance.length; i++, p += 4) {
    const lum = (data[p] * 299 + data[p + 1] * 587 + data[p + 2] * 114) / 1000;
    luminance[i] = lut[lum | 0];
  }
  return { luminance, rgba: data };
};

const buildContrastLut = (gain: number): Uint8Array => {
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    const centered = (i - 128) * gain + 128;
    lut[i] = centered < 0 ? 0 : centered > 255 ? 255 : centered;
  }
  return lut;
};

export const buildContrastLutCache = (
  gains: Record<ContrastKey, number>,
): Map<ContrastKey, Uint8Array> => {
  return new Map<ContrastKey, Uint8Array>(
    (Object.keys(gains) as ContrastKey[]).map((key) => [
      key,
      buildContrastLut(gains[key]),
    ]),
  );
};
