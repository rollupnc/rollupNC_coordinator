var express = require("express");
var bodyParser = require("body-parser");
const mimcjs = require("../circomlib/src/mimc7.js");
var config = require("../config/config.js");
const bigInt = require("snarkjs").bigInt;
var utils = require("./utils");
var process_tx = require("./process_tx");
var amqp = require("amqplib");
var logger = require("./logger")

const q = global.gConfig.tx_queue;
const maxTxs = global.gConfig.txs_per_snark;
var lastPushed = 0;
var app = express();


process.env.NODE_ENV = "development";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//receives all transactions
app.post("/submit_tx", async function (req, res) {
  from = req.body.from;
  to = req.body.to;
  amount = req.body.amount;
  tokenType = req.body.tokenType;
  signature = req.body.signature;

  // TODO validate input tx

  // TODO validate transaction

  // send tx to tx_pool
  await addtoqueue(await utils.getConn());
  console.log("sent");
  res.json({ message: "Added transfer to tx pool " });
});

app.post('/getTx', function (req, res) {
  var fromX = BigInt(req.body.fromX);
  var fromY = BigInt(req.body.fromY);
  var toX = BigInt(req.body.toX);
  var toY = BigInt(req.body.toY);
  var amount = BigInt(req.body.amount);
  var tokenType = BigInt(req.body.tokenType);

  leafHash = mimcjs.multiHash([
    fromX, fromY, toX, toY, amount, tokenType
  ])

  logger.info("Tx leaf hash generated", { tx: leafHash.toString() })

  res.json({ txLeafHash: leafHash.toString() })
})


async function addtoqueue(conn) {
  var ch = await conn.createChannel();
  var result = await ch.assertQueue(q);
  console.log("message count", result);
  if (result.messageCount - lastPushed > maxTxs) {
    console.log("clearing queue, starting aggregation");
    process_tx.fetchTxs();
    lastPushed = result.messageCount;
  }
  await ch.sendToQueue(q, Buffer.from("something to do"));
  return;
}

app.listen(global.gConfig.port, () => {
  console.log(
    `Started listening for transactions on port ${global.gConfig.port} 🎉`
  );
});



process.on("SIGINT", async () => {
  console.log("Received interruption stopping receiver...");
  process.exit();
});

// check for unhandledRejection
process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
});