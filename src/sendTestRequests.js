import request from 'request';
import Transaction from './transaction.js';
import Poller from './poller.js';

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

const Alice = {
    name: 'alice',
    X: '5686635804472582232015924858874568287077998278299757444567424097636989354076',
    Y: '20652491795398389193695348132128927424105970377868038232787590371122242422611',
    privateKey: Buffer.from("2".padStart(64, '0'), "hex"),
}
const Bob = {
    name: 'bob',
    X: '5188413625993601883297433934250988745151922355819390722918528461123462745458',
    Y: '12688531930957923993246507021135702202363596171614725698211865710242486568828',
    privateKey: Buffer.from("5".padStart(64, '0'), "hex"),
}
const Charlie = {
    name: 'charlie',
    X: "3765814648989847167846111359329408115955684633093453771314081145644228376874",
    Y: "9087768748788939667604509764703123117669679266272947578075429450296386463456",
    privateKey: Buffer.from("100".padStart(64, '0'), "hex"),
}
const Zero = {
    name: 'reserved_zero_account',
    X: 0,
    Y: 0,
}
// submitTx(Alice, Bob, 500, 0)
// submitTx(Bob, Zero, 500, 10)
// submitTx(Alice, Charlie, 500, 10)
// submitTx(Charlie, Bob, 250, 10)

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
