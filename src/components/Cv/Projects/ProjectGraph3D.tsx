"use client";

import { Canvas, ThreeEvent } from "@react-three/fiber";
import { Billboard, Html, OrbitControls } from "@react-three/drei";
import { Suspense, useMemo, useState } from "react";
import * as THREE from "three";
import { CvProject } from "@/server/notion/getCvProjects";
import { colors } from "./colors";
import { useFiltersStore } from "./filtersStore";
import { filterProjects } from "./Filter/utils";
import { useProjectFocusStore } from "./projectFocusStore";

const SCENE_SCALE = 1.5;
const RADIUS_AT_WOW_10 = 0.16;
const RING_INNER_RATIO = 0.85;
const HIT_TARGET_MIN_RADIUS = 0.1;
const FALLBACK_HEX = "#888888";
const AXIS_EXTENT = SCENE_SCALE * 1.1;
const RECENCY_FILL_MAX = 0.7;
const RECENCY_RAMP_DAYS = 365 * 3;
const DAY_MS = 24 * 60 * 60 * 1000;

const getProjectColor = (projectType: string) =>
  colors.projectType?.[projectType]?.hex ?? FALLBACK_HEX;

const getProjectRadius = (wowFactor: number) => {
  const clamped = Math.max(0, Math.min(10, wowFactor));
  return (clamped / 10) * RADIUS_AT_WOW_10;
};

export const ProjectGraph3D = ({ projects }: { projects: CvProject[] }) => {
  const filterParams = useFiltersStore((s) => s.filters);
  const highlightedIds = useMemo(() => {
    return new Set(filterProjects(projects, filterParams).map((p) => p.id));
  }, [projects, filterParams]);

  const focusedId = useProjectFocusStore((s) => s.focusedProjectId);
  const hoveredId = useProjectFocusStore((s) => s.hoveredProjectId);
  const setHovered = useProjectFocusStore((s) => s.setHoveredProjectId);
  const setFocused = useProjectFocusStore((s) => s.setFocusedProjectId);

  const [showLabels, setShowLabels] = useState(false);

  const recencyById = useMemo(() => {
    const now = Date.now();
    return new Map(
      projects.map((p) => {
        const ended = new Date(p.endDate ?? p.startDate).getTime();
        const days = Math.max(0, (now - ended) / DAY_MS);
        const linear = Math.max(0, 1 - days / RECENCY_RAMP_DAYS);
        return [p.id, linear * linear];
      }),
    );
  }, [projects]);

  if (projects.length === 0) return null;

  return (
    <div className="relative h-[30vh] w-full overflow-hidden border border-white/30 bg-black/50">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.65} />
          <directionalLight position={[4, 5, 4]} intensity={0.4} />
          <SceneAxes extent={AXIS_EXTENT} />
          <OrbitControls
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            minDistance={2.5}
            maxDistance={12}
            zoomSpeed={0.6}
          />
          {projects.map((project) => (
            <ProjectSphere
              key={project.id}
              project={project}
              isHighlighted={highlightedIds.has(project.id)}
              isHovered={hoveredId === project.id}
              isFocused={focusedId === project.id}
              isAnyFocused={focusedId !== null}
              labelsEnabled={showLabels}
              recency={recencyById.get(project.id) ?? 0}
              onHoverChange={(hovered) =>
                setHovered(hovered ? project.id : null)
              }
              onClick={() => setFocused(project.id)}
            />
          ))}
        </Suspense>
      </Canvas>
      <ProjectTypeLegend />
      <button
        type="button"
        onClick={() => setShowLabels((v) => !v)}
        className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 border border-white/30 bg-black/70 px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-neutral-300 transition hover:border-white hover:text-white"
      >
        {showLabels ? "Hide labels" : "Show labels"}
      </button>
    </div>
  );
};

const ProjectTypeLegend = () => {
  const entries = Object.entries(colors.projectType ?? {});
  if (entries.length === 0) return null;
  return (
    <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-1 border border-white/30 bg-black/70 px-2 py-1.5 text-[0.55rem] uppercase tracking-[0.15em] text-neutral-300">
      {entries.map(([name, config]) => (
        <div key={name} className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: config.hex }}
          />
          <span>{name}</span>
        </div>
      ))}
    </div>
  );
};

const SceneAxes = ({ extent }: { extent: number }) => {
  const axes = useMemo<[[number, number, number], [number, number, number]][]>(
    () => [
      [
        [-extent, 0, 0],
        [extent, 0, 0],
      ],
      [
        [0, -extent, 0],
        [0, extent, 0],
      ],
      [
        [0, 0, -extent],
        [0, 0, extent],
      ],
    ],
    [extent],
  );
  return (
    <group>
      {axes.map(([a, b], i) => (
        <AxisLine key={i} from={a} to={b} />
      ))}
    </group>
  );
};

const AxisLine = ({
  from,
  to,
}: {
  from: [number, number, number];
  to: [number, number, number];
}) => {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([...from, ...to], 3),
    );
    return g;
  }, [from, to]);
  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
      }),
    [],
  );
  return <primitive object={new THREE.Line(geometry, material)} />;
};

type ProjectSphereProps = {
  project: CvProject;
  isHighlighted: boolean;
  isHovered: boolean;
  isFocused: boolean;
  isAnyFocused: boolean;
  labelsEnabled: boolean;
  recency: number;
  onHoverChange: (hovered: boolean) => void;
  onClick: () => void;
};

const ProjectSphere = ({
  project,
  isHighlighted,
  isHovered,
  isFocused,
  isAnyFocused,
  labelsEnabled,
  recency,
  onHoverChange,
  onClick,
}: ProjectSphereProps) => {
  const position = useMemo<[number, number, number]>(
    () => [
      project.position3d[0] * SCENE_SCALE,
      project.position3d[1] * SCENE_SCALE,
      project.position3d[2] * SCENE_SCALE,
    ],
    [project.position3d],
  );

  const radius = getProjectRadius(project.wowFactor);
  const color = getProjectColor(project.projectType);

  const isDimmed = isAnyFocused ? !isFocused : !isHighlighted && !isHovered;
  const ringOpacity = isDimmed
    ? 0.2
    : isFocused || isHovered
      ? 1.0
      : isHighlighted
        ? 0.9
        : 0.55;
  const baseFillOpacity = recency * RECENCY_FILL_MAX;
  const fillOpacity = isDimmed
    ? baseFillOpacity * 0.3
    : isFocused
      ? Math.max(baseFillOpacity, 0.7)
      : isHovered
        ? Math.max(baseFillOpacity, 0.5)
        : baseFillOpacity;
  const showLabel =
    isHovered ||
    (labelsEnabled && (isFocused || (isHighlighted && !isAnyFocused)));
  const truncatedName =
    project.name.length > 12 ? `${project.name.slice(0, 12)}…` : project.name;

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHoverChange(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    onHoverChange(false);
    document.body.style.cursor = "default";
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <group position={position}>
      <mesh
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry
          args={[Math.max(radius * 1.3, HIT_TARGET_MIN_RADIUS), 8, 8]}
        />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Billboard>
        {fillOpacity > 0 && (
          <mesh>
            <circleGeometry args={[radius * RING_INNER_RATIO, 32]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={fillOpacity}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
        <mesh>
          <ringGeometry args={[radius * RING_INNER_RATIO, radius, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={ringOpacity}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Billboard>
      {showLabel && (
        <Html
          distanceFactor={6}
          zIndexRange={[10, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="-translate-y-1/2 translate-x-2 whitespace-nowrap rounded-sm border border-white/15 bg-black/75 px-1.5 py-px text-[8px] font-medium tracking-wide text-white backdrop-blur-sm">
            {truncatedName}
          </div>
        </Html>
      )}
    </group>
  );
};
