import { AuctionMap, HexaString, STATUS, TxLog } from "./types";

const topicMap: { [key: string]: STATUS } = {
  "0xa9c8dfcda5664a5a124c713e386da27de87432d5b668e79458501eb296389ba7":
    STATUS.OFFER,
  "0x2809c7e17bf978fbc7194c0a694b638c4215e9140cacc6c38ca36010b45697df":
    STATUS.CANCELLED,
  "0x4fcc30d90a842164dd58501ab874a101a3749c3d4747139cefe7c876f4ccebd2":
    STATUS.BOUGHT
};

export const getTopic = (tx: TxLog) => {
  let topic = topicMap[tx.topics[0]];
  if (topic === undefined) return STATUS.OTHER;
  return topic;
};

export const versionFromTx = (tx: TxLog) => ({
  block: tx.blockNumber,
  index: tx.logIndex
});

export const newerThan = (tx: TxLog, id: HexaString, data: AuctionMap) => {
  let { block, index } = data[id].version;
  if (block < tx.blockNumber) {
    return true;
  }
  return tx.logIndex > index;
};

export const existsId = (id: HexaString, data: AuctionMap) => {
  return data[id] !== undefined;
};

export const hexaDigest = (str: string, index: number, size = 1024, padding = 2) =>
  str.substring(padding + index * size, padding + (index + 1) * size);

export const offerDig = (tx: TxLog) => ({
  id: hexaDigest(tx.data, 0, 64),
  price: hexaDigest(tx.data, 1, 64)
});

export const cancelDig = (tx: TxLog) => ({
  id: hexaDigest(tx.data, 0, 64)
});
export const boughtDig = (tx: TxLog) => ({
  id: hexaDigest(tx.data, 0, 64)
});

export const roundAccurately = (number: number, decimalPlaces: number) =>
  Math.round(number * (decimalPlaces * 10)) / (decimalPlaces * 10)

export const cleanInt = (str: string, padding = 0) =>
  parseInt(hexaDigest(str, 0, 1024, padding), 16);

export const stringPrice = (str: string) => roundAccurately(cleanInt(str) * 1e-18, 3);

export const timestampFromTx = (tx: TxLog) => cleanInt(tx.timeStamp, 2);