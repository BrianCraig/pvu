export enum STATUS {
  OFFER,
  CANCELLED,
  BOUGHT,
  OTHER
};

/**
 * Hexadecimal string ex: "0fax"
 */
export type HexaString = string;

/**
 * Hexadecimal string ex: "0x0fax"
 */
export type ZeroXHexaString = string;

export interface Auction {
  id: HexaString,
  tx: HexaString,
  price: HexaString,
  block: number,
  endBlock?: number,
  status: STATUS
};

export type AuctionMap = { [key: string]: Auction }

export interface TxLog {
  address: ZeroXHexaString,
  topics: [
    ZeroXHexaString
  ],
  data:
  ZeroXHexaString, blockNumber: ZeroXHexaString,
  timeStamp: ZeroXHexaString,
  gasPrice: ZeroXHexaString,
  gasUsed: ZeroXHexaString,
  logIndex: ZeroXHexaString,
  transactionHash:
  ZeroXHexaString,
  transactionIndex: ZeroXHexaString
}