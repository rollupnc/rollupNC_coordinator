import utils from './utils';
import config from '../config/config.js';
import logger from './logger';
import createProof from './circuit';
const q = global.gConfig.tx_queue;
const maxTxs = global.gConfig.txs_per_snark;

// processor is a polling service that will routinely pick transactions 
// from rabbitmq queue and process them to provide as input to the ciruit
export default class Processor {
  async start(poller) {
    logger.info("starting transaction processor", { pollingInterval: poller.timeout })
    poller.poll()
    poller.onPoll(() => {
      // fetch max number of transactions | transactions available 
      fetchTxs()
      poller.poll(); // Go for the next poll
    });
  }
}

async function fetchTxs() {
  let txs = []
  let conn = await utils.getConn();
  let ch = await conn.createChannel();
  let res = await ch.assertQueue(q, { durable: true });

  // if queue doest contain enough transactions wait for more 
  // TODO if transactions in queue dont increase for `X` time
  // force create snark with existing transactions 
  if (res.messageCount <= maxTxs) {
    logger.debug("waiting for more transactions to accumulate", { txCount: res.messageCount })
    return
  }
  logger.debug("consuming transactions from queue", { txCount: res.messageCount })

  // fetch max amount of possible transactions 
  ch.prefetch(maxTxs);
  await ch.consume(q, msg => {
    txs.push(msg.content)
    logger.info("successfully consumed message", { tx: msg.content.toString() });
    ch.ack(msg)
  });
  console.log("transactions", txs)

  // create snark proof for transactions 
  createProof(txs)
  return;
}