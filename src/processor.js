import utils from './utils';
import config from '../config/config.js';
import logger from './logger'
const q = global.gConfig.tx_queue;


// processor is a polling service that will routinely pick transactions 
// from rabbitmq queue and process them to provide as input to the ciruit
export default class Processor {
  async start(poller) {
    logger.info("Starting transaction processor", { pollingInterval: poller.timeout })
    poller.poll()
    poller.onPoll(() => {
      logger.debug("Trying to fetch transactions from queue")
      // fetch max number of transactions | transactions available 
      fetchTxs()

      poller.poll(); // Go for the next poll
    });
  }
}
async function fetchTxs() {
  var conn = await utils.getConn();
  var ch = await conn.createChannel();
  var res = await ch.assertQueue(q, { durable: true });
  if (res.messageCount < 2) {
    console.log("less than 2 messages returning ")
    return
  }
  console.log("more than 2 messages here ")

  ch.prefetch(2);

  await ch.consume(q, msg => {
    console.log("received %v", msg.content.toString());
  });
  return;
}