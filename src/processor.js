import utils from './utils';
import config from '../config/config.js';
import logger from './logger';
import createProof from './circuit';
import db from './db';

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

// pick max transactions from mempool 
// provide to snark
// TODO:
// 1. Sort and select by fee 
// 2. Wait for X interval for max transactions to accumulate, 
//    after X create proof for available txs

async function fetchTxs() {
  // TODO if number of rows in table > req txs
  var txs = await db.getMaxTxs()
  logger.info("fetched transactions from mempool", {
    count: txs.length,
  })
  if (txs.length <= 0) {
    return
  }
  var transactions = Array()
  // sanitise the transactions for proof 
  // TODO remove after POC 
  txs.forEach(async (tx) => {
    var transaction = {}
    transaction["fromX"] = tx.fromX
    transaction["fromY"] = tx.fromY
    transaction["fromIndex"] = await db.getIndex(tx.fromX, tx.fromY)
    transaction["toX"] = tx.toX
    transaction["toY"] = tx.toY
    transaction["toIndex"] = await db.getIndex(tx.toX, tx.toY)
    transaction["nonce"] = tx.nonce;
    transaction["amount"] = tx.amount
    transaction["tokenType"] = tx.tokenType
    transaction["signature"] = utils.toSignature(tx.R1, tx.R2, tx.S)
    transactions.push(transaction)
  });
  // console.log("accounts here", await db.getAllAccounts())
  createProof(transactions)
  return;
}