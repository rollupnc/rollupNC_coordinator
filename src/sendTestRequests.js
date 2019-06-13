import request from 'request';
import Transaction from './transaction.js';
import Poller from './poller.js';
import {Alice, Bob} from '../test/fixtures';
import DB from './db.js'

const url = "http://localhost:3000/submitTx";

function formatSignature(tx) {
    return {
        R8: `${tx.R1},${tx.R2}`,
        S: tx.S.toString(),
    }
}

function submitTx(from, to, nonce, amount, tokenType) {
    console.log(`${from.name} send ${to.name} ${amount} of token ${tokenType}`)
    const tx = new Transaction(
        from.X, from.Y, to.X, to.Y, nonce, amount, tokenType, 
        null, null, null)
    tx.sign(from.privkey)
    const json = {
        fromX: tx.fromX,
        fromY: tx.fromY,
        toX: tx.toX,
        toY: tx.toY,
        nonce: tx.nonce,
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


var sender = Alice;
var receiver = Bob;
var tmp;


const poller = new Poller(1000);
poller.poll()
poller.onPoll(async () => {
    // const nonce = 0;
    submitTx(sender, receiver, sender.nonce, 500, 0)
    sender.nonce ++;
    tmp = sender
    sender = receiver
    receiver = tmp;
    poller.poll()
})
