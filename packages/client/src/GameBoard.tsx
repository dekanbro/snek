import { useComponentValue, useEntityQuery } from "@latticexyz/react";
import { GameMap } from "./GameMap";
import { useMUD } from "./MUDContext";
import { useKeyboardMovement } from "./useKeyboardMovement";
import { hexToArray } from "@latticexyz/utils";
import { TerrainType, terrainTypes } from "./terrainTypes";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Entity, Has, getComponentValueStrict } from "@latticexyz/recs";
import { useTick } from "./useTick";
import { FoodType, foodTypes } from "./foodTypes";
import { Direction } from "./direction";

export const GameBoard = () => {
  useKeyboardMovement();
  useTick();

  const {
    components: { MapConfig, Player, Position, Snake, SnakeLength, Food, HeadDirection, Flag, Winner },
    network: { playerEntity },
    systemCalls: { spawn, spawnFlag },
  } = useMUD();

  const canSpawn = useComponentValue(Player, playerEntity)?.value !== true;

  const players = useEntityQuery([Has(Player), Has(Position)]).map((entity) => {
    const position = getComponentValueStrict(Position, entity);
    const direction = getComponentValueStrict(HeadDirection, entity);

    const headDirectionEmoji = Direction[direction?.value] === "North"
      ? "▲" : Direction[direction?.value] === "East"
        ? "▸" : Direction[direction?.value] === "South" ? "▼" : "◂";


    return {
      entity,
      x: position.x,
      y: position.y,
      emoji: entity === playerEntity ? headDirectionEmoji : "*",
    };
  });


  const snakeBodies = useEntityQuery([Has(Player), Has(Snake)]).map((entity) => {
    return {
      entity,
      xBody: getComponentValueStrict(Snake, entity).xBody,
      yBody: getComponentValueStrict(Snake, entity).yBody,
      emoji: entity === playerEntity ? "▢" : "○",
    };
  });

  const snakeLengths = useEntityQuery([Has(Player), Has(SnakeLength)]).map((entity) => {
    return {
      entity,
      bodyLength: getComponentValueStrict(SnakeLength, entity).value,
    };
  }
  );
  const snakeLength = snakeLengths?.find(
    (sl) => sl.entity === playerEntity
  )?.bodyLength || 0;

  const totalOfSnakeLengths = snakeLengths?.reduce((acc, curr) => acc + curr.bodyLength, 0) || 0;

  const mapConfig = useComponentValue(MapConfig, singletonEntity);
  if (mapConfig == null) {
    throw new Error(
      "map config not set or not ready, only use this hook after loading state === LIVE"
    );
  }

  const { width, height, terrain: terrainData } = mapConfig;
  const terrain = Array.from(hexToArray(terrainData)).map((value, index) => {
    const { emoji } =
      value in TerrainType ? terrainTypes[value as TerrainType] : { emoji: "" };
    return {
      x: index % width,
      y: Math.floor(index / width),
      emoji,
    };
  });

  const foodQuery = useEntityQuery([Has(Food), Has(Position)]);
  const food = foodQuery.map((entity) => {
    const position = getComponentValueStrict(Position, entity);
    return {
      entity,
      x: position.x,
      y: position.y,
      emoji: foodTypes[FoodType.Cookie].emoji,
    };
  });

  const flags = useEntityQuery([Has(Flag), Has(Position)]).map((entity) => {
    const position = getComponentValueStrict(Position, entity);
    return {
      entity,
      x: position.x,
      y: position.y,
      emoji: "⚑",
    };
  }
  );

  const winners = useEntityQuery([Has(Winner), Has(Player)]).map((entity) => {

    return {
      entity,
      emoji: entity === playerEntity ? "⚑" : "X",
      text: entity === playerEntity ? "You Win!" : "You Lose!",
    }
  });
  

  return (
    <div className="bg-black-500 overflow-hidden" >
      <GameMap
        width={width}
        height={height}
        terrain={terrain}
        onTileClick={canSpawn ? spawn : undefined}
        players={players}
        snakeBodies={snakeBodies}
        snakeLengths={snakeLengths}
        food={food}
        flags={flags}
      />
      <div className="p-2 text-white">
        <p>Snek Game</p>
        <p>{snakeLength} SNEK</p>
        <p>total: {totalOfSnakeLengths} SNEK</p>
        {!winners.length ? (<button onClick={spawnFlag}>End Game</button>) :
        (<div className="flex flex-row">
          {winners.map((winner) => (
            <div key={winner.entity} className="p-2">
              {winner.emoji} {winner.text}
            </div>
          ))}
        </div>)}


      </div>
    </div>
  );
};
