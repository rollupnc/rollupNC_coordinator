import Web3 from "web3";
import abi from "./contracts/rollupnc";
const web3 = new Web3("wss://ropsten.infura.io/ws");
import config from "../DB/knexfile";
import knexfile from "knex"
import { Accounts } from "web3-eth-accounts";
import Account from "./models/account.js"
var knex = knexfile(config);

const contract = new web3.eth.Contract(
  abi,
  "0x21b19C05D9FF933F631feA2c16F09e1C04F9C769"
);

const getDepositNum = () => knex("deposits").max("blockNumber");

const getDeposits = () => knex("deposits").select("*");

const insertDeposits = deposit => knex("deposits").insert(deposit);

const getPastEvents = blockNumber => {
  return new Promise(resolve => {
    contract
      .getPastEvents("RequestDeposit", {
        fromBlock: blockNumber,
        toBlock: "latest"
      })
      .then(events => {
        resolve(events);
      });
  });
};

const asyncInterval = (fn, ms) => {
  fn().then(() => {
    setTimeout(() => asyncInterval(fn, ms), ms);
  });
};

const saveDeposits = async () => {
  asyncInterval(async () => {
    let bn = await getDepositNum();
    bn = bn[0]["max(`blockNumber`)"];
    const num = bn ? bn + 1 : 0;
    const events = await getPastEvents(num);
    for (const event of events) {
      const amount = event.returnValues.amount.toString(10);
      const tokenType = event.returnValues.tokenType.toString(10);
      const pArray = event.returnValues.pubkey;
      const pubkeyX = pArray[0].toString(10);
      const pubkeyY = pArray[1].toString(10);
      const deposit = new Account(
        0, pubkeyX, pubkeyY, amount, 0, tokenType
      )
      const depositHash = deposit.hashAccount()
      const constructedDeposit = {
        txHash: event.transactionHash,
        blockNumber: event.blockNumber,
        pubkeyX,
        pubkeyY,
        amount,
        tokenType,
        depositHash
      };
      await insertDeposits(constructedDeposit);
    }
  }, 5000);
};

module.exports = saveDeposits;
