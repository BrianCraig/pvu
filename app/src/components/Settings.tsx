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