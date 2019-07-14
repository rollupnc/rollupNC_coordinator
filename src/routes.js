var express = require("express");
var router = express.Router();
import utils from "./helpers/utils";
import eddsa from "../circomlib/src/eddsa.js";
import logger from "./helpers/logger";
import Transaction from "./models/transaction.js";

// define queue
const q = global.gConfig.tx_queue;

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log("Time: ", Date.now());
  next();
});

//receives all transactions
router.post("/submitTx", async function(req, res) {
  var fromX = req.body.fromX;
  var fromY = req.body.fromY;
  var toX = req.body.toX;
  var toY = req.body.toY;
  var nonce = req.body.nonce;
  var amount = parseInt(req.body.amount);
  var tokenType = parseInt(req.body.tokenType);
  var signature = req.body.signature;
  var R = signature.R8.split(",");
  var tx = new Transaction(
    fromX,
    fromY,
    toX,
    toY,
    nonce,
    amount,
    tokenType,
    R[0],
    R[1],
    signature.S
  );
  // send tx to tx_pool
  await addtoqueue(await utils.getConn(), tx.serialise());
  // logger.debug("Added tx to queue")
  res.json({ message: "Success" });
});

// get transaction hash from transaction params
router.post("/getTx", async function(req, res) {
  var hash = await utils
    .toMultiHash(
      req.body.fromX,
      req.body.fromY,
      req.body.toX,
      req.body.toY,
      req.body.nonce,
      req.body.amount,
      req.body.tokenType
    )
    .toString();
  logger.info("Tx leaf hash generated", { tx: hash });
  res.json({ txLeafHash: hash });
});

// temporary helper api to sign transaction using given priv key
router.post("/sign", async function(req, res) {
  var prvKey = Buffer.from(req.body.privKey.padStart(64, "0"), "hex");
  var hash = utils.toMultiHash(
    req.body.fromX,
    req.body.fromY,
    req.body.toX,
    req.body.toY,
    req.body.amount,
    req.body.tokenType
  );
  signature = eddsa.signMiMC(prvKey, hash);
  // logger.debug("Signature generated", { sig: signature.R8.toString() })
  res.json({
    signature: { R8: signature.R8.toString(), S: signature.S.toString() }
  });
});

// add transaction to queue
async function addtoqueue(conn, tx) {
  var ch = await conn.createChannel();
  var result = await ch.assertQueue(q, { durable: true });
  // logger.debug("Adding new message to queue", { queueDetails: result, tx: tx.toString() });
  await ch.sendToQueue(q, Buffer.from(tx.toString()), { persistent: true });
  return;
}

module.exports = router;
