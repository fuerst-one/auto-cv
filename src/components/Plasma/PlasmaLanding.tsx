"use client";

import { ComponentPropsWithoutRef, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FrameBounds, Glyph } from "./types";
import { getAnimationFrame } from "./getAnimationFrame";
import { useInterval } from "./useInterval";
import { getIsReducedMotion } from "./getIsReducedMotion";
import { getLabelsGroups } from "./labelGroups";
import { insertLabelGroup } from "./insertLabelGroup";
import { LANDING_CHARACTERS } from "./constants";

const CELL_SIZE_PX = 24;
const COMPLEXITY = 4;
const ZOOM = 25;
const SPEED = 0.25;
const FPS = 10;

const loadingLabel: Glyph[] = "FUERST.ONE".split("").map((character) => ({
  character,
  className: "font-bold",
}));

export const PlasmaLanding = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState<FrameBounds | null>(null);

  useEffect(() => {
    const updateBounds = () => {
      if (!containerRef.current) {
        return;
      }
      const width = Math.floor(window.innerWidth / CELL_SIZE_PX) - 1;
      const height = Math.floor(window.innerHeight / CELL_SIZE_PX) - 1;
      setBounds({ width, height });
    };
    const resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(containerRef.current!);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="text-md flex h-screen w-screen flex-col items-center justify-center leading-none"
      style={{ fontFamily: "var(--font-plex), monospace" }}
    >
      <Frame bounds={bounds} />
    </div>
  );
};

const Frame = ({ bounds }: { bounds: FrameBounds | null }) => {
  const [frame, setFrame] = useState<Glyph[][] | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleIsPlaying = () => setIsPlaying((prev) => !prev);

  useInterval(
    () => {
      if (!bounds || !isPlaying) {
        return;
      }
      const nextFrame = getAnimationFrame({
        ...bounds,
        complexity: COMPLEXITY,
        zoomFactor: 1 / ZOOM,
        speedFactor: SPEED,
        characters: LANDING_CHARACTERS,
      });
      for (const labelGroup of getLabelsGroups(isPlaying, toggleIsPlaying)) {
        insertLabelGroup(nextFrame, labelGroup);
      }
      setFrame(nextFrame);
    },
    1000 / (getIsReducedMotion() ? 0.5 : FPS),
  );

  if (!frame) {
    return (
      <div style={{ marginTop: -CELL_SIZE_PX }}>
        {loadingLabel.map((glyph, idx) => (
          <GlyphCell key={idx} {...glyph} />
        ))}
      </div>
    );
  }

  return (
    <>
      {frame.map((row, idx) => (
        <pre key={idx} className="m-0 p-0">
          {row.map((glyph, jdx) => (
            <GlyphCell key={`${idx}-${jdx}`} {...glyph} />
          ))}
        </pre>
      ))}
    </>
  );
};

const GlyphCell = ({ character, style, className, href, onClick }: Glyph) => {
  const baseClass = `inline-flex items-center justify-center ${
    onClick || href ? "cursor-pointer" : ""
  } ${className ?? ""}`;
  const cellStyle = { ...style, width: CELL_SIZE_PX, height: CELL_SIZE_PX };

  if (href) {
    return (
      <Link
        href={href}
        style={cellStyle}
        className={baseClass}
        onClick={onClick}
      >
        {character}
      </Link>
    );
  }
  return (
    <Span
      style={cellStyle}
      className={baseClass}
      aria-hidden={!onClick}
      onClick={onClick}
    >
      {character}
    </Span>
  );
};

const Span = (props: ComponentPropsWithoutRef<"span">) => <span {...props} />;
