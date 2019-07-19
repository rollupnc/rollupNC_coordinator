// All database interactions to be performed from here
import config from "../../config/config.js";
import Account from "../models/account.js";
import fs from "fs";
import utils from "../helpers/utils.js";
import logger from "../helpers/logger.js";
import knex from "../../DB/dbClient.js";

const bigInt = require("snarkjs").bigInt;

async function getTxCount() {
  var count = await knex("tx").count();
  return count;
}

// select max transactions that can be processes in a queue
async function getMaxTxs() {
  var res = await knex("tx")
    .where({ status: 0 })
    .update({ status: 1 })
    .limit(global.gConfig.txs_per_snark);
  return res;
}

// getCoordinatorNonce fetches coordinator nonce
async function getCoordinatorNonce() {
  var res = await knex("accounts").where({ index: 1 });
  return res;
}

async function incrementCoordinatorNonce(count) {
  var res = await knex("accounts")
    .where({ index: 1 })
    .increment("nonce", count);
  logger.info("Incrementing nonce of coordinator", { results: res });
}

async function getNonce(pubkeyX, pubkeyY) {
  var res = await knex
    .select("nonce")
    .from("accounts")
    .where({ pubkeyX, pubkeyY })
    .first();
  return res["nonce"];
}

async function getIndex(pubkeyX, pubkeyY) {
  var res = await knex
    .select("index")
    .from("accounts")
    .where({ pubkeyX, pubkeyY })
    .first();
  return res["index"];
}

// genesis state of co-ordinator
async function addGenesisState() {
  var genesis = await utils.readGenesis();
  logger.info("writing accounts from genesis to DB", {
    AccountCount: genesis.accounts.length
  });
  genesis.accounts.forEach(account => {
    // console.log(account.pubkeyX);
    var newAccount = new Account(
      account.index,
      account.pubkeyX,
      account.pubkeyY,
      account.balance,
      account.nonce,
      account.tokenType
    );
    newAccount.save();
  });
}

// get all accounts in current state
async function getAllAccounts() {
  var results = await knex
    .select("*")
    .from("accounts")
    .orderBy("index", "asc");
  var accounts = Array();
  for (var i = 0; i < results.length; i++) {
    var result = results[i]
    var leaf = new Account(
      result.index,
      result.pubkeyX,
      resuplt.pubkeyY,
      result.balance,
      result.nonce,
      result.tokenType
    )
    accounts.push(leaf);
  }
  return accounts;
}

export default {
  getTxCount,
  getMaxTxs,
  getNonce,
  getIndex,
  getAllAccounts,
  addGenesisState,
  incrementCoordinatorNonce,
  getCoordinatorNonce
};
