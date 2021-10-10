import React, { useContext, useEffect, useState } from 'react';
import { PlantElements, plantElements, plantRarity, PlantRarity } from '../plants/plant-types';
import { SettingsContext } from './SettingsContext';

const defaultPrice = 0

interface MarketplacePriceContextInterface {
  suggestPrice: (element: PlantElements, rarity: PlantRarity) => [number, number]
}

export const MarketplacePriceContext = React.createContext<MarketplacePriceContextInterface>({
  suggestPrice: () => [defaultPrice, defaultPrice]
});

let rarityMap: { [key in PlantRarity]: number } = {
  "Common": 0,
  "Uncommon": 1,
  "Rare": 2,
  "Mythic": 3
}

let fetchCreator = (element: PlantElements, rarity: PlantRarity, bearer: string) => fetch(`https://backend-farm.plantvsundead.com/get-plants-filter-v2?elements=${element.toLowerCase()}&rarities=${rarityMap[rarity]}&offset=0&limit=10&type=1`,
  {
    headers: { 'Authorization': "Bearer Token: " + bearer }
  })
  .then(response => response.json())

export const MarketplacePriceContextProvider: React.FunctionComponent = ({ children }) => {
  const [status, setStatus] = useState<{ [key: string]: number }>({});
  const { bearer } = useContext(SettingsContext);
  useEffect(() => {
    if (bearer !== "") {
      for (let element of plantElements) {
        for (let rarity of plantRarity) {
          fetchCreator(element, rarity, bearer)
            .then(response => {
              setStatus(actualStatus => ({ ...actualStatus, [`${element}${rarity}`]: response.data[0].startingPrice }))
            })
        }
      }
    }
  }, [bearer])

  const suggestPrice = (element: PlantElements, rarity: PlantRarity): [number, number] => {
    let price = status[`${element}${rarity}`]
    return price ? [price, (price * .98) - .5] : [defaultPrice, defaultPrice]
  }

  return <MarketplacePriceContext.Provider value={{ suggestPrice }} >
    {children}
  </MarketplacePriceContext.Provider >
}