import { useState, useEffect } from "react";
import "./styles.css";
import { eth } from "./eth/eth-instance"
import { ZeroXHexaString } from "./types";
import { LogsContextProvider } from "./context/LogsContext";
import { AppLayout } from "./components/AppLayout";

let myAddress: ZeroXHexaString;

const start = async (): Promise<string> => {
  // @ts-ignore
  if (window.ethereum) {
    // @ts-ignore
    window.web3 = eth;
    // @ts-ignore
    await window.ethereum.enable();
  }
  const currentBlock = await eth.getBlockNumber();
  myAddress =
    (await eth.getAccounts())[0];
  eth.defaultAccount = myAddress;
  return currentBlock.toString();
}
/*
function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
*/

/*
useEffect(() => {
    let llBlock = 0;
    let llIndex = 0;

    let subscription = eth.subscribe('logs', {
      address: '0x926eae99527a9503eadb4c9e927f21f84f20c977'
    });

    subscription.on("data", (data) => {

      if (data.blockNumber < llBlock || data.blockNumber < llBlock) {
        console.log(`shit ${data.blockNumber} < ${llBlock} || ${data.blockNumber} < ${llBlock}`)
      } else {
        console.log("ok")
      }
      llBlock = data.blockNumber;
      llIndex = data.logIndex;
    })

    return () => {
      subscription.unsubscribe(function (error, success) {
        if (success)
          console.log('Successfully unsubscribed!');
      });
    }
  }, []);
*/

export const App = () => {
  const [block, setBlock] = useState<string>("");

  useEffect(() => {
    async function startEngines() {
      setBlock(await start());
    }
    startEngines();
    return () => { };
  }, []);
  if (block) {
    return <LogsContextProvider block={block}><AppLayout /></LogsContextProvider>;
  }
  return <p>loading</p>;
};
