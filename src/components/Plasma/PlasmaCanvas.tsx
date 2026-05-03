"use client";

import {
  CSSProperties,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Glyph } from "./types";
import {
  PlasmaCanvasGL,
  PlasmaCanvasGLHandle,
  isWebGL2Supported,
} from "./GL/PlasmaCanvasGL";
import { PlasmaCanvasJS } from "./JS/PlasmaCanvasJS";
import { getAnimationFrame } from "./JS/getAnimationFrame";
import { getLuminanceFrame } from "./JS/getLuminanceFrame";
import { PLASMA_COMPLEXITY, PLASMA_SPEED, PLASMA_ZOOM } from "./constants";

export type PlasmaCanvasHandle = {
  renderPlasma: () => void;
  renderLuminance: (
    luminance: Uint8Array,
    width: number,
    height: number,
  ) => void;
};

export type PlasmaCanvasProps = {
  ramp: Glyph[];
  bgColor?: [number, number, number];
  cellSize: number;
  cellWidth?: number;
  fontPx: number;
  gridWidth: number;
  gridHeight: number;
  className?: string;
  style?: CSSProperties;
  /**
   * Called from the JS fallback path with the freshly-computed glyph grid,
   * before it is drawn. The callback may mutate the frame in place (e.g. to
   * blank cells under DOM label overlays) and/or capture it for later use.
   * Never fires in the WebGL2 path because that path has no glyph grid.
   */
  onTextFrame?: (frame: Glyph[][]) => void;
};

export const PlasmaCanvas = forwardRef<PlasmaCanvasHandle, PlasmaCanvasProps>(
  function PlasmaCanvas(props, ref) {
    const {
      ramp,
      bgColor,
      cellSize,
      cellWidth,
      fontPx,
      gridWidth,
      gridHeight,
      className,
      style,
      onTextFrame,
    } = props;
    const resolvedCellWidth = cellWidth ?? cellSize;
    const cellAspect = resolvedCellWidth / cellSize;

    const [supportsGL, setSupportsGL] = useState<boolean | null>(null);
    const glRef = useRef<PlasmaCanvasGLHandle | null>(null);
    const [frame, setFrame] = useState<Glyph[][] | null>(null);

    useEffect(() => {
      setSupportsGL(isWebGL2Supported());
    }, []);

    const onTextFrameRef = useRef(onTextFrame);
    onTextFrameRef.current = onTextFrame;

    const renderPlasmaJS = useCallback(() => {
      const next = getAnimationFrame({
        width: gridWidth,
        height: gridHeight,
        complexity: PLASMA_COMPLEXITY,
        zoomFactor: 1 / PLASMA_ZOOM,
        speedFactor: PLASMA_SPEED,
        characters: ramp,
        cellAspect,
      });
      onTextFrameRef.current?.(next);
      setFrame(next);
    }, [gridWidth, gridHeight, ramp, cellAspect]);

    const renderLuminanceJS = useCallback(
      (luminance: Uint8Array, width: number, height: number) => {
        const next = getLuminanceFrame({ luminance, ramp, width, height });
        onTextFrameRef.current?.(next);
        setFrame(next);
      },
      [ramp],
    );

    useImperativeHandle(
      ref,
      () => ({
        renderPlasma: () => {
          if (supportsGL) {
            glRef.current?.renderPlasma();
            return;
          }
          if (supportsGL === false) {
            renderPlasmaJS();
          }
        },
        renderLuminance: (luminance, width, height) => {
          if (supportsGL) {
            glRef.current?.renderLuminance(luminance, width, height);
            return;
          }
          if (supportsGL === false) {
            renderLuminanceJS(luminance, width, height);
          }
        },
      }),
      [supportsGL, renderPlasmaJS, renderLuminanceJS],
    );

    if (supportsGL === null) {
      return null;
    }

    if (supportsGL) {
      return (
        <PlasmaCanvasGL
          ref={glRef}
          ramp={ramp}
          bgColor={bgColor}
          cellSize={cellSize}
          cellWidth={resolvedCellWidth}
          fontPx={fontPx}
          gridWidth={gridWidth}
          gridHeight={gridHeight}
          className={className}
          style={style}
        />
      );
    }

    return (
      <PlasmaCanvasJS
        frame={frame}
        cellSize={cellSize}
        cellWidth={resolvedCellWidth}
        fontPx={fontPx}
        className={className}
        style={style}
      />
    );
  },
);
