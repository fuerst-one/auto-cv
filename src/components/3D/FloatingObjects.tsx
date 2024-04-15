"use client";

import * as THREE from "three";
import { ReactNode, useRef, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import {
  EffectComposer,
  DepthOfField,
  ToneMapping,
} from "@react-three/postprocessing";
import {
  ThreeTrophy,
  ThreeBeaker,
  ThreeBell,
  ThreeCalculator,
  ThreeCamera,
  ThreeCard,
  ThreeCoffee,
  ThreeCompass,
  ThreeDiscount,
  ThreeFolder,
  ThreeHandle,
  ThreeLifebuoy,
  ThreeSpeaker,
} from "./Icons";
import { ThreeModelProps } from "./types";
import { Keyboard } from "./Keyboard";

const models = [
  ThreeTrophy,
  ThreeBeaker,
  ThreeBell,
  ThreeCalculator,
  ThreeCamera,
  ThreeCard,
  ThreeCoffee,
  ThreeCompass,
  ThreeDiscount,
  ThreeFolder,
  ThreeHandle,
  ThreeLifebuoy,
  ThreeSpeaker,
  Keyboard,
];

export const FloatingObjects = ({
  speed = 0.5,
  count = 60,
  depth = 80,
  easing = (x: number) => Math.sqrt(1 - Math.pow(x - 1, 2)),
}) => {
  return (
    // No need for antialias (faster), dpr clamps the resolution to 1.5 (also faster than full resolution)
    // As of three > r154 if postprocessing is used the canvas can not have tonemapping (which is what "flat" is, no tonemapping)
    <Canvas
      flat
      gl={{ antialias: false }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 10], fov: 20, near: 0.01, far: depth + 15 }}
      className="h-full w-full opacity-55"
    >
      {/* <color attach="background" args={["#ffbf40"]} /> */}
      {/* As of three > r153 lights work differently in threejs, to get similar results as before you have to add decay={0} */}
      <spotLight
        position={[10, 20, 10]}
        penumbra={1}
        decay={0}
        intensity={3}
        color="#89daff"
      />
      {/* Using cubic easing here to spread out objects a little more interestingly, i wanted a sole big object up front ... */}
      {Array.from(
        { length: count },
        (_, i) => <Object key={i} index={i} z={Math.round(easing(i / count) * depth)} speed={speed} /> /* prettier-ignore */,
      )}
      <Environment preset="sunset" />
      {/* Multisampling (MSAA) is WebGL2 antialeasing, we don't need it (faster)
          The normal-pass is not required either, saves a bit of performance */}
      <EffectComposer enableNormalPass={false} multisampling={0}>
        <DepthOfField
          target={[0, 0, 60]}
          focalLength={0.4}
          bokehScale={10}
          height={700}
        />
        {/* As of three > r154 tonemapping is not applied on rendertargets any longer, it requires a pass */}
        <ToneMapping />
      </EffectComposer>
    </Canvas>
  );
};

const Object = ({
  index,
  z,
  speed,
  Model = models[Math.floor(Math.random() * models.length)],
}: {
  index: number;
  z: number;
  speed: number;
  Model?: (props: ThreeModelProps) => ReactNode;
}) => {
  const ref = useRef<THREE.Group>(null);
  // useThree gives you access to the R3F state model
  const { viewport, camera } = useThree();
  // getCurrentViewport is a helper that calculates the size of the viewport
  const { width, height } = viewport.getCurrentViewport(camera, [0, 0, -z]);

  // Local component state, it is safe to mutate because it's fixed data
  const [data] = useState({
    // Randomly distributing the objects along the vertical
    y: THREE.MathUtils.randFloatSpread(height * 2),
    // This gives us a random value between -1 and 1, we will multiply it with the viewport width
    x: THREE.MathUtils.randFloatSpread(2),
    // How fast objects spin, randFlost gives us a value between min and max, in this case 8 and 12
    spin: THREE.MathUtils.randFloat(8, 12),
    // Some random rotations, Math.PI represents 360 degrees in radian
    rX: Math.random() * Math.PI,
    rZ: Math.random() * Math.PI,
  });

  // useFrame executes 60 times per second
  useFrame((state, dt) => {
    if (!ref.current) {
      return;
    }
    // Make the X position responsive, slowly scroll objects up at the Y, distribute it along the Z
    // dt is the delta, the time between this frame and the previous, we can use it to be independent of the screens refresh rate
    // We cap dt at 0.1 because now it can't accumulate while the user changes the tab, it will simply stop
    if (dt < 0.1)
      ref.current.position.set(
        index === 0 ? 0 : data.x * width,
        (data.y += dt * speed),
        -z,
      );
    // Rotate the object around
    ref.current.rotation.set(
      (data.rX += dt / data.spin),
      Math.sin(index * 1000 + state.clock.elapsedTime / 10) * Math.PI,
      (data.rZ += dt / data.spin),
    );
    // If they're too far up, set them back to the bottom
    if (data.y > height * (index === 0 ? 4 : 1))
      data.y = -(height * (index === 0 ? 4 : 1));
  });

  return (
    <group ref={ref}>
      <Model material={new THREE.MeshStandardMaterial({ color: "#004666" })} />
    </group>
  );
};
