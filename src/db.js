import config from '../config/config.js';
import Account from './account.js';
import fs from 'fs'
import utils from './utils.js'
import logger from './logger.js'
import knex from '../DB/dbClient.js'

const bigInt = require("snarkjs").bigInt;
// const stringifyBigInts = require("snarkjs").stringifyBigInts;

// const unstringifyBigInts = require("snarkjs").unstringifyBigInts;

async function getTxCount() {
  var count = await knex('tx').count()
  return count
}

// TODO delete selected transactions 
async function getMaxTxs() {
  var res = await knex.select('*').from('tx').limit(global.gConfig.txs_per_snark);
  return res
}

async function getNonce(pubkeyX, pubkeyY) {
  var res = await knex.select('nonce').from('accounts').where({ pubkeyX, pubkeyY}).first();
  return res['nonce'];
}

async function getIndex(pubkeyX, pubkeyY) {
  var res = await knex.select('index').from('accounts').where({ pubkeyX, pubkeyY}).first();
  return res['index'];
}

// genesis state of co-ordinator 
async function AddGenesisState() {
  var genesis = await utils.readGenesis()
  logger.info("writing accounts from genesis to DB", { AccountCount: genesis.accounts.length })
  genesis.accounts.forEach(account => {
    console.log(account.pubkeyX)
    var newAccount = new Account(account.index, account.pubkeyX, account.pubkeyY, account.balance, account.nonce, account.tokenType)
    newAccount.save()
  });
}

// get all accounts in current state 
async function getAllAccounts() {
  var results = await knex.select('*').from('accounts').orderBy('index', 'asc')
  var accounts = Array()
  for (var i = 0; i < results.length; i++) {
    var leaf = {}
    leaf['pubKey_x'] = results[i].pubkeyX;
    leaf['pubKey_y'] = results[i].pubkeyY;
    leaf['balance'] = results[i].balance;
    leaf['nonce'] = results[i].nonce;
    leaf['token_type'] = results[i].tokenType;
    accounts.push(leaf)
  }
  return accounts
}

export default {
  getTxCount,
  getMaxTxs,
  getNonce,
  getIndex,
  getAllAccounts,
  AddGenesisState
}
