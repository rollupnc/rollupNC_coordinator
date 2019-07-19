import amqp from "amqplib";
import mimcjs from "../../circomlib/src/mimc7.js";
import eddsa from "../../circomlib/src/eddsa.js";
import tx from "../snark_utils/generate_tx_leaf.js";
import update from "../snark_utils/update.js";
import Transaction from "../models/transaction.js";
import path from "path";
import Promise from "bluebird";
import db from "../db.js";
const fs = Promise.promisifyAll(require("fs"));

const bigInt = require("snarkjs").bigInt;

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

// convert a leaf to multiHash hash
function toMultiHash(fromX, fromY, toX, toY, nonce, amount, token) {
  var leafHash = mimcjs.multiHash([
    fromX.toString(),
    fromY.toString(),
    toX.toString(),
    toY.toString(),
    nonce.toString(),
    amount.toString(),
    token.toString()
  ]);
  return leafHash;
}

function checkSignature(tx, fromX, fromY, signature) {
  return eddsa.verifyMiMC(tx, signature, [bigInt(fromX), bigInt(fromY)]);
}

function toSignature(R1, R2, S) {
  var sig = {
    R8: [R1, R2],
    S: S
  };
  // logger.debug("conversion to SIG(obj) successfull", { sig: sig })
  return sig;
}

async function getTransactionArray(txs) {
  var fromX = new Array();
  var fromY = new Array();
  var fromIndices = new Array();
  var toX = new Array();
  var toY = new Array();
  var toIndices = new Array();
  var nonces = new Array();
  var tokenTypes = new Array();
  var amounts = new Array();
  var signatures = new Array();
  // logger.debug("Prepping inputs to snark for given transactions")
  // txs = txs[0]
  for (var i = 0; i < txs.length; i++) {
    // logger.debug("traversing", { index: i, len: txs.length, transaction: txs[i] })
    fromX.push(txs[i].fromX);
    fromY.push(txs[i].fromY);
    fromIndices.push(txs[i].fromIndex);
    toX.push(txs[i].toX);
    toY.push(txs[i].toY);
    toIndices.push(txs[i].toIndex);
    // collect nonces
    nonces.push(txs[i].nonce);
    // collect amounts
    amounts.push(txs[i].amount);
    // collect token types
    tokenTypes.push(txs[i].tokenType);
    // collect sigs
    signatures.push(txs[i].signature);
  }
  return [
    fromX,
    fromY,
    fromIndices,
    toX,
    toY,
    toIndices,
    nonces,
    tokenTypes,
    signatures,
    amounts
  ];
}

async function prepTxs(txs) {
  var [
    fromX,
    fromY,
    fromIndices,
    toX,
    toY,
    toIndices,
    nonces,
    tokenTypes,
    signatures,
    amounts
  ] = await getTransactionArray(txs);

  const txArray = await tx.generateTxLeafArray(
    fromX,
    fromY,
    toX,
    toY,
    nonces,
    amounts,
    tokenTypes
  );

  var accountsArray = await db.getAllAccounts();
  const inputs = update.processTxArray(
    TX_DEPTH,
    fromX,
    fromY,
    toX,
    toY,
    nonces,
    accountsArray,
    fromIndices,
    toIndices,
    amounts,
    tokenTypes,
    signatures
  );
  // console.log("input generated", inputs)
  // const witness = snarkHelper.calculateWitness(circuit, inputs)
  // websnark.genZKSnarkProof(witness, provingKey).then((p)=> {
  //   this.p = p
  //   console.log(p)
  //   var call = snarkHelper.generateCall(p)
  //   console.log("call", call)
  // })
}

// convert from JSON transaction to transaction object
function JSON2Tx(data) {
  var txData = JSON.parse(data)[0];
  return new Transaction(
    txData.fromX,
    txData.fromY,
    txData.toX,
    txData.toY,
    txData.nonce,
    txData.amount,
    txData.tokenType,
    txData.R1,
    txData.R2,
    txData.S
  );
}

// read genesis file
async function readGenesis() {
  var contents = await fs.readFileSync(genPath);
  var genesisJSON = JSON.parse(contents);
  return genesisJSON;
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

export default {
  getConn,
  conn,
  toMultiHash,
  checkSignature,
  prepTxs,
  JSON2Tx,
  readGenesis,
  toSignature,
  pad
};
