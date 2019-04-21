// process tx from rabbit-mq queue
// send all 2**m transfers to snark
var amqp = require("amqplib");
const config = require("../config/config.js");

amqp.connect(global.gConfig.amqp, function(err, conn) {
  if (err) {
    throw err;
  }
  conn.createChannel(function(err, channel) {
    if (err) {
      throw err;
    }

    var queue = global.gConfig.tx_queue;
    channel.assertQueue(queue);

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

    channel.consume(
      queue,
      function(msg) {
        // add transaction to DB
        console.log(" [x] Received %s", msg.content.toString());
      },
      {
        noAck: true
      }
    );
  });
});
