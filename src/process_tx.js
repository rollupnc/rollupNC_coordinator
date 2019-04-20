// process tx from rabbit-mq queue
// send all 2**m transfers to snark
var amqp = require("amqplib/callback_api");
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
    channel.assertQueue(queue, {
      durable: false
    });

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

    channel.consume(
      queue,
      function(msg) {
        console.log(" [x] Received %s", msg.content.toString());
      },
      {
        noAck: true
      }
    );
  });
});
