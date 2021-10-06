import React, { useEffect, useState } from 'react';
import { EthSubscription, newHeadProcessed } from '../eth/subscribe';
import { wsNewHeadSubscribe } from '../eth/wsSubscription';

interface BlockContextInterface {
  blocks: Map<number, newHeadProcessed>,
  updateValue: number
}

export const BlockContext = React.createContext<BlockContextInterface>({
  blocks: new Map(),
  updateValue: 0
});

export const BlockContextProvider: React.FunctionComponent = ({ children }) => {
  let [blocks] = useState(new Map<number, newHeadProcessed>());
  let [updateValue, setUpdateValue] = useState<number>(0);

  useEffect(() => {
    let subscription: EthSubscription<newHeadProcessed>;
    const eff = async () => {
      let subscription = await wsNewHeadSubscribe();
      subscription.onEvent((event) => {
        blocks.set(event.block, event);
        setUpdateValue(Math.random());
      })
    }
    eff();
    return () => {
      subscription.stop();
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