import DB from './db'

const bigInt = require("snarkjs").bigInt;

// console.log(await db.getAllAccounts())

async function start() {
  var pubkey = '5686635804472582232015924858874568287077998278299757444567424097636989354076'
  console.log(bigInt(pubkey))
  // console.log(await DB.getAllAccounts())

}
start()