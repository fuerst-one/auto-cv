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
  PLASMA_BLUR_INNER_FRAC,
  PLASMA_BLUR_MAX_PX,
  PLASMA_BLUR_OUTER_FRAC,
  PLASMA_GLITCH_BANDS,
  PLASMA_GLITCH_TEAR_PX,
  PLASMA_GLITCH_DURATION,
  PLASMA_GLITCH_INTERVAL,
  CENTER_YS,
  PLASMA_COMPLEXITY,
  PLASMA_LENS_BASE_RADIUS_FRAC,
  PLASMA_LENS_BASE_STRENGTH,
  PLASMA_LENS_RADIUS_FRAC_MAX,
  PLASMA_LENS_SCALE_DEFAULT,
  PLASMA_LENS_SCALE_MAX,
  PLASMA_LENS_SCALE_MIN,
  PLASMA_RIPPLE_LIFETIME,
  PLASMA_RIPPLE_MAX,
  PLASMA_RIPPLE_RADIUS_FRAC,
  PLASMA_RIPPLE_STRENGTH,
  PLASMA_SPEED,
  PLASMA_ZOOM,
  RADII,
  SINE_TABLE,
} from "../constants";
import { buildGlyphAtlas, GlyphAtlas, SDF_PARAMS } from "./buildGlyphAtlas";
import { buildRampTable, packRampToRGBA } from "./buildRampTable";
import {
  FRAGMENT_SHADER,
  POST_FRAGMENT_SHADER,
  POST_VERTEX_SHADER,
  VERTEX_SHADER,
} from "./shaders";

export type PlasmaCanvasGLHandle = {
  renderPlasma: () => void;
  renderLuminance: (
    luminance: Uint8Array,
    width: number,
    height: number,
  ) => void;
  setCursor: (cellX: number, cellY: number) => void;
  clearCursor: () => void;
  emitRipple: (cellX: number, cellY: number) => void;
  setLensScale: (value: number) => number;
  getLensScale: () => number;
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
   * Runs the edge-blur + glitch post-process pass. Off by default, so the
   * plain glyph field renders straight to the canvas. Only the landing
   * hero opts in — the site background and playground stay unprocessed.
   */
  postProcess?: boolean;
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

const createProgram = (
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string,
): WebGLProgram => {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
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

type RippleSlot = { cellX: number; cellY: number; t0: number };

type GLState = {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  vao: WebGLVertexArrayObject;
  glyphTex: WebGLTexture;
  rampTex: WebGLTexture;
  luminanceTex: WebGLTexture;
  atlas: GlyphAtlas;
  uniforms: Record<string, WebGLUniformLocation | null>;
  postProgram: WebGLProgram;
  postVao: WebGLVertexArrayObject;
  postUniforms: Record<string, WebGLUniformLocation | null>;
  sceneTex: WebGLTexture;
  sceneFbo: WebGLFramebuffer;
  sceneSize: { width: number; height: number };
  timeOrigin: number;
  reducedMotion: MediaQueryList | null;
  rampLength: number;
  lastRampSignature: string;
  lastLuminanceSize: { width: number; height: number };
  angles: [number, number, number, number];
  hueShift: number;
  cursor: { x: number; y: number } | null;
  ripples: RippleSlot[];
  nextRippleSlot: number;
  rippleUniformBuffer: Float32Array;
  lensScale: number;
};

const setupGL = (canvas: HTMLCanvasElement): GLState | null => {
  const gl = canvas.getContext("webgl2", {
    antialias: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: true,
  });
  if (!gl) return null;

  const program = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
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

  const postProgram = createProgram(
    gl,
    POST_VERTEX_SHADER,
    POST_FRAGMENT_SHADER,
  );
  const postVao = gl.createVertexArray()!;
  gl.bindVertexArray(postVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  const postPositionLoc = gl.getAttribLocation(postProgram, "a_position");
  gl.enableVertexAttribArray(postPositionLoc);
  gl.vertexAttribPointer(postPositionLoc, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(vao);

  const sceneTex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, sceneTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const sceneFbo = gl.createFramebuffer()!;

  const postUniforms = {
    u_scene: gl.getUniformLocation(postProgram, "u_scene"),
    u_resolution: gl.getUniformLocation(postProgram, "u_resolution"),
    u_time: gl.getUniformLocation(postProgram, "u_time"),
    u_blurMaxPx: gl.getUniformLocation(postProgram, "u_blurMaxPx"),
    u_blurInner: gl.getUniformLocation(postProgram, "u_blurInner"),
    u_blurOuter: gl.getUniformLocation(postProgram, "u_blurOuter"),
    u_glitchInterval: gl.getUniformLocation(postProgram, "u_glitchInterval"),
    u_glitchDuration: gl.getUniformLocation(postProgram, "u_glitchDuration"),
    u_glitchBands: gl.getUniformLocation(postProgram, "u_glitchBands"),
    u_glitchTearPx: gl.getUniformLocation(postProgram, "u_glitchTearPx"),
    u_glitchEnabled: gl.getUniformLocation(postProgram, "u_glitchEnabled"),
  };
  gl.useProgram(postProgram);
  gl.uniform1i(postUniforms.u_scene, 3);
  gl.uniform1f(postUniforms.u_blurInner, PLASMA_BLUR_INNER_FRAC);
  gl.uniform1f(postUniforms.u_blurOuter, PLASMA_BLUR_OUTER_FRAC);
  gl.uniform1f(postUniforms.u_glitchInterval, PLASMA_GLITCH_INTERVAL);
  gl.uniform1f(postUniforms.u_glitchDuration, PLASMA_GLITCH_DURATION);
  gl.uniform1f(postUniforms.u_glitchBands, PLASMA_GLITCH_BANDS);
  gl.useProgram(program);

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
    u_cursor: gl.getUniformLocation(program, "u_cursor"),
    u_cursorActive: gl.getUniformLocation(program, "u_cursorActive"),
    u_lensRadius: gl.getUniformLocation(program, "u_lensRadius"),
    u_lensStrength: gl.getUniformLocation(program, "u_lensStrength"),
    u_ripples: gl.getUniformLocation(program, "u_ripples"),
    u_rippleRadius: gl.getUniformLocation(program, "u_rippleRadius"),
    u_rippleStrength: gl.getUniformLocation(program, "u_rippleStrength"),
    u_rippleLifetime: gl.getUniformLocation(program, "u_rippleLifetime"),
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
  gl.uniform1f(uniforms.u_rippleStrength, PLASMA_RIPPLE_STRENGTH);
  gl.uniform1f(uniforms.u_rippleLifetime, PLASMA_RIPPLE_LIFETIME);
  gl.uniform2f(uniforms.u_cursor, 0, 0);
  gl.uniform1f(uniforms.u_cursorActive, 0);

  const ripples: RippleSlot[] = Array.from(
    { length: PLASMA_RIPPLE_MAX },
    () => ({ cellX: 0, cellY: 0, t0: -Infinity }),
  );
  const rippleUniformBuffer = new Float32Array(PLASMA_RIPPLE_MAX * 3);
  gl.uniform3fv(uniforms.u_ripples, rippleUniformBuffer);

  return {
    gl,
    program,
    vao,
    glyphTex,
    rampTex,
    luminanceTex,
    atlas,
    uniforms,
    postProgram,
    postVao,
    postUniforms,
    sceneTex,
    sceneFbo,
    sceneSize: { width: 0, height: 0 },
    timeOrigin: performance.now(),
    reducedMotion:
      typeof window === "undefined"
        ? null
        : window.matchMedia("(prefers-reduced-motion: reduce)"),
    rampLength: 0,
    lastRampSignature: "",
    lastLuminanceSize: { width: 0, height: 0 },
    angles: [0, 0, 0, 0],
    hueShift: 0,
    cursor: null,
    ripples,
    nextRippleSlot: 0,
    rippleUniformBuffer,
    lensScale: PLASMA_LENS_SCALE_DEFAULT,
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

const ensureSceneTarget = (state: GLState, width: number, height: number) => {
  const { gl } = state;
  if (state.sceneSize.width === width && state.sceneSize.height === height) {
    return;
  }
  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, state.sceneTex);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA8,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null,
  );
  gl.bindFramebuffer(gl.FRAMEBUFFER, state.sceneFbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    state.sceneTex,
    0,
  );
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  state.sceneSize = { width, height };
};

const bindAndDraw = (
  state: GLState,
  gridWidth: number,
  gridHeight: number,
  cellWidth: number,
  cellHeight: number,
  atlasScale: number,
  bgColor: [number, number, number],
  postProcess: boolean,
) => {
  const { gl, uniforms, postUniforms } = state;
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

  const targetW = gl.drawingBufferWidth;
  const targetH = gl.drawingBufferHeight;

  // No post-process: draw the glyph field straight to the canvas.
  if (!postProcess) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, targetW, targetH);
    gl.bindVertexArray(state.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    return;
  }

  // Pass 1: glyph field into the offscreen scene texture.
  ensureSceneTarget(state, targetW, targetH);
  gl.bindFramebuffer(gl.FRAMEBUFFER, state.sceneFbo);
  gl.viewport(0, 0, targetW, targetH);
  gl.bindVertexArray(state.vao);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  // Pass 2: edge blur + occasional glitch onto the canvas.
  const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
  gl.useProgram(state.postProgram);
  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, state.sceneTex);
  gl.uniform2f(postUniforms.u_resolution, targetW, targetH);
  gl.uniform1f(
    postUniforms.u_time,
    (performance.now() - state.timeOrigin) / 1000,
  );
  gl.uniform1f(postUniforms.u_blurMaxPx, PLASMA_BLUR_MAX_PX * dpr);
  gl.uniform1f(postUniforms.u_glitchTearPx, PLASMA_GLITCH_TEAR_PX * dpr);
  gl.uniform1f(
    postUniforms.u_glitchEnabled,
    state.reducedMotion?.matches ? 0 : 1,
  );
  gl.viewport(0, 0, targetW, targetH);
  gl.bindVertexArray(state.postVao);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.useProgram(state.program);
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
    postProcess = false,
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
      gl.deleteTexture(s.sceneTex);
      gl.deleteFramebuffer(s.sceneFbo);
      gl.deleteVertexArray(s.vao);
      gl.deleteVertexArray(s.postVao);
      gl.deleteProgram(s.program);
      gl.deleteProgram(s.postProgram);
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

        const cellAspect = cellWidth / cellSize;
        const gridMin = Math.min(gridHeight, gridWidth * cellAspect);
        const radiusFrac = Math.min(
          PLASMA_LENS_RADIUS_FRAC_MAX,
          PLASMA_LENS_BASE_RADIUS_FRAC * state.lensScale,
        );
        gl.uniform1f(uniforms.u_lensRadius, gridMin * radiusFrac);
        gl.uniform1f(
          uniforms.u_lensStrength,
          PLASMA_LENS_BASE_STRENGTH * state.lensScale,
        );
        gl.uniform1f(
          uniforms.u_rippleRadius,
          gridMin * PLASMA_RIPPLE_RADIUS_FRAC,
        );

        if (state.cursor) {
          gl.uniform2f(uniforms.u_cursor, state.cursor.x, state.cursor.y);
          gl.uniform1f(uniforms.u_cursorActive, 1);
        } else {
          gl.uniform1f(uniforms.u_cursorActive, 0);
        }

        const nowMs = performance.now();
        const buf = state.rippleUniformBuffer;
        for (let i = 0; i < state.ripples.length; i++) {
          const r = state.ripples[i];
          const age = (nowMs - r.t0) / 1000;
          const alive =
            Number.isFinite(age) && age >= 0 && age < PLASMA_RIPPLE_LIFETIME;
          buf[i * 3] = r.cellX;
          buf[i * 3 + 1] = r.cellY;
          buf[i * 3 + 2] = alive ? age : -1;
        }
        gl.uniform3fv(uniforms.u_ripples, buf);

        bindAndDraw(
          state,
          gridWidth,
          gridHeight,
          cellWidth,
          cellSize,
          atlasScale,
          bgColor,
          postProcess,
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
          postProcess,
        );
      },
      setCursor: (cellX, cellY) => {
        const state = stateRef.current;
        if (!state) return;
        state.cursor = { x: cellX, y: cellY };
      },
      clearCursor: () => {
        const state = stateRef.current;
        if (!state) return;
        state.cursor = null;
      },
      emitRipple: (cellX, cellY) => {
        const state = stateRef.current;
        if (!state) return;
        const slot = state.ripples[state.nextRippleSlot];
        slot.cellX = cellX;
        slot.cellY = cellY;
        slot.t0 = performance.now();
        state.nextRippleSlot =
          (state.nextRippleSlot + 1) % state.ripples.length;
      },
      setLensScale: (value) => {
        const state = stateRef.current;
        if (!state) return PLASMA_LENS_SCALE_DEFAULT;
        const clamped = Math.max(
          PLASMA_LENS_SCALE_MIN,
          Math.min(PLASMA_LENS_SCALE_MAX, value),
        );
        state.lensScale = clamped;
        return clamped;
      },
      getLensScale: () => {
        const state = stateRef.current;
        if (!state) return PLASMA_LENS_SCALE_DEFAULT;
        return state.lensScale;
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
      postProcess,
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
