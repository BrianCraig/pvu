
export type PlantElements = "Fire" | "Ice" | "Electro" | "Water" | "Light" | "Wind" | "Parasite" | "Metal" | "Dark"
export type PlantTypes = "Plant" | "Mother tree"
export type PlantRarity = "Common" | "Uncommon" | "Rare" | "Mythic"

export interface PlantData {
  element: PlantElements,
  le: number,
  type: PlantTypes,
  rarityType: PlantRarity,
  rarityColor: string
}