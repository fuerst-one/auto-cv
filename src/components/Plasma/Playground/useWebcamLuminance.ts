"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CONTRAST_LUT_GAINS } from "./constants";
import { ContrastKey } from "./types";

type SampleArgs = {
  width: number;
  height: number;
  cellAspect: number;
  contrast: ContrastKey;
};

export type WebcamSample = {
  luminance: Uint8Array;
  rgba: Uint8ClampedArray;
};

type UseWebcamLuminanceResult = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  sample: (args: SampleArgs) => WebcamSample | null;
  ready: boolean;
};

const buildContrastLut = (gain: number): Uint8Array => {
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    const centered = (i - 128) * gain + 128;
    lut[i] = centered < 0 ? 0 : centered > 255 ? 255 : centered;
  }
  return lut;
};

export const useWebcamLuminance = (
  stream: MediaStream | null,
): UseWebcamLuminanceResult => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const luminanceRef = useRef<Uint8Array | null>(null);
  const lastSizeRef = useRef<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [ready, setReady] = useState(false);

  const lutCache = useMemo(() => {
    return new Map<ContrastKey, Uint8Array>(
      (Object.keys(CONTRAST_LUT_GAINS) as ContrastKey[]).map((key) => [
        key,
        buildContrastLut(CONTRAST_LUT_GAINS[key]),
      ]),
    );
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    if (video.srcObject === stream) {
      return;
    }
    video.srcObject = stream;
    if (!stream) {
      setReady(false);
      return;
    }
    const handleLoaded = () => {
      void video.play().catch(() => {});
    };
    const handlePlaying = () => setReady(true);
    video.addEventListener("loadedmetadata", handleLoaded);
    video.addEventListener("playing", handlePlaying);
    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded);
      video.removeEventListener("playing", handlePlaying);
    };
  }, [stream]);

  const sample = useCallback(
    ({
      width,
      height,
      cellAspect,
      contrast,
    }: SampleArgs): WebcamSample | null => {
      const video = videoRef.current;
      if (!video || !ready || width <= 0 || height <= 0) {
        return null;
      }
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      if (videoWidth === 0 || videoHeight === 0) {
        return null;
      }

      let canvas = canvasRef.current;
      if (!canvas) {
        canvas = document.createElement("canvas");
        canvasRef.current = canvas;
      }
      const sized = lastSizeRef.current;
      if (sized.width !== width || sized.height !== height) {
        canvas.width = width;
        canvas.height = height;
        ctxRef.current = canvas.getContext("2d", { willReadFrequently: true });
        lastSizeRef.current = { width, height };
        luminanceRef.current = new Uint8Array(width * height);
      }
      const ctx = ctxRef.current;
      const luminance = luminanceRef.current;
      if (!ctx || !luminance) {
        return null;
      }

      const targetAspect = (width * cellAspect) / height;
      const sourceAspect = videoWidth / videoHeight;
      let sx = 0;
      let sy = 0;
      let sw = videoWidth;
      let sh = videoHeight;
      if (sourceAspect > targetAspect) {
        sw = videoHeight * targetAspect;
        sx = (videoWidth - sw) / 2;
      } else if (sourceAspect < targetAspect) {
        sh = videoWidth / targetAspect;
        sy = (videoHeight - sh) / 2;
      }

      ctx.save();
      ctx.setTransform(-1, 0, 0, 1, width, 0);
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, width, height);
      ctx.restore();

      const data = ctx.getImageData(0, 0, width, height).data;
      const lut = lutCache.get(contrast) ?? lutCache.get("medium")!;
      for (let i = 0, p = 0; i < luminance.length; i++, p += 4) {
        const lum =
          (data[p] * 299 + data[p + 1] * 587 + data[p + 2] * 114) / 1000;
        luminance[i] = lut[lum | 0];
      }
      return { luminance, rgba: data };
    },
    [ready, lutCache],
  );

  return { videoRef, sample, ready };
};
