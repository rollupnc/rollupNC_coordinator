var express = require("express");
var bodyParser = require("body-parser");
const config = require("../config/config.js");
var app = express();
var amqp = require("amqplib/callback_api");

// environment variables
process.env.NODE_ENV = "development";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// const tx = {
//   from: pubKey_from[0],
//   to: pubKey_to[0],
//   value: amount,
//   type: token_type_from
// };

//receives all token transfers
app.post("/submit_tx", function(req, res) {
  console.log("Recieved request", req);
  // push the transfer to the queue
  amqp.connect(global.gConfig.amqp, function(err, conn) {
    conn.createChannel(function(err, ch) {
      var queue = global.gConfig.tx_queue;
      ch.assertQueue(queue, { durable: false });
      ch.sendToQueue(queue, Buffer.from("new msg"));
      console.log("[x] Sent");
    });
    setTimeout(function() {
      conn.close();
      process.exit(0);
    }, 500);
  });
  res.json({ message: "Added transfer to queue " });
});

app.listen(global.gConfig.port, () => {
  console.log(
    `Started listening for transactions on port ${global.gConfig.port} 🎉`
  );
});
