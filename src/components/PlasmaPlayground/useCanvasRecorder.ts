"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const RECORDER_MIME_CANDIDATES = [
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
] as const;

const pickSupportedMimeType = (): string | null => {
  if (typeof MediaRecorder === "undefined") {
    return null;
  }
  for (const candidate of RECORDER_MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(candidate)) {
      return candidate;
    }
  }
  return null;
};

export type RecorderStatus = "detecting" | "idle" | "recording" | "unsupported";

export type CanvasRecorderHandle = {
  status: RecorderStatus;
  elapsedSeconds: number;
  start: (canvas: HTMLCanvasElement, fps: number) => void;
  stop: () => void;
};

export const useCanvasRecorder = (
  onComplete: (blob: Blob, mimeType: string) => void,
): CanvasRecorderHandle => {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const mimeTypeRef = useRef<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const mime = pickSupportedMimeType();
    mimeTypeRef.current = mime;
    setSupported(mime !== null);
  }, []);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      return;
    }
    recorder.stop();
  }, []);

  const start = useCallback(
    (canvas: HTMLCanvasElement, fps: number) => {
      const mimeType = mimeTypeRef.current;
      if (!mimeType || isRecording) {
        return;
      }
      const stream = canvas.captureStream(fps);
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];
        if (tickerRef.current) {
          clearInterval(tickerRef.current);
          tickerRef.current = null;
        }
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        setIsRecording(false);
        setElapsedSeconds(0);
        if (blob.size > 0) {
          onCompleteRef.current(blob, mimeType);
        }
      };
      streamRef.current = stream;
      recorderRef.current = recorder;
      startedAtRef.current = performance.now();
      setElapsedSeconds(0);
      setIsRecording(true);
      recorder.start(1000);
      tickerRef.current = setInterval(() => {
        setElapsedSeconds(
          Math.floor((performance.now() - startedAtRef.current) / 1000),
        );
      }, 250);
    },
    [isRecording],
  );

  useEffect(() => {
    return () => {
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }
      if (tickerRef.current) {
        clearInterval(tickerRef.current);
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  let status: RecorderStatus;
  if (supported === null) {
    status = "detecting";
  } else if (!supported) {
    status = "unsupported";
  } else if (isRecording) {
    status = "recording";
  } else {
    status = "idle";
  }

  return { status, elapsedSeconds, start, stop };
};
