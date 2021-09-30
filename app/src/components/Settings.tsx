import { useContext } from "react"
import { Button, Input } from "semantic-ui-react"
import { SettingsContext } from "../context/SettingsContext"

export const SettingsComponent = () => {
  const {
    lessThan,
    setLessThan,
    minutes,
    setMinutes,
    filterOpen,
    toggleFilterOpen,
    every,
    setEvery,
    autobuyMax,
    setAutobuyMax,
    autobuyMin,
    setAutobuyMin,
    useAutobuy,
    toggleAutobuy
  } = useContext(SettingsContext);
  return <>
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
      onClick={toggleFilterOpen}>
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
      onChange={(event) => setAutobuyMax(event.target.value || "0.0")}
      value={autobuyMax}
      placeholder="AutoBuy Max"
    />
    <Button primary={useAutobuy} onClick={toggleAutobuy}>
      Autobuy Activo
    </Button>
  </>
}