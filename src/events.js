const Web3 = require("web3");
const abi = require("./contracts/rollupnc");
const web3 = new Web3("wss://ropsten.infura.io/ws");
var config = require("../DB/knexfile");
var knex = require("knex")(config);

const rollup = new web3.eth.Contract(
  abi,
  "0x21b19C05D9FF933F631feA2c16F09e1C04F9C769"
);

const getDepositNum = () => knex("deposits").max("blockNumber");

const getDeposits = () => knex("deposits").select("*");

const insertDeposits = deposit => knex("deposits").insert(deposit);

const getPastEvents = bn => {
  return new Promise(resolve => {
    rollup
      .getPastEvents("RequestDeposit", {
        fromBlock: bn,
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
      const x_coordinate = pArray[0].toString(10);
      const y_coordinate = pArray[1].toString(10);
      const constructedDeposit = {
        blockNumber: event.blockNumber,
        amount,
        tokenType: tokenType,
        txHash: event.transactionHash,
        pubkeyX: x_coordinate,
        pubkeyY: y_coordinate
      };
      await insertDeposits(constructedDeposit);
    }
  }, 5000);
};

module.exports = saveDeposits;
