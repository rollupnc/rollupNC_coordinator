var express = require("express");
var bodyParser = require("body-parser");
const config = require("../config/config.js");
var app = express();
var amqp = require("amqplib/callback_api");

// environment variables
process.env.NODE_ENV = "development";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// const tx = {
//   from: pubKey_from[0],
//   to: pubKey_to[0],
//   value: amount,
//   type: token_type_from
// };

//receives all token transfers
app.post("/submit_tx", function(req, res) {
  // push the transfer to the queue
  try {
    amqp.connect(global.gConfig.amqp, function(err, conn) {
      console.log("goas", global.gConfig);
      if (err != null) {
        throw err;
      }
      conn.createChannel(function(err, ch) {
        if (err != null) {
          throw err;
        }
        var queue = global.gConfig.tx_queue;
        ch.assertQueue(queue, { durable: false });
        ch.sendToQueue(queue, Buffer.from("new msg"));
        console.log("[x] Sent");
      });
    });
    res.json({ message: "Added transfer to queue " });
  } catch (e) {
    console.log("Error occured while adding tx to queue %s", e);
    res.json({ message: "failed" });
  }
});

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
