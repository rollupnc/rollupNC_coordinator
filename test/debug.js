import eddsa from '../circomlib/src/eddsa.js'
import {stringifyBigInts, unstringifyBigInts} from '../src/helpers/stringifybigint.js'
import mimcjs from '../circomlib/src/mimc7.js'



const fromX = '1102783475727420799824429280361500241527876129682014670706693295089553324385'
const fromY = '9392313865617698932662671232532038469072627484987666912697828521155375884180'
const fromIndex = 1
const toX = '1102783475727420799824429280361500241527876129682014670706693295089553324385'
const toY = '9392313865617698932662671232532038469072627484987666912697828521155375884180'
const nonce = 0
const amount = 10
const tokenType = 0

const computedHash = mimcjs.multiHash(
    [
        unstringifyBigInts(fromX), 
        unstringifyBigInts(fromY), 
        fromIndex.toString(),
        unstringifyBigInts(toX), 
        unstringifyBigInts(toY),
        nonce.toString(), amount.toString(), tokenType.toString()
    ]
)

console.log(computedHash)

const hash = "8083793228606684046177105455433186641744295915882915427705920391532710939034" 

const signature = {
  R8:
  [ "4660470690772651164838604229108228927571728176266747959824037187144377338724",
    "9374254677828662439543769030396700608244679736680163085678646469790962568605"],
 S:
  "1016951726028821200862767450035820792627469329167814185009265040066074442576"
} 

const pubkey = [
  "4030750229537636247299318128026900891965480669493665088450786688564040339933",
  "672570605321006747964616389091144246963102572719449714443475738284124378990" 
] 

console.log(
  eddsa.verifyMiMC(
    // stringifyBigInts(hash),
    // stringifyBigInts(signature),
    // stringifyBigInts(pubkey)
    unstringifyBigInts(hash),
    unstringifyBigInts(signature),
    unstringifyBigInts(pubkey)
  )
)