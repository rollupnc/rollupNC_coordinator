import knex from "../../DB/dbClient";
import eddsa from "../../circomlib/src/eddsa.js";
import utils from "../helpers/utils.js";
import mimcjs from "../../circomlib/src/mimc7.js";

// class transaction
export default class Transaction {
  constructor(
    _fromX,
    _fromY,
    _toX,
    _toY,
    _nonce,
    _amount,
    _tokenType,
    R1,
    R2,
    S
  ) {
    this.fromX = _fromX;
    this.fromY = _fromY;

    this.toX = _toX;
    this.toY = _toY;

    this.nonce = _nonce;
    this.amount = _amount;
    this.tokenType = _tokenType;

    this.R1 = R1;
    this.R2 = R2;
    this.S = S;

    this.status = 0;

    this.hash = hash(this);
    var indexes = this.findIndex();
    this.toIndex = indexes[0];
    this.fromIndex = indexes[1];

    // TODO figure out when to add txRoot
  }

  /**
   * sign a transaction with a given a private key
   * @param {Buffer} privateKey
   */
  async sign(privateKey) {
    this.signature = eddsa.signMiMC(privateKey, await hash(this));
    this.R1 = this.signature.R8[0];
    this.R2 = this.signature.R8[1];
    this.S = this.signature.S;
    return this.signature;
  }

  async serialise() {
    var tx = [
      {
        hash: await hash(this),
        fromX: this.fromX,
        fromY: this.fromY,
        fromIndex: this.fromIndex,
        toX: this.toX,
        toY: this.toY,
        nonce: this.nonce,
        toIndex: this.toIndex,
        tokenType: this.tokenType,
        amount: this.amount,
        R1: this.R1,
        R2: this.R2,
        S: this.S,
        status: this.status
      }
    ];
    return new Buffer(JSON.stringify(tx));
  }

  async validate() {
    // validate the tx with all the checks snark will do
    // return true/false
  }

  async addIndex() {
    const fromAccount = await knex("accounts")
      .where({ pubkeyX: this.fromX })
      .first();
    this.fromIndex = fromAccount.index;
    const toAccount = await knex("accounts")
      .where({ pubkeyX: this.toX })
      .first();
    this.toIndex = toAccount.index;
  }

  // finds index based on nonce+fromX+tokenType
  // TODO enhance by searching balance > amount
  async findIndex() {
    const fromAccount = await knex("accounts")
      .where({
        pubkeyX: this.fromX,
        pubkeyY: this.fromY
        // tokenType: this.tokenType
      })
      .first();
    const toAccount = await knex("accounts")
      .where({
        pubkeyX: this.toX,
        pubkeyY: this.toY
        // tokenType: this.tokenType
      })
      .first();

    return [fromAccount.index, toAccount.index];
  }

  async save(_status) {
    // assign Indexes
    var indexes = await this.findIndex();

    // insert tx into DB and/or update
    var result = await knex("tx").insert({
      hash: await hash(this).toString(),
      fromX: this.fromX,
      fromY: this.fromY,
      fromIndex: indexes[0],
      toX: this.toX,
      toY: this.toY,
      nonce: this.nonce,
      toIndex: indexes[1],
      tokenType: this.tokenType,
      amount: this.amount,
      R1: this.R1,
      R2: this.R2,
      S: this.S,
      status: _status
    });
    return result;
  }

  async read() {
    var txs = await knex.select().from("tx");
    return txs;
  }
  //
  // utils methods
  //

  // checks if tx is dependent or not
  _isDependent() {
    // check and return true/false
  }

  // return JSON pretty representation of transaction
  json() {}

  // print string representation of transaction
  toString() {
    console.log(
      "FromPubkey: [%v:%v], ToPubkey: [%v:%v], fromIndex: %v , toIndex: %v, amount: %v, tokenType: %v , nonce: %v, Status: %v",
      [this.fromX, this.fromY],
      [this.toX, this.toY],
      this.fromIndex,
      this.toIndex,
      this.amount,
      this.tokenType,
      this.nonce,
      this.status
    );
  }

  // type
  _type() {
    if ((this.toX = 0)) {
      return "withdraw";
    } else {
      return "transfer";
    }
  }
}

function hash(tx) {
  var txHash = mimcjs.multiHash([
    tx.fromX,
    tx.fromY,
    tx.toX,
    tx.toY,
    tx.amount,
    tx.nonce,
    tx.tokenType
  ]);

  return txHash;
}
