import knex from '../DB/dbClient.js';
import eddsa from '../circomlib/src/eddsa.js';
import mimcjs from '../circomlib/src/mimc7.js';

// class transaction
export default class Transaction {
  constructor(_fromX, _fromY, _toX, _toY, _amount, _tokenType, R1, R2, S) {
    this.fromX = _fromX;
    this.fromY = _fromY;

    this.toX = _toX;
    this.toY = _toY;

    this.amount = _amount
    this.tokenType = _tokenType;

    this.R1 = R1
    this.R2 = R2
    this.S = S
  }

  /**
   * sign a transaction with a given a private key
   * @param {Buffer} privateKey
   */
  sign(privateKey) {
    this.hash = mimcjs.multiHash([
      this.fromX,
      this.fromY,
      this.toX,
      this.toY,
      this.amount,
      this.tokenType,
    ]);
    this.signature = eddsa.signMiMC(privateKey, this.hash);
    this.R1 = this.signature.R8[0]
    this.R2 = this.signature.R8[1]
    this.S = this.signature.S
    return this.signature
  }

  serialise() {
    var tx = [{
      fromX: this.fromX,
      fromY: this.fromY,
      toX: this.toX,
      toY: this.toY,
      tokenType: this.tokenType,
      amount: this.amount,
      R1: this.R1,
      R2: this.R2,
      S: this.S,
    }];
    return (new Buffer(JSON.stringify(tx)))
  }

  async validate() {
    // validate the tx with all the checks snark will do
    // return true/false
  }

  async save() {
    // var res = knex('tx').insert([this.fromX, this.fromY, this.toX, this.toY, this.tokenType, this.amount, this.sig])
    var result = await knex('tx').insert({
      fromX: this.fromX,
      fromY: this.fromY,
      toX: this.toX,
      toY: this.toY,
      tokenType: this.tokenType,
      amount: this.amount,
      R1: this.R1,
      R2: this.R2,
      S: this.S
    })
    return result
  }

  async read() {
    var txs = await knex.select().from('tx')
    return txs
  }
  //
  // utils methods
  //

  // checks if tx is dependant or not
  _isDependant() {
    // check and return true/false
  }

  // return JSON pretty representation of transaction
  json() {

  }

  // type
  _type() {
    if (this.toX = 0) {
      return "withdraw"
    }
    else {
      return "transfer"
    }
  }
}
