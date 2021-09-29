import { plantsList } from "./plants-info";

const convertID = (plant: string) => {
  let arrayID = plant.split("");
  // aaa-bb-c-dd-xx
  // let type = `${arrayID[0]}${arrayID[1]}${arrayID[2]}`;
  let id = `${arrayID[3]}${arrayID[4]}`;
  let img = `${arrayID[5]}`;
  let rarity = `${arrayID[6]}${arrayID[7]}`;
  return { id, img, rarity };
};

const calculateRarity = (num: string) => {
  let rarityType = "",
    color = "",
    rarityNum = 0;
  let rarity = parseInt(num);
  if (rarity >= 0 && rarity <= 59) {
    rarityType = "Common";
    rarityNum = 0;
    color = "#198754";
  } else if (rarity >= 60 && rarity <= 88) {
    rarityType = "Uncommon";
    rarityNum = 1;
    color = "#0d6efd";
  } else if (rarity >= 89 && rarity <= 98) {
    rarityType = "Rare";
    rarityNum = 2;
    color = "#dc3545";
  } else if (rarity === 99) {
    rarityType = "Mythic";
    rarityNum = 3;
    color = "#6610f2";
  }
  return { rarityType, rarityNum, color };
};

export const infoPlantId = (plantId: string) => {
  let { id, rarity } = convertID(plantId);
  let { rarityNum, rarityType } = calculateRarity(rarity);
  const plant = plantsList.find(obj => obj.id === id)
  if (plant === undefined) {
    throw new Error(`plant non existant for id ${plantId}`)
  }
  const { element, baseLE, hour, type } = plant;
  let le = baseLE[rarityNum] / parseFloat(hour);
  return {
    element,
    le,
    baseLE,
    hour,
    type,
    rarityType
  }
}
