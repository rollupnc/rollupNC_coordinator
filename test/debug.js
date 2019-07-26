import eddsa from '../circomlib/src/eddsa.js'
import {stringifyBigInts, unstringifyBigInts} from '../src/helpers/stringifybigint.js'
import mimcjs from '../circomlib/src/mimc7.js'
import Account from "../src/models/account.js"

// const account = new Account(0, "0", "0", 0, 0, 0)
// console.log(
//   account.hashAccount()
// )

console.log(mimcjs.multiHash([0,1]))
console.log(mimcjs.multiHash([1,0]))