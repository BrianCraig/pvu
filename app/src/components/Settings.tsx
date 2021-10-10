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
    bearer,
    setBearer,
    autobuyActive,
    toggleAutobuyActive,
    autobuyDifference,
    setAutobuyDifference
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
    <span> PVU Bearer:</span>
    <Input
      className={"smallinput"}
      onChange={(event) => setBearer(event.target.value)}
      value={bearer}
      placeholder="Bearer Token"
    />
    <Button
      primary={autobuyActive}
      onClick={toggleAutobuyActive}>
      Autobuy
    </Button>
    <Input
      className={"smallinput"}
      onChange={(event) => setAutobuyDifference(event.target.value)}
      value={autobuyDifference}
      placeholder="Autobuy difference"
    />
  </>
}