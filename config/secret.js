import fs from 'fs'
import configFile from './config.json'
import Account from '../src/models/account.js'
import genUser from "./genUser.js"

// db settings

const user = "root"
console.log('user:', user)
const password = "123"
console.log('password:', password)

configFile.development.user = user;
configFile.development.password = password;

// coordinator account
const coordinator = genUser('coordinator', 1)
configFile.development.pubkey = coordinator.pubkeyString;
configFile.development.prvkey = coordinator.prvkeyString;

// Alice account
const alice = genUser('alice', 2, 0, 0, 1) // tokenType = 1
configFile.development.alicePubkey = alice.pubkeyString;
configFile.development.alicePrvkey = alice.prvkeyString;

// Bob account
const bob = genUser('bob', 3, 0, 0, 1) // tokenType = 1
configFile.development.bobPubkey = bob.pubkeyString;
configFile.development.bobPrvkey = bob.prvkeyString;

// write to config.json
const config = JSON.stringify(configFile, null, 4)
fs.writeFileSync('./config/config.json', config)

// write to genesis.json
const zeroLeaf = new Account(0,"0","0",0,0,0);

const genesisObj = {
    "accounts": [
        zeroLeaf,
        coordinator.leaf
    ]
}

const genesis = JSON.stringify(genesisObj, null, 4)
fs.writeFileSync('./config/genesis.json', genesis)

// write to preset-genesis.json
const presetGenesisObj = {
    "accounts": [
        zeroLeaf,
        coordinator.leaf,
        alice.leaf,
        bob.leaf
    ]
}

const presetGenesis = JSON.stringify(presetGenesisObj, null, 4)
fs.writeFileSync('./config/preset-genesis.json', presetGenesis)
