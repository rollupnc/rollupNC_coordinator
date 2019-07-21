import request from "request";
import Transaction from "../src/models/transaction.js";
import Poller from "../src/events/poller.js";

const url = "http://localhost:3000/submitTx";

const pubkey = global.gConfig.pubkey;
const prvkey = global.gConfig.prvkey;

console.log('pubkey', pubkey)
console.log('prvkey', prvkey)

var nonce = 0;

const poller = new Poller(1000);
poller.poll();
poller.onPoll(async () => {
  submitTx(
    pubkey[0], pubkey[1], 1, 
    pubkey[0], pubkey[1], 1,  
    nonce, 
    0, //amount
    0  //tokenType
  );
  nonce++;
  // tmp = sender;
  // sender = receiver;
  // receiver = tmp;
  poller.poll();
});


async function submitTx(
  fromX, fromY, fromIndex,
  toX, toY, toIndex,
  nonce, amount, tokenType) {
  const tx = new Transaction(
    fromX,
    fromY,
    fromIndex,
    toX,
    toY,
    toIndex,
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
    } else {
      console.log("Tx successful!  Server responded with:", body);
    }
  });
}
