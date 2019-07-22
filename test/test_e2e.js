import request from "request";
import process from "process"
import Transaction from "../src/models/transaction.js";
import accountTable from "../src/db/accountTable.js"
import Poller from "../src/events/poller.js";
import fs from "fs"

const url = "http://localhost:3000/submitTx";

const alicePubkey = global.gConfig.alicePubkey;
const alicePrvkey = global.gConfig.alicePrvkey;

console.log('alicePubkey', alicePubkey)
console.log('alicePrvkey', alicePrvkey)

const poller = new Poller(1000);
poller.poll();

var testCount 
if (process.argv.length > 2){
  testCount = parseInt(process.argv[2])
} else {
  testCount = fs.readFileSync('./test/testCount.json')
}

poller.onPoll(async () => {
  try {
    submitTx(
      alicePubkey[0], alicePubkey[1], 1, 
      alicePubkey[0], alicePubkey[1], 1,  
      await accountTable.getNonce(
        alicePubkey[0],
        alicePubkey[1]
      ) + testCount,
      0, //amount
      1  //tokenType
    );
    testCount++;
    fs.writeFileSync('./test/testCount.json', JSON.stringify(testCount))
    // tmp = sender;
    // sender = receiver;
    // receiver = tmp;
    poller.poll();
  } catch(err){
    alert(err)
  }

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
  await tx.sign(alicePrvkey);
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
      console.log("tx " , testCount - 1 , " successful!  Server responded with:", body);
    }
  });
}
