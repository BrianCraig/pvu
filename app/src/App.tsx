import { useState, useEffect } from "react";
import "./styles.css";
import { eth } from "./eth/eth-instance"
import { LogsContextProvider } from "./context/LogsContext";
import { AppLayout } from "./components/AppLayout";
import { BlockContextProvider } from "./context/BlockContext";

const start = async (): Promise<void> => {
  let accounts;
  // @ts-ignore
  if (window.ethereum) {
    // @ts-ignore
    window.web3 = eth;
    // @ts-ignore
    accounts = await window.ethereum.request({ method: 'eth_accounts' });
  }
  eth.defaultAccount = accounts[0];
}

export const App = () => {
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    async function startEngines() {
      await start()
      setReady(true);
    }
    startEngines();
    return () => { };
  }, []);
  if (ready) {
    return <BlockContextProvider>
      <LogsContextProvider>
        <AppLayout />
      </LogsContextProvider>
    </BlockContextProvider>;
  }
  return <p>loading</p>;
};
