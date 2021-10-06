import { eth } from "./eth-instance";
import { EthSubscription, logProcessed, newHeadProcessed } from "./subscribe";
import { hexToNumber } from "web3-utils";

export const metamaskLogsSubscribe = (): EthSubscription<logProcessed> => {
  let subscription = eth.subscribe('logs', { address: '0x926eae99527a9503eadb4c9e927f21f84f20c977' });
  return {
    onEvent: (e => {
      subscription.on("data", (tx) => {
        e(({
          id: tx.transactionHash,
          block: tx.blockNumber,
          topic: tx.topics[0],
          data: tx.data
        }))
      })
    }),
    stop: () => {
      subscription.unsubscribe();
    }
  }
}

export const metamasknewHeadSubscribe = (): EthSubscription<newHeadProcessed> => {
  let subscription = eth.subscribe('newBlockHeaders');
  return {
    onEvent: (e => {
      subscription.on("data", (tx) => {
        let timestamp = (typeof tx.timestamp === "string") ? hexToNumber(tx.timestamp) : tx.timestamp;
        e(({
          block: tx.number,
          timestamp: new Date(timestamp * 1000)
        }))
      })
    }),
    stop: () => {
      subscription.unsubscribe();
    }
  }
}