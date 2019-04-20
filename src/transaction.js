const getFields = () => [
  {
    name: "from",
    default: new Buffer([])
  },
  {
    name: "to",
    default: new Buffer([])
  },
  {
    name: "nonce",
    default: new Buffer([])
  },
  {
    name: "amount",
    default: new Buffer([])
  },
  {
    name: "A",
    default: new Buffer([])
  },
  {
    name: "R",
    default: new Buffer([])
  },
  {
    name: "S",
    default: new Buffer([])
  }
];

// class transaction
export default class Transaction {
  constructor({ from = "", to = "" }) {
    this.from = from;
    this.to = to;
  }

  /**
   * sign a transaction with a given a private key
   * @param {Buffer} privateKey
   */
  sign(privateKey) {
    // sign on transaction using private key
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
    // gives out the type of transaction
    // returns enum{transfer,withdraw}
  }
}
