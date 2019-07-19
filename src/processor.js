import utils from "./helpers/utils";
import config from "../config/config.js";
import logger from "./helpers/logger";
import db from "./db/db";
import Transaction from "./models/transaction";

// processor is a polling service that will routinely pick transactions
// from rabbitmq queue and process them to provide as input to the ciruit
export default class Processor {
  async start(poller) {
    logger.info("starting transaction processor", {
      pollingInterval: poller.timeout
    });
    poller.poll();
    poller.onPoll(() => {
      // fetch max number of transactions | transactions available
      fetchTxs();
      poller.poll(); // Go for the next poll
    });
  }
}

// pick max transactions from mempool
// provide to snark
// TODO:
// 1. Sort and select by fee
// 2. Wait for X interval for max transactions to accumulate,
//    after X create proof for available txs

async function fetchTxs() {
  // TODO if number of rows in table > req txs
  var txs = await db.getMaxTxs();
  logger.info("fetched transactions from mempool", {
    count: txs.length
  });
  if (txs.length > 0) {
    var paddedTxs = pad(txs)
  }
  return;
}

// genEmptyTx generates empty transactions for coordinator
// i.e transaction from and to coordinator
function genEmptyTxs(count) {
  var txs = [];
  initialNonce = db.getCoordinatorNonce();
  pubkey = global.gConfig.pubkey;
  for (var i = 0; i < count; i++) {
    let tx = new Transaction(
      pubKey[0],
      pubKey[1],
      0,
      pubKey[0],
      pubKey[1],
      initialNonce + i,
      0,
      0
    );

    tx.sign(global.gConfig.prvkey);
    tx.addIndex();
    txs.push(tx);
    db.incrementCoordinatorNonce(1);
  }
}

// pads exisitng tx array with more tx's from and to coordinator account
// in order to fill up the circuit inputs
function pad(txs) {
  const maxLen = global.gConfig.txs_per_snark;
  if (txs.length > maxLen) {
    throw new Error(
      `Length of input array ${txs.length} is longer than max_length ${maxLen}`
    );
  }
  const numOfTxsToPad = maxLen - txs.length;
  var padTxs = genEmptyTxs(numOfTxsToPad);
  txs.push(padTxs);
  return txs;
}