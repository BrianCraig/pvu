import React, { useEffect, useState } from 'react';
import { BlockHeader } from 'web3-eth';
import { eth } from '../eth/eth-instance';

interface BlockContextInterface {
  blocks: Map<number, BlockHeader>,
  updateValue: number
}

export const BlockContext = React.createContext<BlockContextInterface>({
  blocks: new Map(),
  updateValue: 0
});

export const BlockContextProvider: React.FunctionComponent = ({ children }) => {
  let [blocks] = useState(new Map<number, BlockHeader>());
  let [updateValue, setUpdateValue] = useState<number>(0);

  useEffect(() => {
    let subscription = eth.subscribe('newBlockHeaders');
    subscription.on("data", (data) => {
      blocks.set(data.number, data);
      setUpdateValue(Math.random());
    })

    return () => {
      subscription.unsubscribe();
    }
    //eslint-disable-next-line
  }, []);

  return <BlockContext.Provider value={{
    blocks,
    updateValue
  }} >
    {children}
  </BlockContext.Provider >
}