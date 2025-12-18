import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Scene } from "./Scene";

export default function App() {
  return (
    <div style={{ width: "100%", height: "550px" }}>
      <Canvas camera={{ position: [0, 4, 8], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} />
        <gridHelper args={[20, 20]} />
        <Scene />
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}
