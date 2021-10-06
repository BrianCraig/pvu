import { newHeadProcessed, logProcessed } from "./eth/subscribe";
import { Auction, AuctionMap, HexaString, STATUS } from "./types";

const topicMap: { [key: string]: STATUS } = {
  "0xa9c8dfcda5664a5a124c713e386da27de87432d5b668e79458501eb296389ba7":
    STATUS.OFFER,
  "0x2809c7e17bf978fbc7194c0a694b638c4215e9140cacc6c38ca36010b45697df":
    STATUS.CANCELLED,
  "0x4fcc30d90a842164dd58501ab874a101a3749c3d4747139cefe7c876f4ccebd2":
    STATUS.BOUGHT
};

export const getTopic = (tx: logProcessed) => {
  let topic = topicMap[tx.topic];
  if (topic === undefined) return STATUS.OTHER;
  return topic;
};

export const existsId = (id: HexaString, data: AuctionMap) => {
  return data[id] !== undefined;
};

export const hexaDigest = (str: string, index: number, size = 1024, padding = 2) =>
  str.substring(padding + index * size, padding + (index + 1) * size);

export const offerDig = (tx: logProcessed) => ({
  id: hexaDigest(tx.data, 0, 64),
  price: hexaDigest(tx.data, 1, 64)
});

export const cancelDig = (tx: logProcessed) => ({
  id: hexaDigest(tx.data, 0, 64)
});
export const boughtDig = (tx: logProcessed) => ({
  id: hexaDigest(tx.data, 0, 64)
});

export const roundAccurately = (number: number, decimalPlaces: number) =>
  number.toFixed(decimalPlaces)

export const cleanInt = (str: string, padding = 0) =>
  parseInt(hexaDigest(str, 0, 1024, padding), 16);

export const stringPrice = (str: string) => roundAccurately(cleanInt(str) * 1e-18, 3);

export const getAuctionDate = (auction: Auction, blocks: Map<number, newHeadProcessed>): Date => {
  let info = blocks.get(auction.block);
  return info ? info.timestamp : new Date();;
}

export const getAuctionEndDate = (auction: Auction, blocks: Map<number, newHeadProcessed>): Date => {
  if (auction.endBlock === undefined) return new Date()
  let info = blocks.get(auction.endBlock);
  return info ? info.timestamp : new Date();;
}