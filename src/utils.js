import amqp from 'amqplib';
import mimcjs from '../circomlib/src/mimc7.js';
import eddsa from '../circomlib/src/eddsa.js';
import logger from './logger'
const bigInt = require("snarkjs").bigInt;

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
  var pubkeys = []
  var tokenTypes = []
  var nonces = []
  var amounts = []
  var signatures = []
  logger.debug("prepping inputs to snark for given transactions")
  for (var i = 0; i < txs.length; i++) {

  }
}

function genPubkeys(...pubkey) {

}
export default {
  getConn,
  conn,
  toMultiHash,
  checkSignature,
  prepTxs
}
