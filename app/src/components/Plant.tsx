import { useContext, useEffect, useState } from 'react'
import { differenceInSeconds } from 'date-fns'
import { Button, Card, Label, Icon } from 'semantic-ui-react'
import { PlantIdContext, PlantResolvingStatus } from '../context/PlantIdContext'
import { Auction, STATUS } from '../types'
import { getAuctionDate, getAuctionEndDate, roundAccurately, stringPrice } from '../utils'
import "./plant.css"
import { eth } from '../eth/eth-instance'
import { tradeContract } from '../eth/trade-contract'
import { PlantElements } from '../plants/plant-types'
import { BlockContext } from '../context/BlockContext'
import { BlockHeader } from 'web3-eth'

type PlantElementsUI = {
  [key in PlantElements]: {
    elementColor: string
    elementIcon: string
  }
}

let elementsUI: PlantElementsUI = {
  "Dark": {
    elementColor: "#5e4771",
    elementIcon: ""
  },
  "Electro": {
    elementColor: "#ba7a14",
    elementIcon: ""
  },
  "Fire": {
    elementColor: "#7e2121",
    elementIcon: ""
  },
  "Ice": {
    elementColor: "#00647a",
    elementIcon: ""
  },
  "Light": {
    elementColor: "#649cde",
    elementIcon: ""
  },
  "Metal": {
    elementColor: "#844903",
    elementIcon: ""
  },
  "Parasite": {
    elementColor: "#790b8b",
    elementIcon: ""
  },
  "Water": {
    elementColor: "#844903",
    elementIcon: ""
  },
  "Wind": {
    elementColor: "#236025",
    elementIcon: ""
  }
}


const PlantIdLabelsComponent: React.FunctionComponent<{ auction: Auction }> = ({ auction }) => {

  const { plantsMap, resolveId } = useContext(PlantIdContext);
  let plantQuery = plantsMap[auction.id]
  if (plantQuery === undefined) {
    resolveId(auction.id)
    return null;
  }
  if (plantQuery.status === PlantResolvingStatus.Loading || plantQuery.value === undefined)
    return null;
  return <>
    <Label color='purple'>
      <Icon name='cogs' /> {roundAccurately(plantQuery.value.le, 3)}
    </Label>
    <Label style={{ backgroundColor: elementsUI[plantQuery.value.element].elementColor, color: "white" }}>
      {plantQuery.value.element}
    </Label>
    <Label style={{ backgroundColor: plantQuery.value.rarityColor, color: "white" }}>
      {plantQuery.value.rarityType}
    </Label>
  </>
}

export const PlantTimeComponent: React.FunctionComponent<{ auction: Auction, blocks: Map<number, BlockHeader> }> = ({ auction, blocks }) => {
  //eslint-disable-next-line
  const [update, setUpdate] = useState<number>()
  useEffect(() => {
    let timer1 = setInterval(
      () => setUpdate(Math.random()), 1000
    );
    return () => {
      clearInterval(timer1);
    };
  }, []);
  return <Label >
    <Icon name='time' /> {differenceInSeconds(getAuctionEndDate(auction, blocks), getAuctionDate(auction, blocks))}s
  </Label>
}

export const PlantComponent: React.FunctionComponent<{ auction: Auction }> = ({ auction }) => {
  let oc = () => {
    tradeContract.methods
      .bid(`0x${auction.id}`, `0x${auction.price}`)
      .send({ from: eth.defaultAccount, gasPrice: 6e9, gas: 300000 });
  };
  let { blocks } = useContext(BlockContext);
  return (
    <Card>
      <Card.Content>
        <Card.Description className={"plantdescription"}>
          <Label color='green'>
            <Icon name='usd' /> {stringPrice(auction.price)}
          </Label>
          <PlantTimeComponent auction={auction} blocks={blocks} />
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
