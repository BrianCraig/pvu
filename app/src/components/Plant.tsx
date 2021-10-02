import { useContext } from 'react'
import { differenceInSeconds } from 'date-fns'
import { Button, Card, Label, Icon } from 'semantic-ui-react'
import { PlantIdContext, PlantResolvingStatus } from '../context/PlantIdContext'
import { Auction, STATUS } from '../types'
import { roundAccurately, stringPrice } from '../utils'
import "./plant.css"
import { infoPlantId } from '../plants/plant-id-tools'
import { eth } from '../eth/eth-instance'
import { tradeContract } from '../eth/trade-contract'

const PlantIdLabelsComponent: React.FunctionComponent<{ auction: Auction }> = ({ auction }) => {

  const { plantsMap, resolveId } = useContext(PlantIdContext);
  let plantQuery = plantsMap[auction.id]
  if (plantQuery === undefined) {
    resolveId(auction.id)
    return null;
  }
  if (plantQuery.status === PlantResolvingStatus.Loading)
    return null;

  let { baseLE, element, hour, le, type, rarityType } = infoPlantId((plantQuery.value || 1000).toString())
  return <>
    <Label color='orange'>
      <Icon name='cogs' /> {roundAccurately(le, 3)}
    </Label>
    <Label color='blue'>
      <Icon name='cube' /> {element}
    </Label>
    <Label>
      {rarityType}
    </Label>
  </>
}

export const PlantComponent: React.FunctionComponent<{ auction: Auction }> = ({ auction }) => {
  let oc = () => {
    tradeContract.methods
      .bid(`0x${auction.id}`, `0x${auction.price}`)
      .send({ from: eth.defaultAccount, gasPrice: 6e9, gas: 300000 });
  };
  return (
    <Card>
      <Card.Content>
        <Card.Description className={"plantdescription"}>
          <Label color='teal'>
            <Icon name='usd' /> {stringPrice(auction.price)}
          </Label>
          <Label >
            <Icon name='time' /> {differenceInSeconds(Date.now(), new Date(auction.timestamp * 1000))}s
          </Label>
          <PlantIdLabelsComponent auction={auction} />
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <div className='ui'>
          <Button onClick={oc} primary fluid disabled={auction.status !== STATUS.OFFER}>
            Buy
          </Button>
        </div>
      </Card.Content>
    </Card>
  )
}
