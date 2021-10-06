import { RequestManager, Client, WebSocketTransport } from "@open-rpc/client-js";
import { EthSubscription, logProcessed, newHeadProcessed } from "./subscribe";
import { hexToNumber } from "web3-utils";

const transport = new WebSocketTransport("wss://bsc-ws-node.nariox.org:443");
const requestManager = new RequestManager([transport]);
const client = new Client(requestManager);

interface RpcResponse {
  subscription: string, result: any
}

const subscriptions: { [key: string]: (e: any) => void } = {};
client.onNotification((e) => {
  let { subscription, result } = e.params as RpcResponse;
  if (subscriptions[subscription]) {
    subscriptions[subscription](result)
  } else {
    console.log("unhandled notification")
    console.log(e)
  };
})


export const wsLogsSubscribe = async (): Promise<EthSubscription<logProcessed>> => {
  const id = await client.request({ method: "eth_subscribe", params: ["logs", { address: "0x926eae99527a9503eadb4c9e927f21f84f20c977" }] })
  return {
    onEvent: (e => {
      subscriptions[id] = (tx) => {
        e({
          id: tx.transactionHash,
          block: hexToNumber(tx.blockNumber),
          topic: tx.topics[0],
          data: tx.data
        })
      }
    }),
    stop: () => {
      client.request({ method: "eth_unsubscribe", params: [id] })
      delete (subscriptions[id]);
    }
  }
}

export const wsNewHeadSubscribe = async (): Promise<EthSubscription<newHeadProcessed>> => {
  const id = await client.request({ method: "eth_subscribe", params: ["newHeads"] });
  return {
    onEvent: (e => {
      subscriptions[id] = (tx) => {
        e({
          block: hexToNumber(tx.number),
          timestamp: new Date(hexToNumber(tx.timestamp) * 1000)
        })
      }
    }),
    stop: () => {
      client.request({ method: "eth_unsubscribe", params: [id] })
      delete (subscriptions[id]);
    }
  }
}

/**
let x = {
  jsonrpc: '2.0',
  method: 'eth_subscription',
  params: {
    subscription: '0x897d9e802f82afd973a5ea85e084ba0d',
    result: {
      address: '0x926eae99527a9503eadb4c9e927f21f84f20c977',
      topics: ["0x"],
      data: '0x000000000000000000000000000000000000000000000000000000000004af38000000000000000000000000000000000000000000000000a688906bd8b00000000000000000000000000000000000000000000000000000a688906bd8b000000000000000000000000000000000000000000000000000000000019074f99a23',
      blockNumber: '0xb02aa9',
      transactionHash: '0x4fb69072c070a93e0b2c96ebeed35a144562fee585c35a0b866ad6e979b18378',
      transactionIndex: '0x82',
      blockHash: '0x4e0e1f286a13148376028a8bfa6ffcfa194eceb9bbc071e752d7115678fa5787',
      logIndex: '0xa5',
      removed: false
    }
  }
}

let y = {
  jsonrpc: '2.0',
  method: 'eth_subscription',
  params: {
    subscription: '0x996904a0b097f64754c6ba8ff95fef88',
    result: {
      parentHash: '0xf72e7fd8764ba53d7a036ae7fa9b09d782c80d0e429336d1697e88859567fd52',
      sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
      miner: '0x2d4c407bbe49438ed859fe965b140dcf1aab71a9',
      stateRoot: '0xb1fb7ef7d3b64f4890464812391bbe2c1c95ca7ffc38356b0f241cf51773a231',
      transactionsRoot: '0xdd99c2756447056c81baba91bba72855f14ac257de14a8ade3f3bc600f45ace2',
      receiptsRoot: '0x038bafc85204c994057f701c279278ebb2a316a16bb0d34c915d536c9b0455be',
      logsBloom: '0x3c70a7536f1cbab8c289e27cce1402ee793683006d0fecb8e3b3e3e8aebf71f39f0fda1d141ad3dbf7a15577e31dd14acd5197e53e5be197b0d7487a3426ceda3ebddfd51e44826d43a4f20ebe2225be6e9d1a6d14f66e6ebd9cc93a84f42928ccaff9a2e32ef32c96f1730e4a376973f65ab1dbba7ab7bce639b03198f97446bce978fc4d46c5cbe9d184dbbdf34b9c7bf4ce971d0ed9deb31fea457dd0dcf5f7df77dae05772006242716d9f37e4e947ee9df0dbb4de703779de338bd276dc572c0f6a94700b761ac6d31a6e3f5b07fb4b7bd875a7eb9d8671d0fe7236ea3dfd77dcc9fdc675d1012a062d3705135579ff6fbee58aa6687d60290f92daef44',
      difficulty: '0x2',
      number: '0xb02aa9',
      gasLimit: '0x50e8d6b',
      gasUsed: '0x266d5ed',
      timestamp: '0x615dfc82',
      extraData: '0xd883010102846765746888676f312e31362e33856c696e7578000000fc3ca6b7b938639e7f1689edc15a8c58a4aad7f4759f670eb7660c2009b55d74629f9f7c339f292573ac93e9aeb82f504d9fccbc569ba514792d6839d9efbd8b5023f43201',
      mixHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      nonce: '0x0000000000000000',
      hash: '0x4e0e1f286a13148376028a8bfa6ffcfa194eceb9bbc071e752d7115678fa5787'
    }
  }
}
*/