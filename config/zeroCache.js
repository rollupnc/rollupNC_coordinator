import fs from 'fs'
import Account from '../src/models/account'
import Tree from '../src/models/tree'
import {stringifyBigInts, unstringifyBigInts} from '../src/helpers/stringifybigint.js'


/*

generate empty nodes for an accounts tree of depth 12

*/

const zeroLeaf = new Account(0,'0','0',0,0,0)
const zeroHash = zeroLeaf.hashAccount()

console.log('zeroHash', zeroHash)

const depth = global.gConfig.balance_depth
const numLeaves = 2**depth

const leaves = new Array(numLeaves).fill(zeroHash)

const zeroTree = new Tree(leaves)

console.log('root', zeroTree.root)

var zeroCache = [stringifyBigInts(zeroHash)]

for (var i = depth - 1; i >= 0; i--){
    zeroCache.push(stringifyBigInts(zeroTree.innerNodes[i][0]))
}

fs.writeFileSync('./config/zeroCache.json', JSON.stringify(zeroCache, null, 4))
