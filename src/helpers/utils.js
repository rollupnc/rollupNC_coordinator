import amqp from "amqplib";
import Account from "../models/account.js";
import AccountTree from "../models/accountTree.js";
import Transaction from "../models/transaction.js";
import TxTree from "../models/txTree.js";
import path from "path";
import Promise from "bluebird";
const fs = Promise.promisifyAll(require("fs"));

const TX_DEPTH = global.gConfig.tx_depth;
const BAL_DEPTH = global.gConfig.balance_depth;

// TODO move genesis file path to config
const genPath = path.join(__dirname, "../../config/preset-genesis.json");

var conn = null;

// use existing connection is available
// else create new conn
async function getConn() {
  if (conn === null) {
    conn = await amqp.connect(global.gConfig.amqp);
  }
  return conn;
}

async function getTxArray(txs) {
  // logger.debug("Prepping inputs to snark for given transactions")

  for (tx in txs) {
    var txArray = Array();
    var tx = txs[i];
    var leaf = new Transaction(
      tx.fromX,
      tx.fromY,
      tx.fromIndex,
      tx.toX,
      tx.toY,
      tx.nonce,
      tx.amount,
      tx.tokenType,
      tx.R8x,
      tx.R8y,
      tx.S
    )
    // logger.debug("traversing", { index: i, len: txs.length, transaction: txs[i] })
    txArray.push(leaf)
  }
  return txArray
}

// convert from JSON transaction to transaction object
function JSON2Tx(data) {
  var txData = JSON.parse(data)[0];
  return new Transaction(
    txData.fromX,
    txData.fromY,
    txData.fromIndex,
    txData.toX,
    txData.toY,
    txData.toIndex,
    txData.nonce,
    txData.amount,
    txData.tokenType,
    txData.R8x,
    txData.R8y,
    txData.S
  );
}

// read genesis file
async function readGenesis() {
  var contents = await fs.readFileSync(genPath);
  var genesisJSON = JSON.parse(contents);
  return genesisJSON;
}


export default {
  getConn,
  conn,
  JSON2Tx,
  readGenesis
};
