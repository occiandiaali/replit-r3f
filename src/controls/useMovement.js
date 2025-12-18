import { useEffect, useRef, useState } from "react";

export function useMovement(sendInput) {
  const keys = useRef({});
  const [isTouching, setIsTouching] = useState(false);
  const touchRef = useRef(null);

  useEffect(() => {
    const down = (e) => (keys.current[e.code] = true);
    const up = (e) => (keys.current[e.code] = false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      let dx = 0,
        dz = 0;

      // WASD movement (relative to world XZ plane)
      if (keys.current["KeyW"]) dz -= 1;
      if (keys.current["KeyS"]) dz += 1;
      if (keys.current["KeyA"]) dx -= 1;
      if (keys.current["KeyD"]) dx += 1;

      // Touch joystick vector
      if (touchRef.current) {
        const { dx: tdx, dy: tdy } = touchRef.current;
        dx += tdx;
        dz += -tdy; // invert Y for forward
      }

      // Normalize to avoid faster diagonal
      const len = Math.hypot(dx, dz);
      if (len > 0) {
        sendInput(dx / len, dz / len);
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [sendInput]);

  const onTouchStart = (x, y) => {
    setIsTouching(true);
    touchRef.current = { startX: x, startY: y, dx: 0, dy: 0 };
  };
  const onTouchMove = (x, y) => {
    if (!touchRef.current) return;
    const max = 60; // joystick radius
    const dx = x - touchRef.current.startX;
    const dy = y - touchRef.current.startY;
    const len = Math.hypot(dx, dy);
    const clamp = len > max ? max / len : 1;
    touchRef.current.dx = (dx * clamp) / max;
    touchRef.current.dy = (dy * clamp) / max;
  };
  const onTouchEnd = () => {
    setIsTouching(false);
    touchRef.current = null;
  };

  return { isTouching, onTouchStart, onTouchMove, onTouchEnd };
}

// import { useEffect, useRef, useState } from "react";

// export function useMovement(rigidRef, sendInput) {
//   const keys = useRef({});
//   const [isTouching, setIsTouching] = useState(false);
//   const touchRef = useRef(null);

//   // Keyboard input
//   useEffect(() => {
//     const down = (e) => (keys.current[e.code] = true);
//     const up = (e) => (keys.current[e.code] = false);
//     window.addEventListener("keydown", down);
//     window.addEventListener("keyup", up);
//     return () => {
//       window.removeEventListener("keydown", down);
//       window.removeEventListener("keyup", up);
//     };
//   }, []);

//   // Movement loop
//   useEffect(() => {
//     let raf = 0;
//     const speed = 0.05; // Rapier-friendly speed

//     const loop = () => {
//       let dx = 0,
//         dz = 0;

//       // WASD
//       if (keys.current["KeyW"]) dz -= 1;
//       if (keys.current["KeyS"]) dz += 1;
//       if (keys.current["KeyA"]) dx -= 1;
//       if (keys.current["KeyD"]) dx += 1;

//       // Touch joystick
//       if (touchRef.current) {
//         dx += touchRef.current.dx;
//         dz += -touchRef.current.dy;
//       }

//       const len = Math.hypot(dx, dz);

//       if (len > 0 && rigidRef.current) {
//         const nx = dx / len;
//         const nz = dz / len;

//         // Move the local Rapier body
//         const pos = rigidRef.current.translation();
//         rigidRef.current.setNextKinematicTranslation({
//           x: pos.x + nx * speed,
//           y: pos.y,
//           z: pos.z + nz * speed,
//         });

//         // Send direction to server (optional)
//         sendInput(nx, nz);
//       }

//       raf = requestAnimationFrame(loop);
//     };

//     raf = requestAnimationFrame(loop);
//     return () => cancelAnimationFrame(raf);
//   }, [rigidRef, sendInput]);

//   // Touch controls
//   const onTouchStart = (x, y) => {
//     setIsTouching(true);
//     touchRef.current = { startX: x, startY: y, dx: 0, dy: 0 };
//   };

//   const onTouchMove = (x, y) => {
//     if (!touchRef.current) return;
//     const max = 60;
//     const dx = x - touchRef.current.startX;
//     const dy = y - touchRef.current.startY;
//     const len = Math.hypot(dx, dy);
//     const clamp = len > max ? max / len : 1;
//     touchRef.current.dx = (dx * clamp) / max;
//     touchRef.current.dy = (dy * clamp) / max;
//   };

//   const onTouchEnd = () => {
//     setIsTouching(false);
//     touchRef.current = null;
//   };

//   return { isTouching, onTouchStart, onTouchMove, onTouchEnd };
// }
