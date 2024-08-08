import { useEffect } from "react";
import { useMUD } from "./MUDContext";
import { Direction } from "./direction";

export const useKeyboardMovement = () => {
  const {
    systemCalls: { setPlayerDirection },
  } = useMUD();

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        setPlayerDirection(Direction.North);
      }
      if (e.key === "ArrowDown") {
        setPlayerDirection(Direction.South);
      }
      if (e.key === "ArrowLeft") {
        setPlayerDirection(Direction.West);
      }
      if (e.key === "ArrowRight") {
        setPlayerDirection(Direction.East);
      }
    };

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [setPlayerDirection]);
};
