import amqp from 'amqplib';
import mimcjs from '../circomlib/src/mimc7.js';
import eddsa from '../circomlib/src/eddsa.js';
import logger from './logger.js'
import account from "./snark_utils/generate_accounts.js"
import merkle from "./snark_utils/MiMCMerkle.js"
import balance from "./snark_utils/generate_balance_leaf.js"
import tx from "./snark_utils/generate_tx_leaf.js"
import update from "./snark_utils/update.js"
import Transaction from './transaction.js';
const {stringifyBigInts, unstringifyBigInts} = require('./snark_utils/stringifybigint.js')
// const websnark = require('./snark_utils/websnark.js')
const snarkHelper = require('./snark_utils/snark_helper.js')
const circuit = require('../snark/circuit.json')

import path from 'path'
import Promise from 'bluebird';
import db from './db.js';
const fs = Promise.promisifyAll(require('fs'));

const bigInt = require("snarkjs").bigInt;

const TX_DEPTH = global.gConfig.tx_depth;
const BAL_DEPTH = global.gConfig.balance_depth;
const genPath = path.join(__dirname, '../config/genesis.json')

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
  console.log('trying to hash',
  [
    fromX.toString(),
    fromY.toString(),
    toX.toString(),
    toY.toString(),
    'nonce', nonce.toString(),
    amount.toString(),
    token.toString()
    // bigInt(fromX), 
    // bigInt(fromY), 
    // bigInt(toX), 
    // bigInt(toY), 
    // bigInt(nonce),
    // bigInt(amount), 
    // bigInt(token)
  ])
  var leafHash = mimcjs.multiHash([
    fromX.toString(),
    fromY.toString(),
    toX.toString(),
    toY.toString(),
    nonce.toString(),
    amount.toString(),
    token.toString()
    // bigInt(fromX), 
    // bigInt(fromY), 
    // bigInt(toX), 
    // bigInt(toY), 
    // bigInt(nonce),
    // bigInt(amount), 
    // bigInt(token)
  ])
  return leafHash
}

function checkSignature(tx, fromX, fromY, signature) {
  return eddsa.verifyMiMC(tx, signature,
    [bigInt(fromX), bigInt(fromY)])
}


function toSignature(R1, R2, S) {
  var sig = {
    "R8": [R1, R2],
    "S": S
  }
  // logger.debug("conversion to SIG(obj) successfull", { sig: sig })
  return sig
}

async function getTransactionArray(txs) {
  var fromX = new Array()
  var fromY = new Array()
  var fromIndices = new Array()
  var toX = new Array()
  var toY = new Array()
  var toIndices = new Array()
  var nonces = new Array()
  var tokenTypes = new Array()
  var amounts = new Array()
  var signatures = new Array()
  // logger.debug("Prepping inputs to snark for given transactions")
  // txs = txs[0]
  for (var i = 0; i < txs.length; i++) {
    // logger.debug("traversing", { index: i, len: txs.length, transaction: txs[i] })
    fromX.push(txs[i].fromX)
    fromY.push(txs[i].fromY)
    fromIndices.push(txs[i].fromIndex)
    toX.push(txs[i].toX)
    toY.push(txs[i].toY)
    toIndices.push(txs[i].toIndex)
    // collect nonces
    nonces.push(txs[i].nonce)
    // collect amounts
    amounts.push(txs[i].amount)
    // collect token types
    tokenTypes.push(txs[i].tokenType)
    // collect sigs
    signatures.push(txs[i].signature)
  }
  console.log('===========================================================================================fromIndices', fromIndices)
  console.log('toIndices', toIndices)
  return [
    fromX, fromY, fromIndices, toX, toY, toIndices, 
    nonces, tokenTypes, signatures, amounts
  ]
}

async function prepTxs(txs) {
  var [
    fromX, fromY, fromIndices, toX, toY, toIndices, 
    nonces, tokenTypes, signatures, amounts
  ] = await getTransactionArray(txs)
  const txArray = await tx.generateTxLeafArray(fromX, fromY, toX, toY, nonces, amounts, tokenTypes)

  var accountsArray = await db.getAllAccounts()
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
  )
  // console.log("input generated", inputs)
  // const witness = snarkHelper.calculateWitness(circuit, inputs)
  // websnark.genZKSnarkProof(witness, provingKey).then((p)=> {
  //   this.p = p
  //   console.log(p)
  //   var call = snarkHelper.generateCall(p)
  //   console.log("call", call)            
  // })
}

// async function prepTxs(txs) {
//   var fromX = new Array()
//   var fromY = new Array()
//   var toX = new Array()
//   var toY = new Array()
//   var tokenTypes = new Array()
//   var nonces = new Array()
//   var amounts = new Array()
//   var signatures = new Array()
//   logger.debug("Prepping inputs to snark for given transactions")
//   // txs = txs[0]
//   for (var i = 0; i < txs.length; i++) {
//     logger.debug("traversing", { index: i, len: txs.length, transaction: txs[i] })
//     fromX.push(txs[i].fromX)
//     fromY.push(txs[i].fromY)

//     toX.push(txs[i].toX)
//     toY.push(txs[i].toY)

//     // collect amounts 
//     amounts.push(txs[i].amount)
//     // collect token types
//     tokenTypes.push(txs[i].tokenType)
//     // collect sigs
//     signatures.push(txs[i].signature)
//   }
//   // logger.debug("We have the following arrays now", fromX, amounts, tokenTypes)
//   const txArray = tx.generateTxLeafArray(fromX, fromY, toX, toY, amounts, tokenTypes)
//   console.log("&&&& txarra", txArray)
//   const txLeafHashes = tx.hashTxLeafArray(txArray)
//   console.log("***txleafArray", txLeafHashes)
//   const txTree = merkle.treeFromLeafArray(txLeafHashes)

//   const txProofs = new Array(2 ** TX_DEPTH)
//   for (var jj = 0; jj < 2 ** TX_DEPTH; jj++) {
//     txProofs[jj] = merkle.getProof(jj, txTree, txLeafHashes)
//   }
//   // TODO move balance leaf array generation DB based
//   const token_types = [0, 10, 10, 10];
//   const balances = [0, 1000, 0, 0];
//   nonces = [0, 0, 0, 0];
//   // getAllAccounts
//   var accountsArray = await db.getAllAccounts()


//   // when adding deposit user will be assigned a leaf 
//   // id will be stored in DB (hardcode for now, till things work)
//   var from_accounts_idx = [1, 2, 1, 3]
//   var to_accounts_idx = [2, 0, 3, 2]

//   console.log("sending data",
//     "txdepth", TX_DEPTH,
//     "pubkeys", fromX, fromY, toX, toY,
//     "balanceLeafArray", accountsArray,
//     "fromAccount", from_accounts_idx,
//     "toaccount", to_accounts_idx,
//     "amounts", amounts,
//     "txTokenType", token_types,
//     "signature", signatures,
//   )
//   const inputs = update.processTxArray(
//     TX_DEPTH,
//     fromX,
//     fromY,
//     toX,
//     toY,
//     accountsArray,
//     from_accounts_idx,
//     to_accounts_idx,
//     amounts,
//     token_types,
//     signatures
//   )
//   console.log("input generated", inputs)

// }

// returns index array of account from given array of accounts


// convert from JSON transaction to transaction object
function JSON2Tx(data) {
  var txData = JSON.parse(data)[0]
  return new Transaction(txData.fromX, txData.fromY, txData.toX,
    txData.toY, txData.nonce, txData.amount, txData.tokenType, 
    txData.R1, txData.R2, txData.S)
}

// read genesis file 
async function readGenesis() {
  var contents = await fs.readFileSync(genPath)
  var genesisJSON = JSON.parse(contents)
  return genesisJSON;
}

export default {
  getConn,
  conn,
  toMultiHash,
  checkSignature,
  prepTxs,
  JSON2Tx,
  readGenesis,
  toSignature

}
