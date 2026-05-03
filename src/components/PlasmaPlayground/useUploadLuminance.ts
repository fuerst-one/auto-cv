"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CONTRAST_LUT_GAINS } from "./constants";
import {
  buildContrastLutCache,
  createSamplerContext,
  Drawable,
  LuminanceSample,
  SamplerArgs,
  sampleDrawableToLuminance,
} from "./sampleDrawableToLuminance";

type UseUploadLuminanceResult = {
  sample: (args: SamplerArgs) => LuminanceSample | null;
  ready: boolean;
};

export const useUploadLuminance = (
  file: File | null,
): UseUploadLuminanceResult => {
  const drawableRef = useRef<Drawable | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const samplerCtxRef = useRef(createSamplerContext());
  const [ready, setReady] = useState(false);

  const lutCache = useMemo(() => buildContrastLutCache(CONTRAST_LUT_GAINS), []);

  useEffect(() => {
    if (!file) {
      drawableRef.current = null;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setReady(false);
      return;
    }

    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setReady(false);

    let cancelled = false;

    if (file.type.startsWith("image/")) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (cancelled) {
          return;
        }
        drawableRef.current = img;
        setReady(true);
      };
      img.onerror = () => {
        if (cancelled) {
          return;
        }
        drawableRef.current = null;
        setReady(false);
      };
      img.src = url;
    } else if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.autoplay = true;
      video.crossOrigin = "anonymous";
      const handleReady = () => {
        if (cancelled) {
          return;
        }
        drawableRef.current = video;
        void video.play().catch(() => {});
        setReady(true);
      };
      video.addEventListener("loadeddata", handleReady, { once: true });
      video.src = url;
    } else {
      drawableRef.current = null;
      setReady(false);
    }

    return () => {
      cancelled = true;
      const drawable = drawableRef.current;
      if (drawable instanceof HTMLVideoElement) {
        drawable.pause();
        drawable.removeAttribute("src");
        drawable.load();
      }
      drawableRef.current = null;
      if (objectUrlRef.current === url) {
        URL.revokeObjectURL(url);
        objectUrlRef.current = null;
      }
      setReady(false);
    };
  }, [file]);

  const sample = useCallback(
    (args: SamplerArgs): LuminanceSample | null => {
      const drawable = drawableRef.current;
      if (!drawable || !ready) {
        return null;
      }
      const sourceWidth =
        drawable instanceof HTMLVideoElement
          ? drawable.videoWidth
          : drawable instanceof HTMLImageElement
            ? drawable.naturalWidth
            : drawable.width;
      const sourceHeight =
        drawable instanceof HTMLVideoElement
          ? drawable.videoHeight
          : drawable instanceof HTMLImageElement
            ? drawable.naturalHeight
            : drawable.height;
      return sampleDrawableToLuminance(
        samplerCtxRef.current,
        drawable,
        { width: sourceWidth, height: sourceHeight },
        args,
        lutCache,
      );
    },
    [ready, lutCache],
  );

  return { sample, ready };
};
