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
// const genPath = path.join(__dirname, "../../config/genesis.json");


var conn = null;

// use existing connection is available
// else create new conn
async function getConn() {
  try{
    if (conn === null) {
      conn = await amqp.connect(global.gConfig.amqp_url);
    }
    console.log("conn._eventsCount", conn._eventsCount)
    return conn;
  } catch(err){
    console.error
    return;
  }

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
