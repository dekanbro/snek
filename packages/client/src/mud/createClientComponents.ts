import { overridableComponent } from "@latticexyz/recs";
import { SetupNetworkResult } from "./setupNetwork";

export type ClientComponents = ReturnType<typeof createClientComponents>;

export function createClientComponents({ components }: SetupNetworkResult) {
  return {
    ...components,
    Player: overridableComponent(components.Player),
    Position: overridableComponent(components.Position),
    HeadDirection: overridableComponent(components.HeadDirection),
    Snake: overridableComponent(components.Snake),
    SnakeLength: overridableComponent(components.SnakeLength),
    Food: overridableComponent(components.Food),
  };
}
