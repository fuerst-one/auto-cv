"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
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
  geometries: THREE.BufferGeometry[];
  poolIndex: number;
  rotation: number;
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
    const material = new THREE.MeshNormalMaterial();
    const mesh = new THREE.Mesh(geometries[0], material);
    scene.add(mesh);

    frameCameraToGeometry(camera, geometries[0]);

    const startedAt = performance.now();
    const refs: SceneRefs = {
      renderer,
      scene,
      camera,
      mesh,
      geometries,
      poolIndex: 0,
      rotation: 0,
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
      (refs.mesh.material as THREE.Material).dispose();
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
        args,
        lutCache,
      );
    },
    [ready, lutCache],
  );

  return { sample, ready };
};
