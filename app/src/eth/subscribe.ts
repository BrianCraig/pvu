export interface EthSubscription<X> {
  onEvent: (callback: ((event: X) => void)) => void
  stop: () => void
}

export interface newHeadProcessed {
  block: number,
  timestamp: Date
}

export interface logProcessed {
  id: string,
  block: number,
  topic: string,
  data: string,
  timestamp?: Date
}

