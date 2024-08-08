// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { System } from "@latticexyz/world/src/System.sol";
import { MapConfig, Movable, Obstruction, Player, Position, HeadDirection, Snake, SnakeLength, Food } from "../codegen/index.sol";
import { Direction } from "../codegen/common.sol";

import { addressToEntityKey } from "../addressToEntityKey.sol";
import { positionToEntityKey } from "../positionToEntityKey.sol";


contract MapSystem is System {

  function spawn(int32 x, int32 y) public {
    bytes32 player = addressToEntityKey(address(_msgSender()));
    require(!Player.get(player), "already spawned");

    // Constrain position to map size, wrapping around if necessary
    (uint32 width, uint32 height, ) = MapConfig.get();
    x = (x + int32(width)) % int32(width);
    y = (y + int32(height)) % int32(height);

    bytes32 position = positionToEntityKey(x, y);
    require(!Obstruction.get(position), "this space is obstructed");


    Player.set(player, true);
    Position.set(player, x, y);
    Movable.set(player, true);

    Snake.pushXBody(player, x);
    Snake.pushYBody(player, y);

    setPlayerDirection(Direction.North);
    SnakeLength.set(player, 0);

    spawnFood();

  }

  function eatFood(bytes32 player, int32 x, int32 y) public {
    bytes32 position = positionToEntityKey(x, y);
    require(Food.get(position), "No food here");

    Food.deleteRecord(position);

    uint32 length = SnakeLength.get(player);
    SnakeLength.set(player, length + 1);

    spawnFood();

  }

  function spawnFood() public {
    (uint32 width, uint32 height, ) = MapConfig.get();
    uint32 x = uint32(block.timestamp) % width;
    uint32 y = uint32(block.prevrandao) % height;

    bytes32 foodEntity = positionToEntityKey(int32(x), int32(y));
    while (Obstruction.get(foodEntity)) {
      x = (x + 1) % width;
      y = (y + 1) % height;
      foodEntity = positionToEntityKey(int32(x), int32(y));
    }
    Position.set(foodEntity, int32(x), int32(y));
    Food.set(foodEntity, true);

  }

  function setPlayerDirection(Direction direction) public {
    bytes32 player = addressToEntityKey(_msgSender());
    require(Player.get(player), "not a player");

    HeadDirection.set(player, direction);

  }

  function move() public {
    bytes32 player = addressToEntityKey(_msgSender());
    require(Movable.get(player), "cannot move");


    Direction direction = HeadDirection.get(player);

    (int32 x, int32 y) = Position.get(player);
    

    if (direction == Direction.North) {
      y -= 1;
    } else if (direction == Direction.East) {
      x += 1;
    } else if (direction == Direction.South) {
      y += 1;
    } else if (direction == Direction.West) {
      x -= 1;
    }

    // Constrain position to map size, wrapping around if necessary
    (uint32 width, uint32 height, ) = MapConfig.get();
    x = (x + int32(width)) % int32(width);
    y = (y + int32(height)) % int32(height);

    bytes32 position = positionToEntityKey(x, y);
    require(!Obstruction.get(position), "this space is obstructed");



    if(Food.get(position)) {
      eatFood(player, x, y);
    } 
    Position.set(player, x, y);

    Snake.pushXBody(player, x);
    Snake.pushYBody(player, y);

    for (uint32 i = 0; i < Snake.lengthXBody(player); i++) {
        bytes32 prevPosition = positionToEntityKey(Snake.getItemXBody(player, i), Snake.getItemYBody(player, i));
        if (i >= Snake.lengthXBody(player) - SnakeLength.get(player)) {
           Obstruction.set(prevPosition, true);
        } else {
            Obstruction.deleteRecord(prevPosition);
        }

    }

  }

}
