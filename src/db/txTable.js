import knex from "../../DB/dbClient.js";
import Transaction from "../models/transaction";

async function getTxCount() {
    var count = await knex("tx").count();
    return count;
}

// select max transactions that can be processes in a queue
async function getMaxTxs() {
    var results = await knex
        .select("*")
        .from("tx")
        .where({ status: 0 })
        .limit(global.gConfig.txs_per_snark);
    var txs = Array();
    for (var i = 0; i < results.length; i++) {
        var result = results[i]
        var leaf = new Transaction(
          result.fromX,
          result.fromY,
          result.fromIndex,
          result.toX,
          result.toY,
          result.toIndex,
          result.nonce,
          result.amount,
          result.tokenType,
          result.R8x,
          result.R8y,
          result.S,
          1
        )
        txs.push(leaf);
    }
    return txs;
}

export default{
    getTxCount,
    getMaxTxs
}