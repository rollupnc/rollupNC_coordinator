
import express from 'express'
import Processor from './processor.js';
import bodyParser from 'body-parser';
import Poller from './poller';
import config from '../config/config.js';
import utils from './utils'
import eddsa from '../circomlib/src/eddsa.js';
import logger from './logger';
import Transaction from './transaction.js';
import mysql from 'mysql';
import Mempool from './mempool.js';
import DB from './db'
const bigInt = require("snarkjs").bigInt;

process.env.NODE_ENV = "development";
// create express obj 
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// define queue 
const q = global.gConfig.tx_queue;
const maxTxs = global.gConfig.txs_per_snark;

// create poller obj 
const poller = new Poller(global.gConfig.poll_interval);

// create processor obj 
const processor = new Processor()
const mempool = new Mempool()
// tokens for which operator is accepting transactions
// to be dynamically fetched from contract
const allowedTokens = [0, 10, 20]


//receives all transactions
app.post("/submitTx", async function (req, res) {
  var fromX = req.body.fromX;
  var fromY = req.body.fromY;
  var toX = req.body.toX;
  var toY = req.body.toY;
  var amount = req.body.amount;
  var tokenType = req.body.tokenType;
  var signature = req.body.signature;
  var R = signature.R8.split(",")
  var tx = new Transaction(fromX, fromY, toX, toY, amount, tokenType, R[0], R[1], signature.S)
  // send tx to tx_pool
  await addtoqueue(await utils.getConn(), tx.serialise());
  logger.debug("Added tx to queue")
  res.json({ message: "Success" });
});

// get transaction hash from transaction params
app.post('/getTx', async function (req, res) {
  var hash = await utils.toMultiHash(req.body.fromX, req.body.fromY, req.body.toX, req.body.toY, req.body.amount, req.body.tokenType).toString()
  logger.info("Tx leaf hash generated", { tx: hash })
  res.json({ txLeafHash: hash })
})

// temporary helper api to sign transaction using given priv key
app.post("/sign", async function (req, res) {
  var prvKey = Buffer.from(
    req.body.privKey.padStart(64, '0'), "hex");
  var hash = utils.toMultiHash(req.body.fromX, req.body.fromY, req.body.toX, req.body.toY, req.body.amount, req.body.tokenType)
  signature = eddsa.signMiMC(prvKey, hash);
  logger.debug("Signature generated", { sig: signature.R8.toString() })
  res.json({
    signature: { "R8": signature.R8.toString(), "S": signature.S.toString() }
  })
})

// add transaction to queue
async function addtoqueue(conn, tx) {
  var ch = await conn.createChannel();
  var result = await ch.assertQueue(q, { durable: true });
  logger.debug("Adding new message to queue", { queueDetails: result, tx: tx.toString() });
  await ch.sendToQueue(q, Buffer.from(tx.toString()), { persistent: true });
  return;
}

// start api server 
app.listen(global.gConfig.port, () => {
  DB.AddGenesisState()
  processor.start(poller)
  mempool.StartSync()
  logger.info(
    "Started listening for transactions", { port: global.gConfig.port })
});

// handle interruption
process.on("SIGINT", async () => {
  console.log("Received interruption stopping receiver...");
  process.exit();
});

// check for unhandledRejection
process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
});