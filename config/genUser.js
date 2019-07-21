import eddsa from '../circomlib/src/eddsa.js'
import {bigInt} from 'snarkjs'
import {stringifyBigInts, unstringifyBigInts} from '../src/helpers/stringifybigint.js'
import Account from '../src/models/account.js'

export default function genUser(
    name = '', 
    index = 0,
    balance = 0,
    nonce = 0,
    tokenType = 0
){
    const length = 64

    const prvkeyInt = bigInt(
        Math.floor(Math.pow(10, length-1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length-1) - 1))
    )
    const prvkey = Buffer.from(
        stringifyBigInts(prvkeyInt),
        'hex'
    )
    console.log(name, 'prvkey buffer', prvkey)
    const prvkeyString = stringifyBigInts(prvkeyInt)
    console.log(name, 'prvkey string', prvkeyString)
    const pubkey = eddsa.prv2pub(prvkey)
    const pubkeyString = stringifyBigInts(pubkey)
    console.log(name, 'pubkey:', pubkeyString)

    var leaf = new Account(
        index,
        pubkeyString[0],
        pubkeyString[1],
        balance,
        nonce,
        tokenType
    )

    return {
        pubkeyString: pubkeyString,
        prvkeyString: prvkeyString,
        leaf: leaf
    }

}
