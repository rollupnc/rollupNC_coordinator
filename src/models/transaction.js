import knex from "../../DB/dbClient";
import eddsa from "../../circomlib/src/eddsa.js";
import mimcjs from "../../circomlib/src/mimc7.js";
import {stringifyBigInts, unstringifyBigInts} from "../helpers/stringifybigint"

// class transaction
export default class Transaction {
    constructor(
      _fromX,
      _fromY,
      _fromIndex,
      _toX,
      _toY,
      _toIndex,
      _nonce,
      _amount,
      _tokenType,
      R8x,
      R8y,
      S
    ) {
      this.fromX = _fromX;
      this.fromY = _fromY;
      this.fromIndex = _fromIndex;

      this.toX = _toX;
      this.toY = _toY;
      this.toIndex = _toIndex;

      this.nonce = _nonce;
      this.amount = _amount;
      this.tokenType = _tokenType;

      this.R8x = R8x;
      this.R8y = R8y;
      this.S = S;

      this.status = 0;

      this.hash = this.hashTx();

      // var indexes = this.findIndex();
      // this.toIndex = indexes[0];
      // this.fromIndex = indexes[1];

      // TODO figure out when to add txRoot
    }

    /**
     * sign a transaction with a given a private key
     * @param {Buffer} privateKey
     */
    async sign(privateKey) {
      this.signature = eddsa.signMiMC(privateKey, await this.hashTx());
      this.R8x = this.signature.R8[0];
      this.R8y = this.signature.R8[1];
      this.S = this.signature.S;
      return this.signature;
    }

    async serialise() {
      var tx = [
        {
          hash:stringifyBigInts(this.hash),
          fromX: stringifyBigInts(this.fromX),
          fromY: stringifyBigInts(this.fromY),
          fromIndex: this.fromIndex,
          toX: stringifyBigInts(this.toX),
          toY: stringifyBigInts(this.toY),
          toIndex: stringifyBigInts(this.toIndex),
          nonce: this.nonce,
          amount: this.amount,
          tokenType: this.tokenType,
          R8x: stringifyBigInts(this.R8x),
          R8y: stringifyBigInts(this.R8y),
          S: stringifyBigInts(this.S),
          status: this.status,
          txRoot: "",
        }
      ];
      console.log(
        'serialising tx',
        tx
      )
      return new Buffer(JSON.stringify(tx));
    }

    // async validate() {
    //   // validate the tx with all the checks snark will do
    //   // return true/false

    //   this.checkTokenTypes()
    //   this.checkSignature()
    //   this.checkSenderBalance()

    // }

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
      // // assign Indexes
      // var indexes = await this.findIndex();

      // insert tx into DB and/or update
      var result = await knex("tx").insert({
        hash: await this.hashTx().toString(),
        fromX: this.fromX,
        fromY: this.fromY,
        fromIndex: this.fromIndex,
        toX: this.toX,
        toY: this.toY,
        nonce: this.nonce,
        toIndex: this.toIndex,
        tokenType: this.tokenType,
        amount: this.amount,
        R8x: this.R8x,
        R8y: this.R8y,
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


    hashTx() {
      var txHash = mimcjs.multiHash([
        stringifyBigInts(this.fromX),
        stringifyBigInts(this.fromY),
        this.fromIndex,
        stringifyBigInts(this.toX),
        stringifyBigInts(this.toY),
        this.amount,
        this.nonce,
        this.tokenType
      ]);

      return txHash;
    }

    checkSignature(){
      const signature = {
          R8: [this.R8x, this.R8y],
          S: this.S
      }
      const signed = eddsa.verifyMiMC(
          this.hash, signature, [this.fromX, this.fromY]
      )
      if (!signed){
          throw "transaction was not signed by sender"
      }
    }

}


