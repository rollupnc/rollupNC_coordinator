var amqp = require("amqplib");
var conn = null;

async function getConn() {
  if (conn === null) {
    conn = await amqp.connect(global.gConfig.amqp);
  }
  console.log("here", conn);
  return conn;
}
module.exports = {
  getConn,
  conn
};
