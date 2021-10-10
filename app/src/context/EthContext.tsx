import React, { useEffect, useState } from 'react';
import { eth } from '../eth/eth-instance';
import { tradeContract } from '../eth/trade-contract';
import { Auction } from '../types';

interface EthContextInterface {
  priv: string,
  setPriv: (priv: string) => void
  bid: (auction: Auction) => void
}

export const EthContext = React.createContext<EthContextInterface>({
  priv: "",
  setPriv: (priv: string) => { },
  bid: (auction: Auction) => { }
});

export const EthContextProvider: React.FunctionComponent = ({ children }) => {
  let [priv, setPriv] = useState<string>("");
  useEffect(() => {
    console.log(setPriv)
  })
  const bid = async (auction: Auction) => {
    if (priv === "") {
      tradeContract.methods
        .bid(`0x${auction.id}`, `0x${auction.price}`)
        .send({ from: eth.defaultAccount, gasPrice: 6e9, gas: 300000 });
    } else {
      let tx = await eth.accounts.signTransaction({
        from: eth.defaultAccount!,
        to: "0x926eae99527a9503eadb4c9e927f21f84f20c977",
        gasPrice: 6e9,
        gas: 300000,
        data: tradeContract.methods.bid(`0x${auction.id}`, `0x${auction.price}`).encodeABI()
      }, priv)
      eth.sendSignedTransaction(tx.rawTransaction!);
    }
  }
  return <EthContext.Provider value={{
    priv, setPriv, bid
  }} >
    {children}
  </EthContext.Provider >
}