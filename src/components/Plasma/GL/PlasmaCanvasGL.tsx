"use client";

import {
  CSSProperties,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { Glyph } from "../types";
import {
  ANGLE_INCREMENTS,
  BASE_CHARACTERS,
  CENTER_XS,
  CENTER_YS,
  PLASMA_COMPLEXITY,
  PLASMA_SPEED,
  PLASMA_ZOOM,
  RADII,
  SINE_TABLE,
} from "../constants";
import { buildGlyphAtlas, GlyphAtlas, SDF_PARAMS } from "./buildGlyphAtlas";
import { buildRampTable, packRampToRGBA } from "./buildRampTable";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders";

export type PlasmaCanvasGLHandle = {
  renderPlasma: () => void;
  renderLuminance: (
    luminance: Uint8Array,
    width: number,
    height: number,
  ) => void;
};

export type PlasmaCanvasGLProps = {
  ramp: Glyph[];
  bgColor?: [number, number, number];
  cellSize: number;
  cellWidth: number;
  fontPx: number;
  gridWidth: number;
  gridHeight: number;
  className?: string;
  style?: CSSProperties;
  /**
   * Fires with the underlying <canvas> on mount and `null` on unmount.
   * Lets consumers (e.g. OrbitControls) bind pointer/wheel events to the
   * actual canvas element, so overlay UI siblings keep their own clicks.
   * Pass a referentially stable callback (a useState setter or memoized
   * function) — the effect's cleanup re-fires whenever the prop changes.
   */
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
};

const BG_DEFAULT: [number, number, number] = [0, 0, 0];

const compileShader = (
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader => {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("createShader failed");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile failed: ${log}`);
  }
  return shader;
};

const createProgram = (gl: WebGL2RenderingContext): WebGLProgram => {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!program) throw new Error("createProgram failed");
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link failed: ${log}`);
  }
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return program;
};

const createGlyphTexture = (
  gl: WebGL2RenderingContext,
  atlas: GlyphAtlas,
): WebGLTexture => {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.R8,
    atlas.width,
    atlas.height,
    0,
    gl.RED,
    gl.UNSIGNED_BYTE,
    atlas.data,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return tex;
};

const createDataTexture = (gl: WebGL2RenderingContext): WebGLTexture => {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return tex;
};

type GLState = {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  vao: WebGLVertexArrayObject;
  glyphTex: WebGLTexture;
  rampTex: WebGLTexture;
  luminanceTex: WebGLTexture;
  atlas: GlyphAtlas;
  uniforms: Record<string, WebGLUniformLocation | null>;
  rampLength: number;
  lastRampSignature: string;
  lastLuminanceSize: { width: number; height: number };
  angles: [number, number, number, number];
  hueShift: number;
};

const setupGL = (canvas: HTMLCanvasElement): GLState | null => {
  const gl = canvas.getContext("webgl2", {
    antialias: false,
    premultipliedAlpha: true,
  });
  if (!gl) return null;

  const program = createProgram(gl);
  gl.useProgram(program);

  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);
  const vbo = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const positionLoc = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLoc);
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

  const atlas = buildGlyphAtlas(BASE_CHARACTERS);
  const glyphTex = createGlyphTexture(gl, atlas);
  const rampTex = createDataTexture(gl);
  const luminanceTex = createDataTexture(gl);

  const uniforms = {
    u_gridSize: gl.getUniformLocation(program, "u_gridSize"),
    u_atlasGridSize: gl.getUniformLocation(program, "u_atlasGridSize"),
    u_atlasSize: gl.getUniformLocation(program, "u_atlasSize"),
    u_cellPx: gl.getUniformLocation(program, "u_cellPx"),
    u_tileSize: gl.getUniformLocation(program, "u_tileSize"),
    u_atlasScale: gl.getUniformLocation(program, "u_atlasScale"),
    u_rampLength: gl.getUniformLocation(program, "u_rampLength"),
    u_sourceMode: gl.getUniformLocation(program, "u_sourceMode"),
    u_bgColor: gl.getUniformLocation(program, "u_bgColor"),
    u_glyphAtlas: gl.getUniformLocation(program, "u_glyphAtlas"),
    u_rampTex: gl.getUniformLocation(program, "u_rampTex"),
    u_luminanceTex: gl.getUniformLocation(program, "u_luminanceTex"),
    u_angles: gl.getUniformLocation(program, "u_angles"),
    u_radii: gl.getUniformLocation(program, "u_radii"),
    u_centerXs: gl.getUniformLocation(program, "u_centerXs"),
    u_centerYs: gl.getUniformLocation(program, "u_centerYs"),
    u_sineTable: gl.getUniformLocation(program, "u_sineTable"),
    u_hueShift: gl.getUniformLocation(program, "u_hueShift"),
    u_zoomFactor: gl.getUniformLocation(program, "u_zoomFactor"),
    u_xAspectSq: gl.getUniformLocation(program, "u_xAspectSq"),
    u_complexity: gl.getUniformLocation(program, "u_complexity"),
  };

  gl.uniform1i(uniforms.u_glyphAtlas, 0);
  gl.uniform1i(uniforms.u_rampTex, 1);
  gl.uniform1i(uniforms.u_luminanceTex, 2);
  gl.uniform2f(uniforms.u_atlasGridSize, atlas.cols, atlas.rows);
  gl.uniform2f(uniforms.u_atlasSize, atlas.width, atlas.height);
  gl.uniform1f(uniforms.u_tileSize, atlas.tileSize);
  gl.uniform1fv(uniforms.u_sineTable, new Float32Array(SINE_TABLE));
  gl.uniform4f(uniforms.u_radii, RADII[0], RADII[1], RADII[2], RADII[3]);
  gl.uniform4f(
    uniforms.u_centerXs,
    CENTER_XS[0],
    CENTER_XS[1],
    CENTER_XS[2],
    CENTER_XS[3],
  );
  gl.uniform4f(
    uniforms.u_centerYs,
    CENTER_YS[0],
    CENTER_YS[1],
    CENTER_YS[2],
    CENTER_YS[3],
  );
  gl.uniform1i(uniforms.u_complexity, PLASMA_COMPLEXITY);
  gl.uniform1f(uniforms.u_zoomFactor, 1 / PLASMA_ZOOM);

  return {
    gl,
    program,
    vao,
    glyphTex,
    rampTex,
    luminanceTex,
    atlas,
    uniforms,
    rampLength: 0,
    lastRampSignature: "",
    lastLuminanceSize: { width: 0, height: 0 },
    angles: [0, 0, 0, 0],
    hueShift: 0,
  };
};

const uploadRamp = (state: GLState, ramp: Glyph[]) => {
  const signature = ramp
    .map((g) => `${g.character}:${g.style?.color ?? ""}`)
    .join("|");
  if (signature === state.lastRampSignature) return;
  const entries = buildRampTable(ramp, state.atlas.glyphIndex);
  const packed = packRampToRGBA(entries);
  const { gl } = state;
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, state.rampTex);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA8,
    entries.length,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    packed,
  );
  state.rampLength = entries.length;
  state.lastRampSignature = signature;
};

const uploadLuminance = (
  state: GLState,
  luminance: Uint8Array,
  width: number,
  height: number,
) => {
  const { gl } = state;
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, state.luminanceTex);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  if (
    state.lastLuminanceSize.width !== width ||
    state.lastLuminanceSize.height !== height
  ) {
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.R8,
      width,
      height,
      0,
      gl.RED,
      gl.UNSIGNED_BYTE,
      luminance,
    );
    state.lastLuminanceSize = { width, height };
  } else {
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      width,
      height,
      gl.RED,
      gl.UNSIGNED_BYTE,
      luminance,
    );
  }
};

const bindAndDraw = (
  state: GLState,
  gridWidth: number,
  gridHeight: number,
  cellWidth: number,
  cellHeight: number,
  atlasScale: number,
  bgColor: [number, number, number],
) => {
  const { gl, uniforms } = state;
  gl.uniform2f(uniforms.u_gridSize, gridWidth, gridHeight);
  gl.uniform2f(uniforms.u_cellPx, cellWidth, cellHeight);
  gl.uniform1f(uniforms.u_atlasScale, atlasScale);
  gl.uniform1f(uniforms.u_rampLength, state.rampLength);
  gl.uniform3f(
    uniforms.u_bgColor,
    bgColor[0] / 255,
    bgColor[1] / 255,
    bgColor[2] / 255,
  );

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, state.glyphTex);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, state.rampTex);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, state.luminanceTex);

  gl.bindVertexArray(state.vao);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

export const PlasmaCanvasGL = forwardRef<
  PlasmaCanvasGLHandle,
  PlasmaCanvasGLProps
>(function PlasmaCanvasGL(
  {
    ramp,
    bgColor = BG_DEFAULT,
    cellSize,
    cellWidth,
    fontPx,
    gridWidth,
    gridHeight,
    className,
    style,
    onCanvasReady,
  },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GLState | null>(null);

  const widthPx = gridWidth * cellWidth;
  const heightPx = gridHeight * cellSize;
  const xAspectSq = useMemo(() => {
    const aspect = cellWidth / cellSize;
    return aspect * aspect;
  }, [cellWidth, cellSize]);
  const atlasScale = useMemo(() => SDF_PARAMS.fontSize / fontPx, [fontPx]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const state = setupGL(canvas);
    if (!state) {
      return;
    }
    stateRef.current = state;
    return () => {
      const s = stateRef.current;
      if (!s) return;
      const { gl } = s;
      gl.deleteTexture(s.glyphTex);
      gl.deleteTexture(s.rampTex);
      gl.deleteTexture(s.luminanceTex);
      gl.deleteVertexArray(s.vao);
      gl.deleteProgram(s.program);
      stateRef.current = null;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onCanvasReady) return;
    onCanvasReady(canvas);
    return () => onCanvasReady(null);
  }, [onCanvasReady]);

  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    state.gl.useProgram(state.program);
    uploadRamp(state, ramp);
  }, [ramp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const state = stateRef.current;
    if (!canvas || !state) return;
    const dpr = window.devicePixelRatio || 1;
    const targetW = Math.max(1, Math.floor(widthPx * dpr));
    const targetH = Math.max(1, Math.floor(heightPx * dpr));
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
    state.gl.viewport(0, 0, targetW, targetH);
  }, [widthPx, heightPx]);

  useImperativeHandle(
    ref,
    () => ({
      renderPlasma: () => {
        const state = stateRef.current;
        if (!state) return;
        const { gl, uniforms } = state;
        gl.useProgram(state.program);
        const randomFactor = 0.5 + Math.random();
        for (let i = 0; i < 4; i++) {
          state.angles[i] += ANGLE_INCREMENTS[i] * PLASMA_SPEED * randomFactor;
        }
        state.hueShift += PLASMA_SPEED * randomFactor;
        gl.uniform4f(
          uniforms.u_angles,
          state.angles[0],
          state.angles[1],
          state.angles[2],
          state.angles[3],
        );
        gl.uniform1f(uniforms.u_hueShift, state.hueShift);
        gl.uniform1f(uniforms.u_xAspectSq, xAspectSq);
        gl.uniform1i(uniforms.u_sourceMode, 0);
        bindAndDraw(
          state,
          gridWidth,
          gridHeight,
          cellWidth,
          cellSize,
          atlasScale,
          bgColor,
        );
      },
      renderLuminance: (luminance, width, height) => {
        const state = stateRef.current;
        if (!state) return;
        const { gl, uniforms } = state;
        gl.useProgram(state.program);
        uploadLuminance(state, luminance, width, height);
        gl.uniform1i(uniforms.u_sourceMode, 1);
        bindAndDraw(
          state,
          gridWidth,
          gridHeight,
          cellWidth,
          cellSize,
          atlasScale,
          bgColor,
        );
      },
    }),
    [
      bgColor,
      gridWidth,
      gridHeight,
      xAspectSq,
      cellWidth,
      cellSize,
      atlasScale,
    ],
  );

  return (
    <canvas
      ref={canvasRef}
      style={{ width: widthPx, height: heightPx, ...style }}
      className={className}
    />
  );
});

export const isWebGL2Supported = (): boolean => {
  if (typeof document === "undefined") return false;
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2");
  return !!gl;
};
