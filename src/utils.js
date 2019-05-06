var amqp = require("amqplib");
var conn = null;
const mimcjs = require("../circomlib/src/mimc7.js");
const eddsa = require("../circomlib/src/eddsa.js");


async function getConn() {
  if (conn === null) {
    conn = await amqp.connect(global.gConfig.amqp);
  }
  return conn;
}

function toMultiHash(fromX, fromY, toX, toY, amount, token) {
  leafHash = mimcjs.multiHash([
    BigInt(fromX), BigInt(fromY), BigInt(toX), BigInt(toY), BigInt(amount), BigInt(token)
  ])
  return leafHash
}

function checkSignature(tx, fromX, fromY, signature) {
  return eddsa.verifyMiMC(tx, signature,
    [BigInt(fromX), BigInt(fromY)])
}

function toSignature(signature) {
  var sig = {
    "R8": [BigInt(signature.R8[0].toString())],
    "S": BigInt(signature.S)
  }
  console.log("mew sig", sig)
  return
}
module.exports = {
  getConn,
  conn,
  toMultiHash,
  checkSignature,
  toSignature
};
