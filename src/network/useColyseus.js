import { Client, getStateCallbacks, Room } from "colyseus.js";
import { useEffect, useRef, useState } from "react";

export function useColyseus({ countdownDuration }) {
  const [players, setPlayers] = useState({});
  const roomRef = useRef(null);
  const [myId, setMyId] = useState(null);
  const [countdown, setCountdown] = useState(countdownDuration);

  useEffect(() => {
    const client = new Client("https://colys-blindate.onrender.com");
    client.joinOrCreate("game_room", { countdownDuration }).then((room) => {
      room.onStateChange((state) => setCountdown(state.countdown));
      roomRef.current = room;
      setMyId(room.sessionId);

      const $ = getStateCallbacks(roomRef.current);

      // Sync players map
      $(room.state).players.onAdd((p, key) => {
        setPlayers((prev) => ({
          ...prev,
          [key]: { sessionId: key, x: p.x, y: p.y, z: p.z },
        }));
        $(p).onChange(() => {
          setPlayers((prev) => ({
            ...prev,
            [key]: { sessionId: key, x: p.x, y: p.y, z: p.z },
          }));
        });
      });

      $(room.state).players.onRemove((_p, key) => {
        setPlayers((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      });
      //========
      room.onMessage("gameStarted", (msg) => {
        console.log(msg);
      });
      room.onMessage("timeLeft", (msg) => {
        console.log(msg);
      });
      //=========
    });

    return () => {
      roomRef.current?.leave();
    };
  }, [countdownDuration]);

  const sendInput = (dx, dz) => {
    roomRef.current?.send("input", { dx, dz });
  };

  return { countdown, players, sendInput, myId };
}
