import { eth } from "./eth-instance";

import ABI from "./pvu.json";

const address = "0x31471e0791fcdbe82fbf4c44943255e923f1b794";

// @ts-ignore
export const pvuContract = new eth.Contract(ABI, address);
