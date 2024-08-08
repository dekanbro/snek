import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  enums: {
    Direction: ["North", "East", "South", "West"],
    TerrainType: ["None", "TallGrass", "Boulder"],
    FoodType: ["Cookie"],
  },
  tables: {
    MapConfig: {
      schema: {
        width: "uint32",
        height: "uint32",
        terrain: "bytes",
      },
      key: [],
      codegen: {
        dataStruct: false,
      },
    },
    Food: "bool",
    Movable: "bool",
    Obstruction: "bool",
    Player: "bool",
    HeadDirection: {
      schema: {
        id: "bytes32",
        value: "Direction",
      },
      key: ["id"],
      codegen: {
        dataStruct: false,
      },
    },
    Snake: {
      schema: {
        id: "bytes32",
        xBody: "int32[]",
        yBody: "int32[]",
      },
      key: ["id"],
      codegen: {
        dataStruct: false,
      },
    },
    SnakeLength: "uint32",
    Position: {
      schema: {
        id: "bytes32",
        x: "int32",
        y: "int32",
      },
      key: ["id"],
      codegen: {
        dataStruct: false,
      },
    },
  },
});
