import request from "request";
import Transaction from "../src/models/transaction.js";
import Poller from "../src/models/poller.js";
import {zeroLeaf, coordinatorLeaf} from "../config/secret.js"

const url = "http://localhost:3000/submitTx";

var sender = coordinatorLeaf;
var receiver = coordinatorLeaf;
const prvkey = global.gConfig.prvkey;

const poller = new Poller(1000);
poller.poll();
poller.onPoll(async () => {
  submitTx(
    sender, 
    receiver, 
    sender.nonce, 
    0, 
    0
  );
  sender.nonce++;
  // tmp = sender;
  // sender = receiver;
  // receiver = tmp;
  poller.poll();
});


async function submitTx(from, to, nonce, amount, tokenType) {
  console.log(`${from.index} send ${to.index} ${amount} of token ${tokenType}`);
  const tx = new Transaction(
    from.pubkeyX,
    from.pubkeyY,
    from.index,
    to.pubkeyX,
    to.pubkeyY,
    to.index,
    nonce,
    amount,
    tokenType,
    null,
    null,
    null
  );
  await tx.sign(prvkey);
  const json = {
    fromX: tx.fromX,
    fromY: tx.fromY,
    fromIndex: tx.fromIndex,
    toX: tx.toX,
    toY: tx.toY,
    toIndex: tx.toIndex,
    nonce: tx.nonce,
    amount: tx.amount,
    tokenType: tx.tokenType,
    R8x: tx.R8x.toString(),
    R8y: tx.R8y.toString(),
    S: tx.S.toString()
  };
  request.post({ url, json }, function(error, response, body) {
    if (error) {
      return console.error("TX failed:", error);
    }
    console.log("Tx successful!  Server responded with:", body);
  });
}
