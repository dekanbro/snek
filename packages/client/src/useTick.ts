import { useEffect } from "react";
import { useMUD } from "./MUDContext";

export const useTick = () => {
  const {
    systemCalls: { move },
  } = useMUD();

  useEffect(() => {
    const interval = setInterval(() => {
      move(); 
    }, 800);

    return () => clearInterval(interval);
  }, [move]);


};
