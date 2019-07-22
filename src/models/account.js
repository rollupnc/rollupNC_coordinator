import mimcjs from '../../circomlib/src/mimc7.js'
import knex from '../../DB/dbClient.js'

// class transaction
export default class Account {
  constructor(_index, _PubkeyX, _PubkeyY, _balance, _nonce, _tokenType) {
    this.index = _index;
    this.pubkeyX = _PubkeyX;
    this.pubkeyY = _PubkeyY;
    this.balance = _balance;
    this.nonce = _nonce;
    this.tokenType = _tokenType;
  }

  async save() {
    var result = await knex.insert({
      index: this.index,
      pubkeyX: this.pubkeyX,
      pubkeyY: this.pubkeyY,
      balance: this.balance,
      nonce: this.nonce,
      tokenType: this.tokenType
    }).into('accounts')
    .onDuplicateUpdate('balance', 'nonce')
    return result;
  }

  async debitAndIncreaseNonce(amount){
      this.balance = this.balance - amount; 
      this.nonce++;
      this.hash = this.hashAccount()
      this.save()
      return this.hash
  }

  async credit(amount){
      if (this.index > 0){ // do not credit zero leaf
          this.balance = this.balance + amount;
          this.hash = this.hashAccount()
      }
      this.save()
      return this.hash
  }

  hashAccount() {
    var leafHash = mimcjs.multiHash([
      this.pubkeyX,
      this.pubkeyY,
      this.balance,
      this.nonce,
      this.tokenType
    ])
    this.hash = leafHash;
    return leafHash;
  }

}