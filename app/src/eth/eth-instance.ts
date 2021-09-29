import Eth, { Eth as EthInterface } from "web3-eth";
// @ts-ignore
export const eth: EthInterface = new Eth(Eth.givenProvider || "ws://some.local-or-remote.node:8546");