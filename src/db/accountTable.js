import knex from "../../DB/dbClient.js";
import Account from "../models/account.js";
import utils from "../helpers/utils"
import logger from "../helpers/logger"

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

// finds index based on nonce+fromX+tokenType
// TODO enhance by searching balance > amount
async function getAccountFromPubkey(pubkeyX, pubkeyY) {
    const account = await knex("accounts")
        .where({
        pubkeyX: pubkeyX,
        pubkeyY: pubkeyY
        // tokenType: this.tokenType
        })
        .first();
    return account;
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


// getCoordinatorNonce fetches coordinator nonce
async function getCoordinatorNonce() {
    var res = await knex
    .select("nonce")
    .from("accounts")
    .where({ index: 1 })
    .first();
    return res.nonce;
}

async function incrementCoordinatorNonce(count = 1) {
    var res = await knex("accounts")
        .where({ index: 1 })
        .increment("nonce", count);
    // logger.info("Incrementing nonce of coordinator", { results: res });
}

async function getNonce(pubkeyX, pubkeyY) {
    var res = await knex
        .select("nonce")
        .from("accounts")
        .where({ pubkeyX, pubkeyY })
        .first();
    return res.nonce;
}
  
async function getIndex(pubkeyX, pubkeyY) {
    var res = await knex
        .select("index")
        .from("accounts")
        .where({ pubkeyX, pubkeyY })
        .first();
    return res["index"];
}
  

export default{
    addGenesisState,
    getAccountFromPubkey,
    getAllAccounts,
    getCoordinatorNonce,
    incrementCoordinatorNonce,
    getNonce,
    getIndex
}