import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Scene } from "./Scene";

export default function App() {
  const [duration, setDuration] = useState(null);
  consrt[(id, setId)] = useState(null);

  useEffect(() => {
    // --- URL params ---
    const params = new URLSearchParams(window.location.search);

    setDuration(params.get("timer"));
    console.log("timeCount ", duration);
    setId(params.get("room_id"));
    console.log("Room ", id);
  }, []);

  return (
    <div style={{ width: "100%", height: "550px", overflowY: "hidden" }}>
      <Canvas camera={{ position: [0, 4, 8], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} />
        <gridHelper args={[40, 40]} />
        <Scene countStr={duration} idStr={id} />
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}
