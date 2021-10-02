import { BlockHeader } from "web3-eth";
import { Auction, AuctionMap, HexaString, STATUS, TxLog } from "./types";

const topicMap: { [key: string]: STATUS } = {
  "0xa9c8dfcda5664a5a124c713e386da27de87432d5b668e79458501eb296389ba7":
    STATUS.OFFER,
  "0x2809c7e17bf978fbc7194c0a694b638c4215e9140cacc6c38ca36010b45697df":
    STATUS.CANCELLED,
  "0x4fcc30d90a842164dd58501ab874a101a3749c3d4747139cefe7c876f4ccebd2":
    STATUS.BOUGHT
};

interface Log {
  address: string;
  data: string;
  topics: string[];
  logIndex: number;
  transactionIndex: number;
  transactionHash: string;
  blockHash: string;
  blockNumber: number;
}

export const getTopic = (tx: Log) => {
  let topic = topicMap[tx.topics[0]];
  if (topic === undefined) return STATUS.OTHER;
  return topic;
};

export const versionFromTx = (tx: Log) => ({
  block: tx.blockNumber,
  index: tx.logIndex
});

export const existsId = (id: HexaString, data: AuctionMap) => {
  return data[id] !== undefined;
};

export const hexaDigest = (str: string, index: number, size = 1024, padding = 2) =>
  str.substring(padding + index * size, padding + (index + 1) * size);

export const offerDig = (tx: Log) => ({
  id: hexaDigest(tx.data, 0, 64),
  price: hexaDigest(tx.data, 1, 64)
});

export const cancelDig = (tx: Log) => ({
  id: hexaDigest(tx.data, 0, 64)
});
export const boughtDig = (tx: Log) => ({
  id: hexaDigest(tx.data, 0, 64)
});

export const roundAccurately = (number: number, decimalPlaces: number) =>
  number.toFixed(decimalPlaces)

export const cleanInt = (str: string, padding = 0) =>
  parseInt(hexaDigest(str, 0, 1024, padding), 16);

export const stringPrice = (str: string) => roundAccurately(cleanInt(str) * 1e-18, 3);

export const getAuctionTimestamp = (auction: Auction, blocks: Map<number, BlockHeader>): number => {
  let info = blocks.get(auction.block);
  if (info === undefined) {
    return Date.now().valueOf();
  }
  if (typeof info.timestamp === "string") {
    return parseInt(info.timestamp, 10) * 1000;
  }
  return info.timestamp * 1000;
}

export const getAuctionDate = (auction: Auction, blocks: Map<number, BlockHeader>): Date =>
  new Date(getAuctionTimestamp(auction, blocks));
export const timestampFromTx = (tx: TxLog) => cleanInt(tx.timeStamp, 2);