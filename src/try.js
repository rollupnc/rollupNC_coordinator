var q = "tasks";

var open = require("amqplib").connect("amqp://localhost");
open.then(conn => {
  addtoqueue(conn);
});
async function addtoqueue(conn) {
  var ch = await conn.createChannel();
  var ok = await ch.assertQueue(q);
  console.log("ok", ok);
  await ch.sendToQueue(q, Buffer.from("something to do"));
  return;
}

// // Publisher
// open
//   .then(function(conn) {
//     return conn.createChannel();
//   })
//   .then(function(ch) {
//     return ch.assertQueue(q).then(function(ok) {
//       return ch.sendToQueue(q, Buffer.from("something to do"));
//     });
//   })
//   .catch(console.warn);

// // Consumer
// open
//   .then(function(conn) {
//     return conn.createChannel();
//   })
//   .then(function(ch) {
//     return ch.assertQueue(q).then(function(ok) {
//       return ch.consume(q, function(msg) {
//         if (msg !== null) {
//           console.log(msg.content.toString());
//           ch.ack(msg);
//         }
//       });
//     });
//   })
//   .catch(console.warn);
