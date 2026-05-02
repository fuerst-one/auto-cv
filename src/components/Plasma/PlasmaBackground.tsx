"use client";

import { useEffect, useRef, useState } from "react";
import { FrameBounds, Glyph } from "./types";
import { getAnimationFrame } from "./getAnimationFrame";
import { useInterval } from "./useInterval";
import { getIsReducedMotion } from "./getIsReducedMotion";

const CELL_SIZE_PX = 20;
const COMPLEXITY = 4;
const ZOOM = 25;
const SPEED = 0.25;
const FPS = 8;

export const PlasmaBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState<FrameBounds | null>(null);
  const [frame, setFrame] = useState<Glyph[][] | null>(null);

  useEffect(() => {
    const updateBounds = () => {
      if (!containerRef.current) {
        return;
      }
      const width = Math.ceil(window.innerWidth / CELL_SIZE_PX);
      const height = Math.ceil(window.innerHeight / CELL_SIZE_PX);
      setBounds({ width, height });
    };
    updateBounds();
    window.addEventListener("resize", updateBounds);
    return () => {
      window.removeEventListener("resize", updateBounds);
    };
  }, []);

  useInterval(
    () => {
      if (!bounds) {
        return;
      }
      setFrame(
        getAnimationFrame({
          ...bounds,
          complexity: COMPLEXITY,
          zoomFactor: 1 / ZOOM,
          speedFactor: SPEED,
        }),
      );
    },
    1000 / (getIsReducedMotion() ? 0.5 : FPS),
  );

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden text-[15px] leading-none opacity-40"
      style={{ fontFamily: "var(--font-plex), monospace" }}
    >
      {frame?.map((row, idx) => (
        <pre key={idx} className="m-0 p-0">
          {row.map((glyph, jdx) => (
            <span
              key={`${idx}-${jdx}`}
              style={{
                ...glyph.style,
                width: CELL_SIZE_PX,
                height: CELL_SIZE_PX,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {glyph.character}
            </span>
          ))}
        </pre>
      ))}
    </div>
  );
};
