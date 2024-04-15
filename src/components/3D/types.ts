import * as THREE from "three";
import { GLTF } from "three-stdlib";

export type GLTFResult = GLTF & {
  nodes: Record<string, THREE.Mesh>;
  materials: Record<string, THREE.Material>;
};

export type ThreeModelProps = JSX.IntrinsicElements["group"] & {
  objRef?: React.Ref<THREE.Group>;
  material?: THREE.Material;
};
