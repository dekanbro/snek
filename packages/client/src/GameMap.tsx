import { ReactNode, useEffect, useState } from "react";
import { Entity } from "@latticexyz/recs";
import { twMerge } from "tailwind-merge";
import { useMUD } from "./MUDContext";

type Props = {
  width: number;
  height: number;
  onTileClick?: (x: number, y: number) => void;
  terrain?: {
    x: number;
    y: number;
    emoji: string;
  }[];
  players?: {
    x: number;
    y: number;
    emoji: string;
    entity: Entity;
  }[];
  snakeBodies?: {
    xBody: number[];
    yBody: number[];
    emoji: string;
    entity: Entity;
  }[];
  snakeLengths?: {
    bodyLength: number;
    entity: Entity;
  }[];
  food?: {
    x: number;
    y: number;
    emoji: string;
  }[];
};

export const GameMap = ({
  width,
  height,
  onTileClick,
  terrain,
  players,
  snakeBodies,
  snakeLengths,
  food
}: Props) => {
  const {
    network: { playerEntity },
  } = useMUD();

  const rows = new Array(width).fill(0).map((_, i) => i);
  const columns = new Array(height).fill(0).map((_, i) => i);

  return (
    <div className="inline-grid p-2 bg-lime-500 relative overflow-hidden">
      {rows.map((y) =>
        columns.map((x) => {
          const terrainEmoji = terrain?.find(
            (t) => t.x === x && t.y === y
          )?.emoji;

          const playersHere = players?.filter((p) => p.x === x && p.y === y);
          const mainPlayerHere = playersHere?.find(
            (p) => p.entity === playerEntity
          );

          const snakeLength = snakeLengths?.find(
            (sl) => sl.entity === playerEntity
          )?.bodyLength || 0;

          const snakeBodiesHere = snakeBodies?.filter(
            (s) => {

              const bodyLength = s.xBody.length;

              const xBody = s.xBody.slice(bodyLength - snakeLength);
              const yBody = s.yBody.slice(bodyLength - snakeLength);

              return xBody.some((body, i) => body === x && yBody[i] === y) && !playersHere?.some(p => p.entity === s.entity);

            }
          );
          // food it here unless there is a player or snake body there
          const foodHere = food?.find(
            (f) =>
              f.x === x &&
              f.y === y &&
              !playersHere?.some((p) => p.entity === playerEntity) &&
              !snakeBodiesHere?.some((s) => s.entity === playerEntity)
          );

          return (
            <div
              key={`${x},${y}`}
              className={twMerge(
                "w-5 h-5 flex items-center justify-center",
                onTileClick ? "cursor-pointer hover:ring" : null
              )}
              style={{
                gridColumn: x + 1,
                gridRow: y + 1,
              }}
              onClick={() => {
                onTileClick?.(x, y);
              }}
            >

              <div className="flex flex-wrap gap-1 items-center justify-center relative">
                {terrainEmoji ? (
                  <div className="absolute inset-0 flex items-center justify-center text-3xl pointer-events-none">
                    {terrainEmoji}
                  </div>
                ) : null}
                <div className="relative">
                  {playersHere?.map((p) => (
                    <span className="inset-0 flex items-center justify-center text-2xl pointer-events-none" key={p.entity}>{p.emoji}</span>
                  ))}

                  {snakeBodiesHere?.map((s) => (
                    <span className="inset-0 flex items-center justify-center text-2xl pointer-events-none" key={s.entity}>{s.emoji}</span>
                  ))}

                  {foodHere ? <span className="inset-0 flex items-center justify-center text-2xl pointer-events-none">{foodHere.emoji}</span> : null}
                </div>
              </div>
            </div>
          );
        })
      )}

    </div>
  );
};
