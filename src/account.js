
import mimcjs from '../circomlib/src/mimc7.js';
import knex from '../DB/dbClient.js';

// class transaction
export default class Account {
  constructor(_PubkeyX, _PubkeyY, _balance, _nonce, _tokenType) {
    this.pubkeyX = _PubkeyX;
    this.pubkeyY = _PubkeyY;
    this.balance = _balance;
    this.nonce = _nonce;
    this.tokenType = _tokenType;
  }

  async save() {
    var result = await knex('accounts').insert({
      pubkeyX: this.pubkeyX,
      pubkeyY: this.pubkeyY,
      balance: this.balance,
      nonce: this.nonce,
      tokenType: this.tokenType
    })
    return result;
  }

  MIMC() {
    var leafHash = mimcjs.multiHash([
      this.pubkeyX,
      this.pubkeyY,
      this.balance,
      this.nonce,
      this.tokenType
    ])
    return leafHash;
  }

}