import React, { useContext, useEffect, useState } from 'react';
import { fromWei } from "web3-utils";
import { tokenContract } from '../eth/token-contract';
import { infoPlantId } from '../plants/plant-id-tools';
import { PlantData } from '../plants/plant-types';
import { Auction, STATUS } from '../types';
import { MarketplacePriceContext } from './MarketplacePriceContext';
import { SettingsContext } from './SettingsContext';


type PlantsMap = Map<string, PlantData>
const plantsMap: PlantsMap = new Map<string, PlantData>();

type ActiveMap = Map<string, boolean>
const activeMap: ActiveMap = new Map<string, boolean>();

interface PlantIdContextInterface {
  plantData: PlantData | undefined,
  active: boolean | undefined,
  autobuy: boolean,
  gains: number | undefined
}

export const PlantIdContext = React.createContext<PlantIdContextInterface>({
  plantData: undefined,
  active: undefined,
  autobuy: false,
  gains: undefined
});

let fetchCreator = (id: string, bearer: string) => fetch(`https://backend-farm.plantvsundead.com/get-plant-detail-v2?plantId=${id}`,
  {
    //withCredentials: true,
    headers: { 'Authorization': "Bearer Token: " + bearer }
  })
  .then(response => response.json())


export const PlantIdContextProvider: React.FunctionComponent<{ auction: Auction }> = ({ children, auction }) => {
  let { id, price, status } = auction;
  let [plantData, setPlantData] = useState<PlantData | undefined>(plantsMap.get(id))
  let [active, setActive] = useState<boolean | undefined>();
  let [autobuy, setAutobuy] = useState<boolean>(false);
  let [gains, setGains] = useState<number | undefined>();
  let { suggestPrice } = useContext(MarketplacePriceContext);
  let { bearer } = useContext(SettingsContext);
  useEffect(() => {
    if (plantData === undefined) {
      tokenContract.methods.getPlant(`0x${id}`).call({}).then(
        ({ plantId }: { plantId: string }) => {
          let info = infoPlantId(plantId);
          plantsMap.set(plantId, info);
          setPlantData(info)
          if (activeMap.has(info.id)) {
            setActive(activeMap.get(info.id))
          }
          let sp = suggestPrice(info.element, info.rarityType);
          let gains = sp[1] - parseFloat(fromWei(price))
          setGains(gains);
        }
      )
    }
  }, [])

  useEffect(() => {
    if (plantData !== undefined && active === undefined) {
      fetchCreator(plantData.id, bearer).then(
        ({ data }: { data: any }) => {
          let status = Object.keys(data).length > 0
          activeMap.set(plantData!.id, status);
          setActive(status)
        }
      )
    }
  }, [plantData])

  useEffect(() => {
    //autobuy
    if (plantData !== undefined && active === true && status === STATUS.OFFER) {
      if (gains! > .3)
        setAutobuy(true);
    }
  }, [plantData, active])

  return <PlantIdContext.Provider value={
    {
      plantData,
      active,
      autobuy,
      gains
    }} >
    {children}
  </PlantIdContext.Provider >
}