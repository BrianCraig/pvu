import React, { useEffect, useState } from 'react';
import { metamasknewHeadSubscribe } from '../eth/metamaksSubscription';
import { newHeadProcessed } from '../eth/subscribe';

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

    let subscription = metamasknewHeadSubscribe();
    subscription.onEvent((event) => {
      blocks.set(event.block, event);
      setUpdateValue(Math.random());
    })

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