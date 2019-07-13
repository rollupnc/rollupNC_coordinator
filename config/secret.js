const fs = require('fs');
const bigInt = require('snarkjs').bigInt
const eddsa = require('../circomlib/src/eddsa.js')
const {stringifyBigInts, unstringifyBigInts} = require('../src/snark_utils/stringifybigint.js')
let configFile = require('./config.json')

const length = 64

const user = "root"

console.log('user:', user)

const password = "123"

console.log('password:', password)

const prvkeyInt = bigInt(
    Math.floor(Math.pow(10, length-1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length-1) - 1))
)

const prvkey = Buffer.from(
    stringifyBigInts(prvkeyInt),
    'hex'
)

console.log('prvkey:', stringifyBigInts(prvkeyInt))

const pubkey = eddsa.prv2pub(prvkey)

console.log('pubkey:', stringifyBigInts(pubkey))

configFile.development.user = user;
configFile.development.password = password;
configFile.development.pubkey = stringifyBigInts(pubkey);
configFile.development.prvkey = stringifyBigInts(prvkeyInt);

config = JSON.stringify(configFile)

fs.writeFileSync('./config/config.json', config)

