import config from '../config/config.js';
import Account from './account';
import fs from 'fs'
import utils from './utils'
import logger from './logger'
import knex from '../DB/dbClient'



async function getTxCount() {
  var count = await knex('tx').count()
  return count
}

async function getMaxTxs() {
  var res = await knex.select('*').from('tx').limit(global.gConfig.txs_per_snark);
  return res
}

// genesis state of co-ordinator 
async function AddGenesisState() {
  var genesis = await utils.readGenesis()
  logger.info("writing accounts from genesis to DB", { AccountCount: genesis.accounts.length })
  genesis.accounts.forEach(account => {
    var newAccount = new Account(account.pubkeyX, account.pubkeyY, account.balance, account.nonce, account.tokenType)
    newAccount.save()
  });
}

// get all accounts in current state 
async function getAllAccounts() {
  var results = await knex.select('*').from('accounts')
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
  getAllAccounts,
  AddGenesisState
}
