import amqp from 'amqplib';
import mimcjs from '../circomlib/src/mimc7.js';
import eddsa from '../circomlib/src/eddsa.js';
import logger from './logger'

import account from "./snark_utils/generate_accounts.js"
import merkle from "./snark_utils/MiMCMerkle.js"
import balance from "./snark_utils/generate_balance_leaf.js"
import tx from "./snark_utils/generate_tx_leaf.js"
import update from "./snark_utils/update.js"
const bigInt = require("snarkjs").bigInt;

const TX_DEPTH = global.gConfig.tx_depth;
const BAL_DEPTH = global.gConfig.balance_depth;


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
function toMultiHash(fromX, fromY, toX, toY, amount, token) {
  var leafHash = mimcjs.multiHash([
    bigInt(fromX), bigInt(fromY), bigInt(toX), bigInt(toY), bigInt(amount), bigInt(token)
  ])
  return leafHash
}

function checkSignature(tx, fromX, fromY, signature) {
  return eddsa.verifyMiMC(tx, signature,
    [bigInt(fromX), bigInt(fromY)])
}

// function toSignature(signature) {
//   var sig = {
//     "R8": [BigInt.leBugg(signature.R8[0].toString())],
//     "S": BigInt(signature.S)
//   }
//   console.log("new sig", sig)
//   return
// }

function prepTxs(...txs) {
  var fromX = []
  var fromY = []
  var toX = []
  var toY = []
  var tokenTypes = []
  var nonces = []
  var amounts = []
  var signatures = []
  logger.debug("Prepping inputs to snark for given transactions")
  txs = txs[0]
  for (var i = 0; i < 4; i++) {

    logger.debug("traversing", { index: i, len: txs.length, transaction: txs[i] })
    fromX.push(txs[i].fromX)
    fromY.push(txs[i].fromY)

    toX.push(txs[i].toX)
    toY.push(txs[i].toY)

    // collect amounts 
    amounts.push(txs[i].amount)
    // collect token types
    tokenTypes.push(txs[i].tokenType)
    // collect sigs
    signatures.push(txs[i].signature)
  }
  logger.debug("We have the following arrays now", fromX, amounts, tokenTypes)
  const txArray = tx.generateTxLeafArray(fromX, fromY, toX, toY, amounts, tokenTypes)
  console.log("txarray is", txArray)
  const txLeafHashes = tx.hashTxLeafArray(txArray)
  const txTree = merkle.treeFromLeafArray(txLeafHashes)

  const txProofs = new Array(2 ** TX_DEPTH)
  for (var jj = 0; jj < 2 ** TX_DEPTH; jj++) {
    txProofs[jj] = merkle.getProof(jj, txTree, txLeafHashes)
  }
  // TODO move balance leaf array generation DB based
  const token_types = [0, 10, 10, 10];
  const balances = [0, 1000, 0, 0];
  nonces = [0, 0, 0, 0];
  // const prvKeys = account.generatePrvKeys(3);
  // const pubKeys = account.generatePubKeys(prvKeys);

  // generate balance leaves for user accounts
  // const balanceLeafArray = balance.generateBalanceLeafArray(
  //   account.getPubKeysX(pubKeys),
  //   account.getPubKeysY(pubKeys),
  //   token_types, balances, nonces
  // )
  console.log("here")
  // when adding deposit user will be assigned a leaf 
  // id will be stored in DB (hardcode for now, till things work)
  var from_accounts_idx = [1, 2, 1, 3]
  var to_accounts_idx = [2, 0, 3, 2]

  const inputs = update.processTxArray(
    TX_DEPTH,
    fromX,
    fromY,
    toX,
    toY,
    [],
    from_accounts_idx,
    to_accounts_idx,
    amounts,
    token_types,
    signatures
  )
  console.log("input generated", inputs)

}

// returns index array of account from given array of accounts
function accountIdx(...pubkey) {

}


export default {
  getConn,
  conn,
  toMultiHash,
  checkSignature,
  prepTxs
}
