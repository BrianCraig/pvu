import React, { useContext, useEffect, useState } from 'react';
import { eth } from '../eth/eth-instance';
import { EthSubscription, logProcessed } from '../eth/subscribe';
import { tradeContract } from '../eth/trade-contract';
import { wsLogsSubscribe } from '../eth/wsSubscription';
import { AuctionMap, HexaString, STATUS } from '../types';
import { boughtDig, cancelDig, cleanInt, existsId, getTopic, offerDig } from '../utils';
import { SettingsContext } from './SettingsContext';


interface LogsContextInterface {
  logs: AuctionMap
}

export const LogsContext = React.createContext<LogsContextInterface>({
  logs: {}
});

export const LogsContextProvider: React.FunctionComponent = ({ children }) => {
  const [data] = useState<AuctionMap>({});
  let [updateValue, setUpdateValue] = useState<number>(0);
  let [boughtList, setBoughtList] = useState<HexaString[]>([]);

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
    //eslint-disable-next-line
  }, []);

  /**
  useEffect(() => {
    if (useAutobuy) {
      let autobuyMaxInt = parseFloat(autobuyMax) * 1e18;
      let autobuyMinInt = parseFloat(autobuyMin) * 1e18;
      Object.values(data).forEach((tx) => {
        if (
          cleanInt(tx.price) > autobuyMaxInt ||
          cleanInt(tx.price) < autobuyMinInt ||
          tx.status !== STATUS.OFFER ||
          boughtList.includes(tx.id)
        ) {
          return;
        }
        // eslint-disable-next-line 
        boughtList = [...boughtList, tx.id];
        tradeContract.methods
          .bid(`0x${tx.id}`, `0x${tx.price}`)
          .send({ from: eth.defaultAccount, gasPrice: 6e9, gas: 300000 });
        console.log(
          `Comprando planta ${cleanInt(tx.id)} a ${cleanInt(tx.price) * 1e-18
          }`
        );
      });
    }
    setBoughtList(boughtList);
  }, [updateValue, boughtList, autobuyMin, autobuyMax, useAutobuy]);
  */
  return <LogsContext.Provider value={
    {
      logs: data
    }} >
    {children}
  </LogsContext.Provider >
}