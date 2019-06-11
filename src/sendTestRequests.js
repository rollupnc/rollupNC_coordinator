import request from 'request';
import Transaction from './transaction.js';
import Poller from './poller.js';
import {prv2pub} from '../circomlib/src/eddsa';

const url = "http://localhost:3000/submitTx";

function formatSignature(tx) {
    return {
        R8: `${tx.R1},${tx.R2}`,
        S: tx.S.toString(),
    }
}

function submitTx(from, to, amount, tokenType, signature) {
    console.log(`${from.name} send ${to.name} ${amount} of token ${tokenType}`)
    const tx = new Transaction(from.X, from.Y, to.X, to.Y, amount, tokenType, null, null, null)
    tx.sign(from.privateKey)
    const json = {
        fromX: tx.fromX,
        fromY: tx.fromY,
        toX: tx.toX,
        toY: tx.toY,
        amount: tx.amount,
        tokenType: tx.tokenType,
        signature: formatSignature(tx),
    }
    request.post({ url, json },
        function (error, response, body) {
            if (error) {
                return console.error('TX failed:', error);
            }
            console.log('Tx successful!  Server responded with:', body);
        }
    )
}

const alice_privkey =  Buffer.from("2".padStart(64, '0'), "hex");
const alice_pubkey = prv2pub(alice_privkey)
const Alice = {
    name: 'alice',
    X: alice_pubkey[1].toString(),
    Y: alice_pubkey[0].toString(),
    privateKey: alice_privkey,
}
const bob_privkey =  Buffer.from("5".padStart(64, '0'), "hex");
const bob_pubkey = prv2pub(bob_privkey)
const Bob = {
    name: 'bob',
    X: bob_pubkey[1].toString(),
    Y: bob_pubkey[0].toString(),
    privateKey: bob_privkey,
}

var sender = Alice;
var receiver = Bob;
var tmp;

const poller = new Poller(1000);
poller.poll()
poller.onPoll(() => {
    submitTx(sender, receiver, 500, 0)
    tmp = sender
    sender = receiver
    receiver = tmp;
    poller.poll()
})
