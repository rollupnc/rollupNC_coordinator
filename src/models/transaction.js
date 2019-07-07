import knex from '../../DB/dbClient';
import eddsa from '../../circomlib/src/eddsa.js';
import utils from '../helpers/utils.js';

// class transaction
export default class Transaction {
  constructor(
    _fromX, _fromY, _toX, _toY, _nonce, _amount, _tokenType, 
    R1, R2, S
  ) {
    this.fromX = _fromX;
    this.fromY = _fromY;

    this.toX = _toX;
    this.toY = _toY;

    this.nonce = _nonce;

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
    this.hash = utils.toMultiHash(
      this.fromX,
      this.fromY,
      this.toX,
      this.toY,
      this.nonce,
      this.amount,
      this.tokenType,
    );
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
      nonce: this.nonce,
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

  async addIndex(){
    const fromAccount = await knex('accounts').where({pubkeyX:this.fromX}).first()
    this.fromIndex = fromAccount.index
    const toAccount = await knex('accounts').where({pubkeyX:this.toX}).first()
    this.toIndex = toAccount.index
  }

  async save() {
    // var res = knex('tx').insert([this.fromX, this.fromY, this.toX, this.toY, this.tokenType, this.amount, this.sig])
    var result = await knex('tx').insert({
      fromX: this.fromX,
      fromY: this.fromY,
      toX: this.toX,
      toY: this.toY,
      nonce: this.nonce,
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

  // checks if tx is dependent or not
  _isDependent() {
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
