var express = require("express");
var bodyParser = require("body-parser");
const config = require("../config/config.js");
var app = express();
var amqp = require("amqplib");
var conn = null;
const q = global.gConfig.tx_queue;
// environment variables
process.env.NODE_ENV = "development";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//receives all transactions
app.post("/submit_tx", async function(req, res) {
  // validate input tx

  // TODO validate transaction

  // send tx to tx_pool
  await getConn();
  await addtoqueue(conn);
  res.json({ message: "Added transfer to tx pool " });
});

process.on("SIGINT", async () => {
  console.log("Received interruption stopping receiver...");
  process.exit();
});

// check for unhandledRejection
process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
});

async function getConn() {
  if (conn === null) {
    conn = await amqp.connect(global.gConfig.amqp);
  }
  return conn;
}

async function addtoqueue(conn) {
  var ch = await conn.createChannel();
  await ch.assertQueue(q);
  await ch.sendToQueue(q, Buffer.from("something to do"));
  return;
}

app.listen(global.gConfig.port, () => {
  console.log(
    `Started listening for transactions on port ${global.gConfig.port} 🎉`
  );
});
