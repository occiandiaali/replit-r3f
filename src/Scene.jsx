import React, { useMemo } from "react";

import { useColyseus } from "./network/useColyseus";
import { useMovement } from "./controls/useMovement";
import { useThree } from "@react-three/fiber";

export function Scene() {
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
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#808080" />
      </mesh>

      {/* Players */}
      {playerEntries.map((p) => (
        <mesh key={p.sessionId} position={[p.x, 0.28, p.z]} castShadow>
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
