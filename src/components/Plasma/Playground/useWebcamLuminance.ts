"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CONTRAST_LUT_GAINS } from "./constants";
import {
  buildContrastLutCache,
  createSamplerContext,
  LuminanceSample,
  SamplerArgs,
  sampleDrawableToLuminance,
} from "./sampleDrawableToLuminance";

type UseWebcamLuminanceResult = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  sample: (args: SamplerArgs) => LuminanceSample | null;
  ready: boolean;
};

export const useWebcamLuminance = (
  stream: MediaStream | null,
): UseWebcamLuminanceResult => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const samplerCtxRef = useRef(createSamplerContext());
  const [ready, setReady] = useState(false);

  const lutCache = useMemo(() => buildContrastLutCache(CONTRAST_LUT_GAINS), []);

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
    (args: SamplerArgs): LuminanceSample | null => {
      const video = videoRef.current;
      if (!video || !ready) {
        return null;
      }
      return sampleDrawableToLuminance(
        samplerCtxRef.current,
        video,
        { width: video.videoWidth, height: video.videoHeight },
        { ...args, mirror: true },
        lutCache,
      );
    },
    [ready, lutCache],
  );

  return { videoRef, sample, ready };
};
