var amqp = require("amqplib");
const config = require("../config/config.js");
var utils = require("./utils");
const q = global.gConfig.tx_queue;

// called by co-ordinator to fetch top tx's from queue
// send all 2**m transfers to snark

async function fetchTxs() {
  conn = await utils.getConn();
  var ch = await conn.createChannel();
  ch.assertQueue(q);
  ch.consume(
    q,
    function(msg) {
      console.log(" [x] Received %s", msg.content.toString());
    },
    {
      noAck: true
    }
  );
}
