import { useState, useEffect, useCallback, useContext } from "react";
import "./styles.css";
import { eth } from "./eth/eth-instance"
import { Button, Input, Table } from "semantic-ui-react";
import { formatDistanceToNow, differenceInSeconds } from "date-fns";
import { Auction, AuctionMap, HexaString, STATUS, TxLog, ZeroXHexaString } from "./types";
import { tradeContract } from "./eth/trade-contract";
import { PlantIdContext, PlantResolvingStatus } from "./context/PlantIdContext";
import { infoPlantId } from "./plants/plant-id-tools";
import { SettingsComponent } from "./components/Settings";
import { SettingsContext } from "./context/SettingsContext";
import { LogsContext, LogsContextProvider } from "./context/LogsContext";
import { cleanInt, roundAccurately, stringPrice } from "./utils";

const styleLink = document.createElement("link");
styleLink.rel = "stylesheet";
styleLink.href =
  "https://cdn.jsdelivr.net/npm/semantic-ui/dist/semantic.min.css";
document.head.appendChild(styleLink);

let myAddress: ZeroXHexaString;

const statusMap = {
  0: "Oferta",
  1: "Cancelado",
  2: "Comprado",
  3: "Otro?"
};

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
function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

const BuyButton = ({ tx }: { tx: Auction }) => {
  let oc = () => {
    tradeContract.methods
      .bid(`0x${tx.id}`, `0x${tx.price}`)
      .send({ from: eth.defaultAccount, gasPrice: 6e9, gas: 300000 });
  };
  return (
    <Button onClick={oc} primary disabled={tx.status !== STATUS.OFFER}>
      Comprar
    </Button>
  );
};

const PlantIdField = ({ auction }: { auction: Auction }) => {
  const { plantsMap, resolveId } = useContext(PlantIdContext);
  let plantQuery = plantsMap[auction.id]
  //infoPlantId
  if (plantQuery === undefined) {
    resolveId(auction.id)
    return <Table.Cell onClick={() => resolveId(auction.id)}>{cleanInt(auction.id)}</Table.Cell>
  }
  if (plantQuery.status === PlantResolvingStatus.Loading)
    return <Table.Cell>Cargando: {cleanInt(auction.id)}</Table.Cell>

  let { baseLE, element, hour, le, type, rarityType } = infoPlantId((plantQuery.value || 1000).toString())
  return <Table.Cell>{cleanInt(auction.id)}, {plantQuery.value}, {element}, {roundAccurately(le, 3)}LE per hour, {rarityType}</Table.Cell>

}

const DataTable = ({ data }: { data: Auction[] }) => (
  <Table>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>Precio</Table.HeaderCell>
        <Table.HeaderCell>ID</Table.HeaderCell>
        <Table.HeaderCell>Status</Table.HeaderCell>
        <Table.HeaderCell>Alias</Table.HeaderCell>
        <Table.HeaderCell>Accion</Table.HeaderCell>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {data.map((tx) => (
        <Table.Row key={tx.id}>
          <Table.Cell>{stringPrice(tx.price)}</Table.Cell>
          <PlantIdField auction={tx} />
          <Table.Cell>{statusMap[tx.status]}</Table.Cell>
          <Table.Cell>
            {differenceInSeconds(Date.now(), new Date(tx.timestamp * 1000))}s
          </Table.Cell>
          <Table.Cell>
            <BuyButton tx={tx} />
          </Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  </Table>
);



export const Data = () => {
  const { logs } = useContext(LogsContext);
  const { lessThan, minutes, filterOpen } = useContext(SettingsContext);
  const tablaData = Object.values(logs)
    .filter((tx) => parseFloat(lessThan) > cleanInt(tx.price) * 1e-18)
    .filter(
      (tx) =>
        parseFloat(minutes) >=
        differenceInSeconds(Date.now(), new Date(tx.timestamp * 1000)) / 60
    )
    .filter((tx) => (filterOpen ? tx.status === STATUS.OFFER : true));
  tablaData.sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div>
      <SettingsComponent />
      <DataTable data={tablaData} />
    </div>
  );
};

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
    return <LogsContextProvider block={block}><Data /></LogsContextProvider>;
  }
  return <p>loading</p>;
};
