
import express from 'express'
import Processor from './processor.js';
import bodyParser from 'body-parser';

const mimcjs = require("../circomlib/src/mimc7.js");
var config = require("../config/config.js");
const bigInt = require("snarkjs").bigInt;
var utils = require("./utils");
var process_tx = require("./process_tx");
var amqp = require("amqplib");
const eddsa = require("../circomlib/src/eddsa.js");

var app = express();
var logger = require("./logger");
process.env.NODE_ENV = "development";

const q = global.gConfig.tx_queue;
const maxTxs = global.gConfig.txs_per_snark;
var lastPushed = 0;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const processor = new Processor()

//receives all transactions
app.post("/submitTx", async function (req, res) {
  var fromX = req.body.fromX;
  var fromY = req.body.fromY;
  var toX = req.body.toX;
  var toY = req.body.toY;
  var amount = req.body.amount;
  var tokenType = req.body.tokenType;
  var signature = req.body.signature;
  console.log("sig", signature)
  utils.toSignature(signature)
  // validate if signature is on correct tx hash 
  txHash = utils.toMultiHash(fromX, fromY, toX, toY, amount, tokenType)
  // TODO make this work 
  // if (!utils.checkSignature(txHash, fromX, fromY, signature)) {
  //   res.status(400).json({ message: "Invalid signature" })
  //   return
  // }

  // TODO validate tx with cached DB/other contraint checks

  // send tx to tx_pool
  await addtoqueue(await utils.getConn());
  logger.debug("Added tx to pool")
  res.json({ message: "Added transfer to tx pool " });
});

app.post('/getTx', async function (req, res) {
  var hash = await utils.toMultiHash(req.body.fromX, req.body.fromY, req.body.toX, req.body.toY, req.body.amount, req.body.tokenType).toString()
  logger.info("Tx leaf hash generated", { tx: hash })
  res.json({ txLeafHash: hash })
})

// temporary helper api to sign data using given priv key
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
async function addtoqueue(conn) {
  var ch = await conn.createChannel();
  var result = await ch.assertQueue(q);
  logger.debug("Adding new message to queue", { queueDetails: result });
  await ch.sendToQueue(q, Buffer.from("something to do"));
  return;
}

app.listen(global.gConfig.port, () => {
  processor.start()
  logger.info(
    "Started listening for transactions", { port: global.gConfig.port })
});

process.on("SIGINT", async () => {
  console.log("Received interruption stopping receiver...");
  process.exit();
});

// check for unhandledRejection
process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
});