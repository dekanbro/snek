import { Has, HasValue, getComponentValue, runQuery } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { uuid } from "@latticexyz/utils";
import { ClientComponents } from "./createClientComponents";
import { SetupNetworkResult } from "./setupNetwork";
import { Direction } from "../direction";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  { playerEntity, worldContract, waitForTransaction }: SetupNetworkResult,
  {
    MapConfig,
    Obstruction,
    Player,
    Position,
    HeadDirection
  }: ClientComponents
) {
  const wrapPosition = (x: number, y: number) => {
    const mapConfig = getComponentValue(MapConfig, singletonEntity);
    if (!mapConfig) {
      throw new Error("mapConfig no yet loaded or initialized");
    }
    return [
      (x + mapConfig.width) % mapConfig.width,
      (y + mapConfig.height) % mapConfig.height,
    ];
  };

  const isObstructed = (x: number, y: number) => {
    return runQuery([Has(Obstruction), HasValue(Position, { x, y })]).size > 0;
  };

  const setPlayerDirection = async (direction: Direction) => {
    if (!playerEntity) {
      throw new Error("no player");
    }

    const dirId = uuid();

    HeadDirection.addOverride(dirId, {
      entity: playerEntity,
      value: { value: direction },
    });

    try {
      const tx = await worldContract.write.setPlayerDirection([direction]);
      await waitForTransaction(tx);
    } finally {
      HeadDirection.removeOverride(dirId);
    }
  }

  const move = async () => {
    if (!playerEntity) {
      throw new Error("no player");
    }

    const position = getComponentValue(Position, playerEntity);
    if (!position) {
      console.warn("cannot move without a player position, not yet spawned?");
      return;
    }
    const direction = getComponentValue(HeadDirection, playerEntity);
    console.warn(" direction", direction);
    if (!direction) {
      console.warn("cannot move without a player direction");
      return;
    }


    let { value: directionValue } = direction;
    let { x: inputX, y: inputY  } = position;
    if (directionValue === Direction.North) {
      inputY -= 1;
    } else if (directionValue === Direction.East) {
      inputX += 1;
    } else if (directionValue === Direction.South) {
      inputY += 1;
    } else if (directionValue === Direction.West) {
      inputX -= 1;
    }

    const [x, y] = wrapPosition(inputX, inputY);
    if (isObstructed(x, y)) {
      console.warn("cannot move to obstructed space");
      return;
    }

    const positionId = uuid();
    Position.addOverride(positionId, {
      entity: playerEntity,
      value: { x, y },
    });

    try {
      const tx = await worldContract.write.move();
      await waitForTransaction(tx);
    } finally {
      Position.removeOverride(positionId);
    }
  };

  const spawn = async (inputX: number, inputY: number) => {
    console.log("spawn", inputX, inputY);
    if (!playerEntity) {
      throw new Error("no player");
    }

    const canSpawn = getComponentValue(Player, playerEntity)?.value !== true;
    if (!canSpawn) {
      throw new Error("already spawned");
    }

    const [x, y] = wrapPosition(inputX, inputY);
    if (isObstructed(x, y)) {
      console.warn("cannot spawn on obstructed space");
      return;
    }

    const positionId = uuid();
    Position.addOverride(positionId, {
      entity: playerEntity,
      value: { x, y },
    });
    const playerId = uuid();
    Player.addOverride(playerId, {
      entity: playerEntity,
      value: { value: true },
    });
    const directionId = uuid();
    HeadDirection.addOverride(directionId, {
      entity: playerEntity,
      value: { value: Direction.North },
    });

    try {
      const tx = await worldContract.write.spawn([x, y]);
      await waitForTransaction(tx);

    } finally {
      Position.removeOverride(positionId);
      Player.removeOverride(playerId);
      HeadDirection.removeOverride(directionId);
    }
  };



  return {
    move,
    spawn,
    setPlayerDirection,
  };
}
