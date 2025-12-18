import { Client, getStateCallbacks, Room } from "colyseus.js";
import { useEffect, useRef, useState } from "react";

export function useColyseus() {
  const [players, setPlayers] = useState({});
  const roomRef = useRef(null);
  const [myId, setMyId] = useState(null);

  useEffect(() => {
    const client = new Client("https://colys-blindate.onrender.com");
    client.joinOrCreate("game_room", {}).then((room) => {
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
    });

    return () => {
      roomRef.current?.leave();
    };
  }, []);

  const sendInput = (dx, dz) => {
    roomRef.current?.send("input", { dx, dz });
  };

  return { players, sendInput, myId };
}
