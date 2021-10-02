import { differenceInSeconds } from "date-fns";
import { useContext } from "react";
import { Card } from "semantic-ui-react"
import { LogsContext } from "../context/LogsContext";
import { SettingsContext } from "../context/SettingsContext";
import { STATUS } from "../types";
import { cleanInt } from "../utils";
import { PlantComponent } from "./Plant"

export const PlantsList = () => {
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
  return <div style={{ margin: "10px" }}>
    <Card.Group>
      {tablaData.map(auction => <PlantComponent auction={auction} key={auction.id} />)}
    </Card.Group>
  </div>
}