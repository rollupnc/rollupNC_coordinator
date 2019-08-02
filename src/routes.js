var express = require("express");
var router = express.Router();
import utils from "./helpers/utils";
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
  var fromIndex = parseInt(req.body.fromIndex);
  var toX = req.body.toX;
  var toY = req.body.toY;
  var toIndex = parseInt(req.body.toIndex);
  var nonce = parseInt(req.body.nonce);
  var amount = parseInt(req.body.amount);
  var tokenType = parseInt(req.body.tokenType);
  var R8x = req.body.R8x;
  var R8y = req.body.R8y;
  var S = req.body.S;
  var tx = new Transaction(
    fromX,
    fromY,
    fromIndex,
    toX,
    toY,
    toIndex,
    nonce,
    amount,
    tokenType,
    R8x,
    R8y,
    S
  );
  // validate tx
  if (tx.isValid()){
    // if valid, send tx to tx_pool
    try {
      console.log(
        "adding tx to queue", tx
      )
      await addtoqueue(await utils.getConn(), await tx.serialise());
      logger.debug("Added tx to queue");
      res.json({ message: "Success" });
    } catch(err){
      throw err
    }

  }
});

// get transaction hash from transaction params
router.post("/getTx", async function(req, res) {
  var tx = new Transaction(
    req.body.fromX,
    req.body.fromY,
    req.body.fromIndex,
    req.body.toX,
    req.body.toY,
    req.body.nonce,
    req.body.amount,
    req.body.tokenType
  )
  var hash = await tx.hash.toString();
  logger.info("Tx leaf hash generated", { tx: hash });
  res.json({ txLeafHash: hash });
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
