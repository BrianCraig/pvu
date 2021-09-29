import { eth } from "./eth-instance";

import ABI from "./token.json";

const address = "0x5ab19e7091dd208f352f8e727b6dcc6f8abb6275";

// @ts-ignore
export const tokenContract = new eth.Contract(ABI, address);