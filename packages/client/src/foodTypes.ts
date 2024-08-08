export enum FoodType {
  Cookie = 1,
}

type FoodConfig = {
  emoji: string;
};

export const foodTypes: Record<FoodType, FoodConfig> = {
  [FoodType.Cookie]: {
    emoji: "◍",
  }
};
