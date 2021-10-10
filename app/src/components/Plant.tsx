import { useContext, useEffect, useState } from 'react'
import { differenceInSeconds } from 'date-fns'
import { Button, Card, Label, Icon } from 'semantic-ui-react'
import { fromWei } from "web3-utils";
import { PlantIdContext } from '../context/PlantIdContext'
import { Auction, STATUS } from '../types'
import { getAuctionDate, getAuctionEndDate, roundAccurately, stringPrice } from '../utils'
import "./plant.css"
import { eth } from '../eth/eth-instance'
import { tradeContract } from '../eth/trade-contract'
import { PlantData, PlantElements } from '../plants/plant-types'
import { BlockContext } from '../context/BlockContext'
import { newHeadProcessed } from '../eth/subscribe'
import { SemanticCOLORS } from 'semantic-ui-react/dist/commonjs/generic'
import { MarketplacePriceContext } from '../context/MarketplacePriceContext'

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

const PlantIdAliveQueryComponent: React.FunctionComponent<{ id: string }> = ({ id }) => {
  const { active } = useContext(PlantIdContext);
  let color: SemanticCOLORS = "grey"
  if (active === true) color = "green"
  if (active === false) color = "red"

  return <Label color={color} onClick={() => window.open(`https://marketplace.plantvsundead.com/farm#/plant/${id}`, '_blank')!.focus()}>
    {id}
  </Label>
}

const PlantIdLabelsComponent: React.FunctionComponent<{ auction: Auction }> = ({ auction }) => {
  const { plantData } = useContext(PlantIdContext);
  return <>
    <Label color='purple'>
      <Icon name='cogs' /> {roundAccurately(plantData!.le, 3)}
    </Label>
    <Label style={{ backgroundColor: elementsUI[plantData!.element].elementColor, color: "white" }}>
      {plantData!.element}
    </Label>
    <Label style={{ backgroundColor: plantData!.rarityColor, color: "white" }}>
      {plantData!.rarityType}
    </Label>
    <PlantIdAliveQueryComponent id={plantData!.id} />
    <MarketPriceLabelComponent plantData={plantData!} price={auction.price} />
  </>
}

export const PlantTimeComponent: React.FunctionComponent<{ auction: Auction, blocks: Map<number, newHeadProcessed> }> = ({ auction, blocks }) => {
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

const statusMap: { [key in STATUS]: string } = {
  0: "Buy",
  1: "Canceled",
  2: "Bougth",
  3: "Wtf ??"
};

const MarketPriceLabelComponent: React.FunctionComponent<{ plantData: PlantData, price: string }> = ({ plantData, price }) => {
  let { suggestPrice } = useContext(MarketplacePriceContext);
  let sp = suggestPrice(plantData.element, plantData.rarityType);
  let gains = sp[1] - parseFloat(fromWei(price))
  return <Label color={gains > 0.3 ? "purple" : "grey"}>
    {`${gains.toFixed(3)} ${sp[0]}`}
  </Label>
}


export const PlantComponent: React.FunctionComponent<{ auction: Auction }> = ({ auction }) => {
  const { plantData, active, autobuy, gains } = useContext(PlantIdContext)
  let oc = () => {
    tradeContract.methods
      .bid(`0x${auction.id}`, `0x${auction.price}`)
      .send({ from: eth.defaultAccount, gasPrice: 6e9, gas: 300000 });
  };
  let { blocks } = useContext(BlockContext);
  if (plantData === undefined) return null;
  if (gains! < -1.5) return null;
  return (
    <Card raised={autobuy}>
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
          <Button onClick={oc} primary fluid disabled={auction.status !== STATUS.OFFER || active === false}>
            {statusMap[auction.status]}
            {auction.endBlock ? ` ${auction.endBlock - auction.block} blocks` : null}
          </Button>
        </div>
      </Card.Content>
    </Card>
  )
}
