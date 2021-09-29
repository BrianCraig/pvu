import { useState, useEffect, useCallback } from "react";
import "./styles.css";
import ABI from "./abi.json";
import pvuABI from "./pvu.json";
import { Button, Input, Table } from "semantic-ui-react";
import Eth from "web3-eth";
import { formatDistanceToNow, differenceInSeconds } from "date-fns";

const useToggle = (initialState = false) => {
  const [state, setState] = useState(initialState);
  const toggle = useCallback(() => setState((state) => !state), []);

  return [state, toggle];
};

const styleLink = document.createElement("link");
styleLink.rel = "stylesheet";
styleLink.href =
  "https://cdn.jsdelivr.net/npm/semantic-ui/dist/semantic.min.css";
document.head.appendChild(styleLink);

// "Eth.providers.givenProvider" will be set if in an Ethereum supported browser.
var eth = new Eth(Eth.givenProvider || "ws://some.local-or-remote.node:8546");

const contractOn = "0x926eae99527a9503eadb4c9e927f21f84f20c977";

const pvuContractOn = "0x31471e0791fcdbe82fbf4c44943255e923f1b794";

let contract = new eth.Contract(ABI, contractOn);

let myAddress;

let pvuContract = new eth.Contract(pvuABI, pvuContractOn);

async function start() {
  if (window.ethereum) {
    window.web3 = eth;
    await window.ethereum.enable();
  }
  const currentBlock = await eth.getBlockNumber();
  myAddress =
    (await eth.getAccounts())[0] ||
    "0xD077F2C29F6f00108Ed30025dbD71b0284B914aa";
  return currentBlock;
}
function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

const dataExample = {
  address: "0x926eae99527a9503eadb4c9e927f21f84f20c977",
  topics: [
    "0xa9c8dfcda5664a5a124c713e386da27de87432d5b668e79458501eb296389ba7"
  ],
  data:
    "0x00000000000000000000000000000000000000000000000000000000000c595d00000000000000000000000000000000000000000000000402f4cfee62e8000000000000000000000000000000000000000000000000000402f4cfee62e800000000000000000000000000000000000000000000000000000000018fdaeaf644",
  blockNumber: "0xaa8185",
  timeStamp: "0x614ce27d",
  gasPrice: "0x12a05f200",
  gasUsed: "0x29680",
  logIndex: "0x133",
  transactionHash:
    "0xea0647922495966ecad723104f888c553b0407bedfce20fb757e3459208058ad",
  transactionIndex: "0x6a"
};

const STATUS = {
  OFFER: 0,
  CANCELLED: 1,
  BOUGHT: 2,
  OTHER: 3
};

const statusMap = {
  0: "Oferta",
  1: "Cancelado",
  2: "Comprado",
  3: "Otro?"
};

const auctionExample = {
  id: "0af3",
  tx: "fac1",
  version: {
    block: "0fa1",
    index: "a10a"
  },
  price: "0f1a",
  timestamp: 10000,
  endTimestamp: 10001,
  status: STATUS.BOUGHT
};

const topicMap = {
  "0xa9c8dfcda5664a5a124c713e386da27de87432d5b668e79458501eb296389ba7":
    STATUS.OFFER,
  "0x2809c7e17bf978fbc7194c0a694b638c4215e9140cacc6c38ca36010b45697df":
    STATUS.CANCELLED,
  "0x4fcc30d90a842164dd58501ab874a101a3749c3d4747139cefe7c876f4ccebd2":
    STATUS.BOUGHT
};

const getTopic = (tx) => {
  let topic = topicMap[tx.topics[0]];
  if (topic === undefined) return STATUS.OTHER;
  return topic;
};

const BuyButton = ({ tx, address }) => {
  let oc = () => {
    contract.methods
      .bid(`0x${tx.id}`, `0x${tx.price}`)
      .send({ from: address, gasPrice: 6e9, gas: 300000 });
  };
  return (
    <Button onClick={oc} primary disabled={tx.status !== STATUS.OFFER}>
      Comprar
    </Button>
  );
};

/* const openLink = () => {
  contract.methods.p.call().then(
    console.log
  )
  window.open(`https://marketplace.plantvsundead.com/offering/bundle#/plant/${}`, '_blank').focus();}
  */

const DataTable = ({ data, address }) => (
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
          <Table.Cell>{cleanInt(tx.id)}</Table.Cell>
          <Table.Cell>{statusMap[tx.status]}</Table.Cell>
          <Table.Cell>
            {formatDistanceToNow(new Date(tx.timestamp * 1000), {
              includeSeconds: true
            })}
          </Table.Cell>
          <Table.Cell>
            <BuyButton tx={tx} address={address} />
          </Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  </Table>
);

const versionFromTx = (tx) => ({
  block: tx.blockNumber,
  index: tx.logIndex
});

const newerThan = (tx, id, data) => {
  let { block, index } = data[id].version;
  if (block < tx.blockNumber) {
    return true;
  }
  return tx.logIndex > index;
};

const existsId = (id, data) => {
  return data[id] !== undefined;
};

const hexaDigest = (str, index, size = 1024, padding = 2) =>
  str.substring(padding + index * size, padding + (index + 1) * size);

const offerDig = (tx) => ({
  id: hexaDigest(tx.data, 0, 64),
  price: hexaDigest(tx.data, 1, 64)
});

const cancelDig = (tx) => ({
  id: hexaDigest(tx.data, 0, 64)
});
const boughtDig = (tx) => ({
  id: hexaDigest(tx.data, 0, 64)
});

const roundAccurately = (number, decimalPlaces) =>
  Number(Math.round(number + "e" + decimalPlaces) + "e-" + decimalPlaces);

const cleanInt = (str, padding = 0) =>
  parseInt(hexaDigest(str, 0, 1024, padding), 16);

const stringPrice = (str) => roundAccurately(cleanInt(str) * 1e-18, 3);

const timestampFromTx = (tx) => cleanInt(tx.timeStamp, 2);

export const Data = ({ block }) => {
  const [data, setData] = useState({});
  const [lastBlock, setLastBlock] = useState(block);
  const [redo, setRedo] = useState("");
  const [address, setAddress] = useState(myAddress);
  const [lessThan, setLessThan] = useState("40.01");
  const [minutes, setMinutes] = useState("1");
  const [filterOpen, filterToggle] = useToggle(false);
  const [every, setEvery] = useState("1");
  const [autobuy, setAutobuy] = useState("0.0");
  let [boughtList, setBoughtList] = useState([]);

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
      datito.forEach((tx) => {
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
      let autobuyInt = parseFloat(autobuy, 10) * 1e18;
      Object.values(data).forEach((tx) => {
        if (
          cleanInt(tx.price) > autobuyInt ||
          tx.status !== STATUS.OFFER ||
          boughtList.includes(tx.id)
        ) {
          return;
        }
        boughtList = [...boughtList, tx.id];
        contract.methods
          .bid(`0x${tx.id}`, `0x${tx.price}`)
          .send({ from: address, gasPrice: 6e9, gas: 300000 });
        console.log(
          `Comprando planta ${cleanInt(tx.id)} a ${cleanInt(tx.price) * 1e-18}`
        );
      });

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
        parseFloat(minutes, 10) >=
        differenceInSeconds(Date.now(), new Date(tx.timestamp * 1000)) / 60
    )
    .filter((tx) => (filterOpen ? tx.status === STATUS.OFFER : true));
  tablaData.sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div>
      <span>Address: </span>
      <Input
        onChange={(event) => setAddress(event.target.value)}
        value={address}
        placeholder="Address"
      />
      <span> price: </span>
      <Input
        onChange={(event) => setLessThan(event.target.value)}
        value={lessThan}
        placeholder="Precio"
      />
      <span> minutes: </span>
      <Input
        onChange={(event) => setMinutes(event.target.value)}
        value={minutes}
        placeholder="Minutos"
      />
      <span> </span>
      <Button primary={filterOpen} onClick={filterToggle}>
        Abiertos
      </Button>

      <span>refreshRate per second: </span>
      <Input
        onChange={(event) => setEvery(event.target.value)}
        value={every}
        placeholder="refresh rate"
      />
      <span> Autobuy: </span>
      <Input
        onChange={(event) => setAutobuy(event.target.value || "0.0")}
        value={autobuy}
        placeholder="AutoBuy"
      />
      <DataTable data={tablaData} address={address} />
    </div>
  );
};

export const App = () => {
  const [block, setBlock] = useState();

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
