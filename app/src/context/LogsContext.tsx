import React, { useCallback, useContext, useEffect, useState } from 'react';
import { eth } from '../eth/eth-instance';
import { tradeContract } from '../eth/trade-contract';
import { AuctionMap, HexaString, STATUS, TxLog } from '../types';
import { boughtDig, cancelDig, cleanInt, existsId, getTopic, hexaDigest, newerThan, offerDig, timestampFromTx, versionFromTx } from '../utils';
import { SettingsContext } from './SettingsContext';


interface LogsContextInterface {
  logs: AuctionMap
}

export const LogsContext = React.createContext<LogsContextInterface>({
  logs: {}
});

export const LogsContextProvider: React.FunctionComponent<{ block: string }> = ({ children, block }) => {
  const [data, setData] = useState<AuctionMap>({});
  const [lastBlock, setLastBlock] = useState(block);
  const [redo, setRedo] = useState("");
  const {
    every,
    autobuyMax,
    autobuyMin,
    useAutobuy
  } = useContext(SettingsContext);
  let [boughtList, setBoughtList] = useState<HexaString[]>([]);

  useEffect(() => {
    let timer1 = setInterval(
      () => setRedo(Math.random().toString()),
      parseFloat(every) * 1000
    );

    return () => {
      clearInterval(timer1);
    };
  }, [every]);

  const fetchit = useCallback(() => {
    async function prom() {
      const status = await fetch(
        `https://api.bscscan.com/api?module=logs&topic=0xa9c8dfcda5664a5a124c713e386da27de87432d5b668e79458501eb296389ba7&action=getLogs&fromBlock=${lastBlock}&address=0x926eae99527a9503eadb4c9e927f21f84f20c977&apikey=P67BZE8I9G868EPWH1WZVBVISBIYBEXM3J`
      );
      let datito = (await status.json()).result;
      if (!datito.filter) {
        return () => { };
      }
      datito.reverse();
      datito.forEach((tx: TxLog) => {
        if (getTopic(tx) === STATUS.OFFER) {
          let dig = offerDig(tx);
          if (existsId(dig.id, data) && !newerThan(tx, dig.id, data)) {
            return;
          }
          data[dig.id] = {
            id: dig.id,
            tx: tx.transactionHash,
            version: versionFromTx(tx),
            price: dig.price,
            timestamp: timestampFromTx(tx),
            status: STATUS.OFFER
          };
        } else if (getTopic(tx) === STATUS.BOUGHT) {
          let dig = boughtDig(tx);
          if (!existsId(dig.id, data) || !newerThan(tx, dig.id, data)) {
            return;
          }
          data[dig.id] = {
            ...data[dig.id],
            version: versionFromTx(tx),
            endTimestamp: timestampFromTx(tx),
            status: STATUS.BOUGHT
          };
        } else if (getTopic(tx) === STATUS.CANCELLED) {
          let dig = cancelDig(tx);
          if (!existsId(dig.id, data) || !newerThan(tx, dig.id, data)) {
            return;
          }
          data[dig.id] = {
            ...data[dig.id],
            version: versionFromTx(tx),
            endTimestamp: timestampFromTx(tx),
            status: STATUS.CANCELLED
          };
        }
      });

      if (datito.length) {
        setLastBlock(
          (parseInt(hexaDigest(datito[0].blockNumber, 0), 16) - 5).toString()
        );
      }
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
      setData({ ...data });
    }

    prom();
  }, [data, lastBlock, boughtList, autobuyMax]);

  useEffect(() => {
    fetchit();
  }, [redo]);

  return <LogsContext.Provider value={
    {
      logs: data
    }} >
    {children}
  </LogsContext.Provider >
}