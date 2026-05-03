"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PermissionState } from "./types";

type UseWebcamStreamResult = {
  stream: MediaStream | null;
  permission: PermissionState;
  request: () => Promise<PermissionState>;
};

const stopStream = (stream: MediaStream | null) => {
  if (!stream) {
    return;
  }
  for (const track of stream.getTracks()) {
    track.stop();
  }
};

export const useWebcamStream = (active: boolean): UseWebcamStreamResult => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permission, setPermission] = useState<PermissionState>("idle");
  const streamRef = useRef<MediaStream | null>(null);
  const inFlightRef = useRef<Promise<PermissionState> | null>(null);

  const acquire = useCallback(async (): Promise<PermissionState> => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      setPermission("denied");
      return "denied";
    }
    setPermission("requesting");
    try {
      const next = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = next;
      setStream(next);
      setPermission("granted");
      return "granted";
    } catch {
      streamRef.current = null;
      setStream(null);
      setPermission("denied");
      return "denied";
    }
  }, []);

  const request = useCallback((): Promise<PermissionState> => {
    if (inFlightRef.current) {
      return inFlightRef.current;
    }
    if (streamRef.current && permission === "granted") {
      return Promise.resolve("granted");
    }
    const promise = acquire().finally(() => {
      inFlightRef.current = null;
    });
    inFlightRef.current = promise;
    return promise;
  }, [acquire, permission]);

  useEffect(() => {
    if (active) {
      return;
    }
    if (streamRef.current) {
      stopStream(streamRef.current);
      streamRef.current = null;
      setStream(null);
    }
  }, [active]);

  useEffect(() => {
    if (!active) {
      return;
    }
    if (permission === "granted" && !streamRef.current) {
      void acquire();
    }
  }, [active, permission, acquire]);

  useEffect(() => {
    return () => {
      stopStream(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  return { stream, permission, request };
};
