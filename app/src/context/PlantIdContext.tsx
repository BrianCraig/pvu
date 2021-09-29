import React, { useCallback, useState } from 'react';
import { tokenContract } from '../eth/token-contract';

export enum PlantResolvingStatus {
  Loading,
  Loaded
}

interface PlantIdStatus {
  status: PlantResolvingStatus,
  value?: number
}

interface PlantIdContextInterface {
  plantsMap: { [key: string]: PlantIdStatus },
  resolveId: (id: string) => void
}

export const PlantIdContext = React.createContext<PlantIdContextInterface>({
  plantsMap: {},
  resolveId: () => { }
});

export const PlantIdContextProvider: React.FunctionComponent = ({ children }) => {
  const [plantsMap, setPlantsMap] = useState<{ [key: string]: PlantIdStatus }>({});
  const resolveId = useCallback((id: string) => {
    setPlantsMap((ori) => ({ ...ori, [id]: { status: PlantResolvingStatus.Loading } }))
    tokenContract.methods.getPlant(`0x${id}`).call({}).then(
      ({ plantId }: { plantId: string }) =>
        setPlantsMap((ori) => ({ ...ori, [id]: { status: PlantResolvingStatus.Loaded, value: parseInt(plantId) } }))
    )
  }, []);

  return <PlantIdContext.Provider value={
    {
      plantsMap,
      resolveId
    }} >
    {children}
  </PlantIdContext.Provider >
}