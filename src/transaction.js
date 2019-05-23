// class transaction
export default class Transaction {
  constructor(_fromX, _fromY, _toX, _toY, _amount, _tokenType, _sig) {
    this.fromX = _fromX;
    this.fromY = _fromY;

    this.toX = _toX;
    this.toY = _toY;


    this.amount = _amount
    this.tokenType = _tokenType;
    this.sig = _sig
  }

  /**
   * sign a transaction with a given a private key
   * @param {Buffer} privateKey
   */
  sign(privateKey) {
    // sign on transaction using private key
  }

  serialise() {
    var tx = [{
      fromX: this.fromX,
      fromY: this.fromY,
      toX: this.toX,
      toY: this.toY,
      tokenType: this.tokenType,
      amount: this.amount,
    }];
    return (new Buffer(JSON.stringify(tx)))
  }

  async validate() {
    // validate the tx with all the checks snark will do
    // return true/false
  }

  //
  // utils methods
  //

  // checks if tx is dependant or not
  _isDependant() {
    // check and return true/false
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
