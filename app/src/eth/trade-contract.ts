import { eth } from "./eth-instance";

import ABI from "./trade.json";

const address = "0x926eae99527a9503eadb4c9e927f21f84f20c977";

// @ts-ignore
export const tradeContract = new eth.Contract(ABI, address);
