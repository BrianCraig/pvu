import { useState, useEffect, useCallback, useContext } from "react";
import "./styles.css";
import { eth } from "./eth/eth-instance"
import { Button, Input, Table } from "semantic-ui-react";
import { formatDistanceToNow, differenceInSeconds } from "date-fns";
import { Auction, AuctionMap, HexaString, STATUS, TxLog, ZeroXHexaString } from "./types";
import { tradeContract } from "./eth/trade-contract";
import { PlantIdContext, PlantResolvingStatus } from "./context/PlantIdContext";
import { infoPlantId } from "./plants/plant-id-tools";

const useToggle = (initialState = false): [boolean, () => void] => {
  const [state, setState] = useState(initialState);
  const toggle = useCallback(() => setState((state) => !state), []);
  return [state, toggle];
};

const styleLink = document.createElement("link");
styleLink.rel = "stylesheet";
styleLink.href =
  "https://cdn.jsdelivr.net/npm/semantic-ui/dist/semantic.min.css";
document.head.appendChild(styleLink);

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
  return currentBlock.toString();
}
function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

const statusMap = {
  0: "Oferta",
  1: "Cancelado",
  2: "Comprado",
  3: "Otro?"
};

const topicMap: { [key: string]: STATUS } = {
  "0xa9c8dfcda5664a5a124c713e386da27de87432d5b668e79458501eb296389ba7":
    STATUS.OFFER,
  "0x2809c7e17bf978fbc7194c0a694b638c4215e9140cacc6c38ca36010b45697df":
    STATUS.CANCELLED,
  "0x4fcc30d90a842164dd58501ab874a101a3749c3d4747139cefe7c876f4ccebd2":
    STATUS.BOUGHT
};

const getTopic = (tx: TxLog) => {
  let topic = topicMap[tx.topics[0]];
  if (topic === undefined) return STATUS.OTHER;
  return topic;
};

const BuyButton = ({ tx, address }: { tx: Auction, address: ZeroXHexaString }) => {
  let oc = () => {
    tradeContract.methods
      .bid(`0x${tx.id}`, `0x${tx.price}`)
      .send({ from: address, gasPrice: 6e9, gas: 300000 });
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
  if (plantQuery === undefined)
    return <Table.Cell onClick={() => resolveId(auction.id)}>{cleanInt(auction.id)}</Table.Cell>
  if (plantQuery.status === PlantResolvingStatus.Loading)
    return <Table.Cell>Cargando: {cleanInt(auction.id)}</Table.Cell>

  let { baseLE, element, hour, le, type, rarityType } = infoPlantId((plantQuery.value || 1000).toString())
  return <Table.Cell>{cleanInt(auction.id)}, {plantQuery.value}, {element}, {roundAccurately(le, 3)}LE per hour, {rarityType}</Table.Cell>

}

const DataTable = ({ data, address }: { data: Auction[], address: ZeroXHexaString }) => (
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
            <BuyButton tx={tx} address={address} />
          </Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  </Table>
);

const versionFromTx = (tx: TxLog) => ({
  block: tx.blockNumber,
  index: tx.logIndex
});

const newerThan = (tx: TxLog, id: HexaString, data: AuctionMap) => {
  let { block, index } = data[id].version;
  if (block < tx.blockNumber) {
    return true;
  }
  return tx.logIndex > index;
};

const existsId = (id: HexaString, data: AuctionMap) => {
  return data[id] !== undefined;
};

const hexaDigest = (str: string, index: number, size = 1024, padding = 2) =>
  str.substring(padding + index * size, padding + (index + 1) * size);

const offerDig = (tx: TxLog) => ({
  id: hexaDigest(tx.data, 0, 64),
  price: hexaDigest(tx.data, 1, 64)
});

const cancelDig = (tx: TxLog) => ({
  id: hexaDigest(tx.data, 0, 64)
});
const boughtDig = (tx: TxLog) => ({
  id: hexaDigest(tx.data, 0, 64)
});

const roundAccurately = (number: number, decimalPlaces: number) =>
  // @ts-ignore
  Number(Math.round(number + "e" + decimalPlaces) + "e-" + decimalPlaces);

const cleanInt = (str: string, padding = 0) =>
  parseInt(hexaDigest(str, 0, 1024, padding), 16);

const stringPrice = (str: string) => roundAccurately(cleanInt(str) * 1e-18, 3);

const timestampFromTx = (tx: TxLog) => cleanInt(tx.timeStamp, 2);

export const Data = ({ block }: { block: string }) => {
  const [data, setData] = useState<AuctionMap>({});
  const [lastBlock, setLastBlock] = useState(block);
  const [redo, setRedo] = useState("");
  const [address, setAddress] = useState(myAddress);
  const [lessThan, setLessThan] = useState("40.01");
  const [minutes, setMinutes] = useState("1");
  const [filterOpen, filterToggle] = useToggle(false);
  const [every, setEvery] = useState("1");
  const [autobuy, setAutobuy] = useState("");
  const [autobuyMin, setAutobuyMin] = useState("");
  const [useAutobuy, setUseAutobuy] = useToggle(false);
  let [boughtList, setBoughtList] = useState<HexaString[]>([]);

  useEffect(() => {
    let timer1 = setInterval(
      () => setRedo(Math.random().toString()),
      parseFloat(every) * 1000
    );

    return () => {
      clearInterval(timer1);
    };
  }, [every]);

  const fetchit = useCallback(() => {
    async function prom() {
      const status = await fetch(
        `https://api.bscscan.com/api?module=logs&topic=0xa9c8dfcda5664a5a124c713e386da27de87432d5b668e79458501eb296389ba7&action=getLogs&fromBlock=${lastBlock}&address=0x926eae99527a9503eadb4c9e927f21f84f20c977&apikey=P67BZE8I9G868EPWH1WZVBVISBIYBEXM3J`
      );
      let datito = (await status.json()).result;
      if (!datito.filter) {
        return () => { };
      }
      datito.reverse();
      datito.forEach((tx: TxLog) => {
        if (getTopic(tx) === STATUS.OFFER) {
          let dig = offerDig(tx);
          if (existsId(dig.id, data) && !newerThan(tx, dig.id, data)) {
            return;
          }
          data[dig.id] = {
            id: dig.id,
            tx: tx.transactionHash,
            version: versionFromTx(tx),
            price: dig.price,
            timestamp: timestampFromTx(tx),
            status: STATUS.OFFER
          };
        } else if (getTopic(tx) === STATUS.BOUGHT) {
          let dig = boughtDig(tx);
          if (!existsId(dig.id, data) || !newerThan(tx, dig.id, data)) {
            return;
          }
          data[dig.id] = {
            ...data[dig.id],
            version: versionFromTx(tx),
            endTimestamp: timestampFromTx(tx),
            status: STATUS.BOUGHT
          };
        } else if (getTopic(tx) === STATUS.CANCELLED) {
          let dig = cancelDig(tx);
          if (!existsId(dig.id, data) || !newerThan(tx, dig.id, data)) {
            return;
          }
          data[dig.id] = {
            ...data[dig.id],
            version: versionFromTx(tx),
            endTimestamp: timestampFromTx(tx),
            status: STATUS.CANCELLED
          };
        }
      });

      if (datito.length) {
        setLastBlock(
          (parseInt(hexaDigest(datito[0].blockNumber, 0), 16) - 5).toString()
        );
      }
      if (useAutobuy) {
        let autobuyMaxInt = parseFloat(autobuy) * 1e18;
        let autobuyMinInt = parseFloat(autobuyMin) * 1e18;
        Object.values(data).forEach((tx) => {
          if (
            cleanInt(tx.price) > autobuyMaxInt ||
            cleanInt(tx.price) < autobuyMinInt ||
            tx.status !== STATUS.OFFER ||
            boughtList.includes(tx.id)
          ) {
            return;
          }
          boughtList = [...boughtList, tx.id];
          tradeContract.methods
            .bid(`0x${tx.id}`, `0x${tx.price}`)
            .send({ from: address, gasPrice: 6e9, gas: 300000 });
          console.log(
            `Comprando planta ${cleanInt(tx.id)} a ${cleanInt(tx.price) * 1e-18
            }`
          );
        });
      }

      setBoughtList(boughtList);
      setData({ ...data });
    }

    prom();
  }, [data, lastBlock, boughtList, autobuy, address]);

  useEffect(() => {
    fetchit();
  }, [redo]);

  const tablaData = Object.values(data)
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
      <span>Address: </span>
      <Input
        className={"smallinput"}
        onChange={(event) => setAddress(event.target.value)}
        value={address}
        placeholder="Address"
      />
      <span> price: </span>
      <Input
        className={"smallinput"}
        onChange={(event) => setLessThan(event.target.value)}
        value={lessThan}
        placeholder="Precio"
      />
      <span> minutes: </span>
      <Input
        className={"smallinput"}
        onChange={(event) => setMinutes(event.target.value)}
        value={minutes}
        placeholder="Minutos"
      />
      <span> </span>
      <Button
        primary={filterOpen}
        onClick={filterToggle}>
        Abiertos
      </Button>

      <span>refreshRate every: </span>
      <Input
        className={"smallinput"}
        onChange={(event) => setEvery(event.target.value)}
        value={every}
        placeholder="refresh rate"
      />
      <span> Autobuy: </span>
      <Input
        className={"smallinput"}
        onChange={(event) => setAutobuyMin(event.target.value || "0.0")}
        value={autobuyMin}
        placeholder="AutoBuy Min"
      />
      <Input
        className={"smallinput"}
        onChange={(event) => setAutobuy(event.target.value || "0.0")}
        value={autobuy}
        placeholder="AutoBuy Max"
      />
      <Button primary={useAutobuy} onClick={setUseAutobuy}>
        Autobuy Activo
      </Button>
      <DataTable data={tablaData} address={address} />
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
    return <Data block={block} />;
  }
  return <p>loading</p>;
};
