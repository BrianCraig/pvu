
const plantElementsInput= ["Fire", "Ice", "Electro", "Water", "Light", "Wind", "Parasite", "Metal", "Dark"] as const;
export type PlantElements = typeof plantElementsInput[number];
export const plantElements: readonly PlantElements[] = plantElementsInput;


const plantRarityInput= ["Common", "Uncommon", "Rare", "Mythic"] as const;
export type PlantRarity = typeof plantRarityInput[number];
export const plantRarity: readonly PlantRarity[] = plantRarityInput;

export type PlantTypes = "Plant" | "Mother tree"

export interface PlantData {
  id: string,
  element: PlantElements,
  le: number,
  type: PlantTypes,
  rarityType: PlantRarity,
  rarityColor: string
}