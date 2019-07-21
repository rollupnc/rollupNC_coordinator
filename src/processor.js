import utils from "./helpers/utils";
import config from "../config/config.js";
import logger from "./helpers/logger";
import txTable from "./db/txTable"
import accountTable from "./db/accountTable"
import Transaction from "./models/transaction";
import TxTree from "./models/txTree";
import AccountTree from "./models/accountTree";

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
      processTxs();
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

async function processTxs() {
  // TODO if number of rows in table > req txs
  var txs = await txTable.getMaxTxs();
  logger.info("fetched transactions from mempool", {
    count: await txs.length
  });
  if (await txs.length > 0) {
    var paddedTxs = await pad(txs)
    console.log(
      'paddedTxs', paddedTxs.length,
      paddedTxs
    )
    // var txTree = new TxTree(paddedTxs)
    // var accounts = accountTable.getAllAccounts()
    // var accountTree = new AccountTree(accounts)
    // var stateTransition = accountTree.processTxArray(txTree)
    // var inputs = getCircuitInput(stateTransition)
  }
  return;
}


// pads existing tx array with more tx's from and to coordinator account
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
  console.log(
    "=======================",
    "len padded txs",
    padTxs.length,
    "==============================="
  )
  return txs;
}

// genEmptyTx generates empty transactions for coordinator
// i.e transaction from and to coordinator
async function genEmptyTxs(count) {
  var txs = [];
  var initialNonce = await accountTable.getCoordinatorNonce();
  const pubkey = global.gConfig.pubkey;
  for (var i = 0; i < count; i++) {
    let tx = new Transaction(
      pubkey[0],
      pubkey[1],
      1, //fromIndex,
      pubkey[0],
      pubkey[1],
      1, //toIndex
      initialNonce + i,
      0, //amount
      0 //tokenType
    );
    tx.sign(global.gConfig.prvkey);
    txs.push(tx);
    console.log("emptyTx", i)
    await accountTable.incrementCoordinatorNonce();
  }
}