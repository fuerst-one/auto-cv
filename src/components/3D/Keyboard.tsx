"use client";

/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React from "react";
import { useGLTF } from "@react-three/drei";
import { GLTFResult, ThreeModelProps } from "./types";

export function Keyboard({ material, ...props }: ThreeModelProps) {
  const { nodes } = useGLTF("/fuerst_one_keyboard.glb") as GLTFResult;
  return (
    <group {...props} dispose={null} scale={0.01}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Key_Cover.geometry}
        material={material ?? nodes.Key_Cover.material}
        position={[2, -7.292, 0.251]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Base_Board.geometry}
        material={material ?? nodes.Base_Board.material}
        position={[1, -7.292, 1.251]}
      />
      <group
        position={[213.214, 16.658, 52.4]}
        rotation={[0, 0, -0.004]}
        scale={[1, 0.532, 1]}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Text_(E)nter"].geometry}
          material={material ?? nodes["Text_(E)nter"].material}
          position={[16.091, 35.715, -7.054]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["Text_E(nter)"].geometry}
          material={material ?? nodes["Text_E(nter)"].material}
          position={[-5.188, 35.715, -11.327]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube_Enter.geometry}
          material={material ?? nodes.Cube_Enter.material}
          position={[0, 12.868, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        />
      </group>
      <group position={[106.763, 16.666, 52.4]} scale={[1, 0.532, 1]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Text_N.geometry}
          material={material ?? nodes.Text_N.material}
          position={[-5.188, 35.715, -11.327]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube_N.geometry}
          material={material ?? nodes.Cube_N.material}
          position={[0, 12.868, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        />
      </group>
      <group
        position={[0.575, 16.666, 52.4]}
        rotation={[0, 0, -0.004]}
        scale={[1, 0.532, 1]}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Text_O.geometry}
          material={material ?? nodes.Text_O.material}
          position={[-5.188, 35.715, -11.327]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube_O.geometry}
          material={material ?? nodes.Cube_O.material}
          position={[0, 12.868, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        />
      </group>
      <group position={[-105.744, 16.666, 52.4]} scale={[1, 0.532, 1]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Text_Dot.geometry}
          material={material ?? nodes.Text_Dot.material}
          position={[-5.188, 35.715, -11.327]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube_Dot.geometry}
          material={material ?? nodes.Cube_Dot.material}
          position={[0, 12.868, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        />
      </group>
      <group
        position={[-213.215, 16.699, 52.454]}
        rotation={[0, 0, -0.004]}
        scale={[1, 0.533, 1.001]}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Text_T.geometry}
          material={material ?? nodes.Text_T.material}
          position={[-5.188, 35.715, -11.327]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube_T.geometry}
          material={material ?? nodes.Cube_T.material}
          position={[0, 12.868, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        />
      </group>
      <group position={[213.681, 16.52, -51.878]} scale={[1, 0.532, 1]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Text_S.geometry}
          material={material ?? nodes.Text_S.material}
          position={[-5.188, 35.715, -11.327]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube_S.geometry}
          material={material ?? nodes.Cube_S.material}
          position={[0, 12.868, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        />
      </group>
      <group position={[107.201, 6.066, -51.878]} scale={[1, 0.532, 1]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Text_R.geometry}
          material={material ?? nodes.Text_R.material}
          position={[-4.975, 55.379, -11.327]}
          rotation={[-Math.PI / 2, 0.003, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube_R.geometry}
          material={material ?? nodes.Cube_R.material}
          position={[0.146, 32.517, 0]}
          rotation={[-Math.PI / 2, -1.568, -Math.PI / 2]}
        />
      </group>
      <group position={[-0.136, 16.52, -51.878]} scale={[1, 0.532, 1]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Text_E.geometry}
          material={material ?? nodes.Text_E.material}
          position={[-5.188, 35.715, -11.327]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube_E.geometry}
          material={material ?? nodes.Cube_E.material}
          position={[0, 12.868, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        />
      </group>
      <group
        position={[-106.474, 16.52, -51.878]}
        rotation={[0, 0, -0.004]}
        scale={[1, 0.532, 1]}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Text_U.geometry}
          material={material ?? nodes.Text_U.material}
          position={[-5.188, 35.715, -11.327]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube_U.geometry}
          material={material ?? nodes.Cube_U.material}
          position={[0, 12.868, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        />
      </group>
      <group position={[-212.926, 16.52, -51.878]} scale={[1, 0.532, 1]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Text_F.geometry}
          material={material ?? nodes.Text_F.material}
          position={[-5.188, 35.715, -11.327]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube_F.geometry}
          material={material ?? nodes.Cube_F.material}
          position={[0, 12.868, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/fuerst_one_keyboard.glb");
