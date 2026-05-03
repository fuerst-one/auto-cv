"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import { Glyph } from "./types";

type PlasmaCanvasProps = {
  frame: Glyph[][] | null;
  cellSize: number;
  fontPx: number;
  fontWeight?: number;
  fontFamily?: string;
  className?: string;
  style?: CSSProperties;
};

const DEFAULT_FONT_FAMILY = "Menlo, var(--font-plex), monospace";
const DEFAULT_FONT_WEIGHT = 400;

const isFontsApiReady = () =>
  typeof document !== "undefined" && document.fonts?.status === "loaded";

export const PlasmaCanvas = ({
  frame,
  cellSize,
  fontPx,
  fontWeight = DEFAULT_FONT_WEIGHT,
  fontFamily = DEFAULT_FONT_FAMILY,
  className,
  style,
}: PlasmaCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fontReady, setFontReady] = useState(isFontsApiReady);

  useEffect(() => {
    if (fontReady || typeof document === "undefined" || !document.fonts) {
      return;
    }
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) {
        setFontReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [fontReady]);

  const widthCells = frame?.[0]?.length ?? 0;
  const heightCells = frame?.length ?? 0;
  const widthPx = widthCells * cellSize;
  const heightPx = heightCells * cellSize;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !frame || !fontReady || widthPx === 0 || heightPx === 0) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== widthPx * dpr || canvas.height !== heightPx * dpr) {
      canvas.width = widthPx * dpr;
      canvas.height = heightPx * dpr;
    }

    const computed = window.getComputedStyle(canvas);
    const fallbackColor = computed.color;
    const resolvedFontFamily = computed.fontFamily || fontFamily;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.clearRect(0, 0, widthPx, heightPx);

    const baseFont = `${fontPx}px ${resolvedFontFamily}`;
    ctx.font = `${fontWeight} ${baseFont}`;
    let lastColor = "";
    let lastWeight: string | number = fontWeight;
    for (let y = 0; y < frame.length; y++) {
      const row = frame[y];
      const cy = y * cellSize + cellSize / 2;
      for (let x = 0; x < row.length; x++) {
        const glyph = row[x];
        if (glyph.character === " ") {
          continue;
        }
        const weight = glyph.style?.fontWeight ?? fontWeight;
        if (weight !== lastWeight) {
          ctx.font = `${weight} ${baseFont}`;
          lastWeight = weight;
        }
        const color = glyph.style?.color ?? fallbackColor;
        if (color !== lastColor) {
          ctx.fillStyle = color;
          lastColor = color;
        }
        ctx.fillText(glyph.character, x * cellSize + cellSize / 2, cy);
      }
    }
  }, [
    frame,
    cellSize,
    fontPx,
    fontFamily,
    fontWeight,
    fontReady,
    widthPx,
    heightPx,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: widthPx, height: heightPx, fontFamily, ...style }}
      className={className}
    />
  );
};
