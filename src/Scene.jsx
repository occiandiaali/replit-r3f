import React, { useMemo, useRef, useState } from "react";

import { useColyseus } from "./network/useColyseus";
import { useMovement } from "./controls/useMovement";
import { useThree } from "@react-three/fiber";
//import { Physics, RigidBody } from "@react-three/rapier";
import { Html } from "@react-three/drei";

function Overlay({ timer, id }) {
  return (
    <Html position={[0, 0, 0]} fullscreen>
      <div
        style={{
          position: "absolute",
          top: 14, //20,
          right: 20,
          color: "green",
          fontSize: "24px",
        }}
      >
        {timer}
      </div>

      <div
        style={{
          position: "absolute",
          top: 30,
          left: 20,
          color: "green",
          fontSize: "18px",
        }}
      >
        {id}
      </div>
    </Html>
  );
}

export function Scene({ countStr, idStr }) {
  const myRigid = useRef();
  //const [countStr, setCountStr] = useState("05:00");
  const { players, sendInput, myId } = useColyseus();
  const { onTouchStart, onTouchMove, onTouchEnd, isTouching } =
    useMovement(sendInput);

  const { gl, size } = useThree();

  // Touch layer
  React.useEffect(() => {
    const el = gl.domElement;
    const start = (e) => {
      const t = e.touches[0];
      onTouchStart(t.clientX, t.clientY);
    };
    const move = (e) => {
      const t = e.touches[0];
      if (t) onTouchMove(t.clientX, t.clientY);
    };
    const end = () => onTouchEnd();

    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchmove", move, { passive: true });
    el.addEventListener("touchend", end, { passive: true });
    el.addEventListener("touchcancel", end, { passive: true });

    return () => {
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchmove", move);
      el.removeEventListener("touchend", end);
      el.removeEventListener("touchcancel", end);
    };
  }, [gl, onTouchStart, onTouchMove, onTouchEnd]);

  const playerEntries = useMemo(() => Object.values(players), [players]);

  return (
    <>
      <Overlay timer={countStr} id={idStr} />
      {/* Ground */}

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#808080" />
      </mesh>

      {/* Players */}
      {playerEntries.map((p) => (
        <mesh key={p.sessionId} position={[p.x, 0.3, p.z]} castShadow>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial
            color={p.sessionId === myId ? "#3ba7ff" : "#ff7f3b"}
          />
        </mesh>
      ))}

      {/* Optional touch hint */}
      {isTouching && <HtmlOverlay size={size} />}
    </>
  );
}

// Simple overlay to show touch hint (optional)
import { createPortal } from "react-dom";

function HtmlOverlay({ size }) {
  const el =
    document.getElementById("overlay") ||
    (() => {
      const div = document.createElement("div");
      div.id = "overlay";
      div.style.position = "fixed";
      div.style.left = "0";
      div.style.top = "0";
      div.style.width = "100%";
      div.style.height = "100%";
      div.style.pointerEvents = "none";
      document.body.appendChild(div);
      return div;
    })();

  return createPortal(
    <div
      style={{
        position: "absolute",
        left: 16,
        bottom: 16,
        padding: "8px 10px",
        background: "rgba(0,0,0,0.4)",
        color: "white",
        borderRadius: 8,
        fontSize: 12,
      }}
    >
      Touch and drag to move
    </div>,
    el
  );
}
