"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  ANGLE_INCREMENTS,
  CENTER_XS,
  CENTER_YS,
  PLASMA_COMPLEXITY,
  PLASMA_SPEED,
  PLASMA_ZOOM,
  RADII,
  SINE_TABLE,
} from "../Plasma/constants";
import { CONTRAST_LUT_GAINS } from "./constants";
import {
  buildContrastLutCache,
  createSamplerContext,
  LuminanceSample,
  SamplerArgs,
  sampleDrawableToLuminance,
} from "./sampleDrawableToLuminance";

type UseShapesLuminanceResult = {
  sample: (args: SamplerArgs) => LuminanceSample | null;
  ready: boolean;
};

const RENDER_WIDTH = 768;
const RENDER_HEIGHT = 432;
const SHAPE_CYCLE_MS = 10000;
const ROTATION_AXIS = new THREE.Vector3(0.4, 1, 0.2).normalize();
const ROTATION_RATE = 0.45;
const CAMERA_FRAME_FACTOR = 3.6;
const PLASMA_PIXELS_PER_CELL = 8.0;
const PLASMA_RAMP_LENGTH = 64.0;
const PLASMA_DEPTH_SHIFT = 0.18;

const PLASMA_VERTEX_SHADER = /* glsl */ `
  varying vec3 vViewNormal;
  void main() {
    vViewNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const PLASMA_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;
  precision highp int;

  uniform vec4 u_angles;
  uniform vec4 u_radii;
  uniform vec4 u_centerXs;
  uniform vec4 u_centerYs;
  uniform float u_sineTable[256];
  uniform float u_hueShift;
  uniform float u_zoomFactor;
  uniform int u_complexity;
  uniform float u_pixelsPerCell;
  uniform float u_rampLength;
  uniform float u_depthShift;

  varying vec3 vViewNormal;

  float computePlasmaValue(vec2 cellCoord) {
    float fx = floor(cellCoord.x);
    float fy = floor(cellCoord.y);
    float value = u_hueShift;
    for (int i = 0; i < 4; i++) {
      if (i >= u_complexity) break;
      float ai = u_angles[i];
      float ri = u_radii[i];
      float cxi = u_centerXs[i];
      float cyi = u_centerYs[i];
      float xi = cos(ai) * ri + cxi - fx;
      float yi = sin(ai) * ri + cyi - fy;
      float fIdx = (xi * xi + yi * yi) * u_zoomFactor;
      int rounded = int(floor(fIdx + 0.5));
      int shifted = rounded / 32;
      int masked = shifted - (shifted / 256) * 256;
      if (masked < 0) masked += 256;
      value += u_sineTable[masked];
    }
    return value;
  }

  void main() {
    vec2 cellCoord = gl_FragCoord.xy / u_pixelsPerCell;
    float plasmaValue = computePlasmaValue(cellCoord);
    float rampIdx = mod(floor(plasmaValue), u_rampLength);
    if (rampIdx < 0.0) rampIdx += u_rampLength;

    float v = ((u_rampLength - 1.0) - rampIdx + 0.5) / u_rampLength;

    vec3 n = normalize(vViewNormal);
    float depth = (1.0 - clamp(n.z, 0.0, 1.0)) * u_depthShift;
    v -= depth;
    v = clamp(v, 0.0, 1.0);

    gl_FragColor = vec4(vec3(v), 1.0);
  }
`;

type PlasmaUniforms = {
  u_angles: { value: THREE.Vector4 };
  u_radii: { value: THREE.Vector4 };
  u_centerXs: { value: THREE.Vector4 };
  u_centerYs: { value: THREE.Vector4 };
  u_sineTable: { value: Float32Array };
  u_hueShift: { value: number };
  u_zoomFactor: { value: number };
  u_complexity: { value: number };
  u_pixelsPerCell: { value: number };
  u_rampLength: { value: number };
  u_depthShift: { value: number };
};

const createPlasmaMaterial = (): {
  material: THREE.ShaderMaterial;
  uniforms: PlasmaUniforms;
} => {
  const uniforms: PlasmaUniforms = {
    u_angles: { value: new THREE.Vector4(0, 0, 0, 0) },
    u_radii: {
      value: new THREE.Vector4(RADII[0], RADII[1], RADII[2], RADII[3]),
    },
    u_centerXs: {
      value: new THREE.Vector4(
        CENTER_XS[0],
        CENTER_XS[1],
        CENTER_XS[2],
        CENTER_XS[3],
      ),
    },
    u_centerYs: {
      value: new THREE.Vector4(
        CENTER_YS[0],
        CENTER_YS[1],
        CENTER_YS[2],
        CENTER_YS[3],
      ),
    },
    u_sineTable: { value: new Float32Array(SINE_TABLE) },
    u_hueShift: { value: 0 },
    u_zoomFactor: { value: 1 / PLASMA_ZOOM },
    u_complexity: { value: PLASMA_COMPLEXITY },
    u_pixelsPerCell: { value: PLASMA_PIXELS_PER_CELL },
    u_rampLength: { value: PLASMA_RAMP_LENGTH },
    u_depthShift: { value: PLASMA_DEPTH_SHIFT },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: PLASMA_VERTEX_SHADER,
    fragmentShader: PLASMA_FRAGMENT_SHADER,
    uniforms: uniforms as unknown as Record<string, THREE.IUniform>,
  });
  return { material, uniforms };
};

const buildTwistedBox = (): THREE.BufferGeometry => {
  const geometry = new THREE.BoxGeometry(1.4, 1.4, 1.4, 12, 12, 12);
  const positions = geometry.attributes.position;
  const v = new THREE.Vector3();
  const twist = 1.6;
  for (let i = 0; i < positions.count; i++) {
    v.fromBufferAttribute(positions, i);
    const angle = v.y * twist;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const x = v.x * c - v.z * s;
    const z = v.x * s + v.z * c;
    positions.setXYZ(i, x, v.y, z);
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
};

const buildGeometryPool = (): THREE.BufferGeometry[] => {
  const torusKnot = new THREE.TorusKnotGeometry(0.8, 0.28, 160, 24);
  torusKnot.computeBoundingSphere();
  const icosahedron = new THREE.IcosahedronGeometry(1.0, 0);
  icosahedron.computeBoundingSphere();
  const dodecahedron = new THREE.DodecahedronGeometry(1.0, 0);
  dodecahedron.computeBoundingSphere();
  const twistedBox = buildTwistedBox();
  return [torusKnot, icosahedron, dodecahedron, twistedBox];
};

const frameCameraToGeometry = (
  camera: THREE.PerspectiveCamera,
  geometry: THREE.BufferGeometry,
) => {
  const radius = geometry.boundingSphere?.radius ?? 1;
  camera.position.set(0, 0, radius * CAMERA_FRAME_FACTOR);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
};

type SceneRefs = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  uniforms: PlasmaUniforms;
  geometries: THREE.BufferGeometry[];
  poolIndex: number;
  rotation: number;
  plasmaAngles: [number, number, number, number];
  hueShift: number;
  nextSwapAt: number;
  lastTickAt: number;
  rafId: number | null;
};

export const useShapesLuminance = (
  active: boolean,
): UseShapesLuminanceResult => {
  const samplerCtxRef = useRef(createSamplerContext());
  const sceneRef = useRef<SceneRefs | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  const lutCache = useMemo(() => buildContrastLutCache(CONTRAST_LUT_GAINS), []);

  useEffect(() => {
    if (!active) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = RENDER_WIDTH;
    canvas.height = RENDER_HEIGHT;
    canvasRef.current = canvas;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    renderer.setPixelRatio(1);
    renderer.setSize(RENDER_WIDTH, RENDER_HEIGHT, false);
    renderer.setClearColor(0x000000, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      RENDER_WIDTH / RENDER_HEIGHT,
      0.1,
      100,
    );

    const geometries = buildGeometryPool();
    const { material, uniforms } = createPlasmaMaterial();
    const mesh = new THREE.Mesh(geometries[0], material);
    scene.add(mesh);

    frameCameraToGeometry(camera, geometries[0]);

    const startedAt = performance.now();
    const refs: SceneRefs = {
      renderer,
      scene,
      camera,
      mesh,
      material,
      uniforms,
      geometries,
      poolIndex: 0,
      rotation: 0,
      plasmaAngles: [0, 0, 0, 0],
      hueShift: 0,
      nextSwapAt: startedAt + SHAPE_CYCLE_MS,
      lastTickAt: startedAt,
      rafId: null,
    };
    sceneRef.current = refs;

    let firstFrameRendered = false;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - refs.lastTickAt) / 1000);
      refs.lastTickAt = now;
      refs.rotation += ROTATION_RATE * dt;
      refs.mesh.setRotationFromAxisAngle(ROTATION_AXIS, refs.rotation);

      const randomFactor = 0.5 + Math.random();
      for (let i = 0; i < 4; i++) {
        refs.plasmaAngles[i] +=
          ANGLE_INCREMENTS[i] * PLASMA_SPEED * randomFactor;
      }
      refs.hueShift += PLASMA_SPEED * randomFactor;
      refs.uniforms.u_angles.value.set(
        refs.plasmaAngles[0],
        refs.plasmaAngles[1],
        refs.plasmaAngles[2],
        refs.plasmaAngles[3],
      );
      refs.uniforms.u_hueShift.value = refs.hueShift;

      if (now >= refs.nextSwapAt) {
        refs.poolIndex = (refs.poolIndex + 1) % refs.geometries.length;
        refs.mesh.geometry = refs.geometries[refs.poolIndex];
        frameCameraToGeometry(refs.camera, refs.mesh.geometry);
        refs.nextSwapAt = now + SHAPE_CYCLE_MS;
      }

      refs.renderer.render(refs.scene, refs.camera);
      if (!firstFrameRendered) {
        firstFrameRendered = true;
        setReady(true);
      }
      refs.rafId = requestAnimationFrame(tick);
    };

    refs.rafId = requestAnimationFrame(tick);

    return () => {
      if (refs.rafId !== null) {
        cancelAnimationFrame(refs.rafId);
      }
      for (const geom of refs.geometries) {
        geom.dispose();
      }
      refs.material.dispose();
      refs.renderer.dispose();
      sceneRef.current = null;
      canvasRef.current = null;
      setReady(false);
    };
  }, [active]);

  const sample = useCallback(
    (args: SamplerArgs): LuminanceSample | null => {
      const canvas = canvasRef.current;
      if (!canvas || !ready) {
        return null;
      }
      return sampleDrawableToLuminance(
        samplerCtxRef.current,
        canvas,
        { width: canvas.width, height: canvas.height },
        { ...args, imageSmoothing: false },
        lutCache,
      );
    },
    [ready, lutCache],
  );

  return { sample, ready };
};
