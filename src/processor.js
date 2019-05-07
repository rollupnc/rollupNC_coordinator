import processTx from './process_tx'

// processor is a polling service that will routinely pick transactions 
// from rabbitmq queue and process them to provide as input to the ciruit
export default class Processor {
  constructor() { }
  async start() {
    while (1) {
      setTimeout(() => { console.log("fetching transactions from queue") }, 1000)
      processTx.fetchTxs()
    }
  }
}