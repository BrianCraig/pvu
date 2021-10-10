import React, { useEffect, useState } from 'react';
import { EthSubscription, logProcessed } from '../eth/subscribe';
import { wsLogsSubscribe } from '../eth/wsSubscription';
import { AuctionMap, STATUS } from '../types';
import { boughtDig, cancelDig, existsId, getTopic, offerDig } from '../utils';


interface LogsContextInterface {
  logs: AuctionMap
}

export const LogsContext = React.createContext<LogsContextInterface>({
  logs: {}
});

export const LogsContextProvider: React.FunctionComponent = ({ children }) => {
  const [data] = useState<AuctionMap>({});
  let [updateValue, setUpdateValue] = useState<number>(0);

  useEffect(() => {
    let subscription: EthSubscription<logProcessed>;
    const eff = async () => {
      subscription = await wsLogsSubscribe();
      subscription.onEvent((tx) => {
        if (getTopic(tx) === STATUS.OFFER) {
          let dig = offerDig(tx);
          data[dig.id] = {
            id: dig.id,
            tx: tx.id,
            price: dig.price,
            block: tx.block,
            status: STATUS.OFFER
          };
        } else if (getTopic(tx) === STATUS.BOUGHT) {
          let dig = boughtDig(tx);
          if (!existsId(dig.id, data)) {
            return;
          }
          data[dig.id] = {
            ...data[dig.id],
            endBlock: tx.block,
            status: STATUS.BOUGHT
          };
        } else if (getTopic(tx) === STATUS.CANCELLED) {
          let dig = cancelDig(tx);
          if (!existsId(dig.id, data)) {
            return;
          }
          data[dig.id] = {
            ...data[dig.id],
            endBlock: tx.block,
            status: STATUS.CANCELLED
          };
        }
        setUpdateValue(Math.random());
      })
    }
    eff();
    return () => {
      subscription.stop();
    }
  }, []);
  return <LogsContext.Provider value={
    {
      logs: data
    }} >
    {children}
  </LogsContext.Provider >
}