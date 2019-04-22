var amqp = require("amqplib");
const config = require("../config/config.js");
var utils = require("./utils");
const q = global.gConfig.tx_queue;

// called by co-ordinator to fetch top tx's from queue
// send all 2**m transfers to snark
async function fetchTxs() {
  conn = await utils.getConn();
  var ch = await conn.createChannel();
  await ch.assertQueue(q);
  await ch.consume(q, msg => {
    console.log("received %v", msg.content.toString());
  });
  return;
}

module.exports = {
  fetchTxs
};
