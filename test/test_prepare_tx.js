import { prepTxs } from '../src/utils';
import Transaction from '../src/transaction.js';
import { Alice, Bob } from './fixtures';

function createTx(from, to, amount, tokenType) {
    const tx = new Transaction(from.X, from.Y, to.X, to.Y, amount, tokenType, null, null, null);
    tx.sign(from.privkey);
    return tx
}

function createTxs() {
    const tx1 = createTx(Alice, Bob, 100, 0);
    const tx2 = createTx(Bob, Alice, 50, 0);
    const tx3 = createTx(Alice, Bob, 25, 0);
    const tx4 = createTx(Bob, Alice, 12, 0);
    return [tx1, tx2, tx3, tx4]
}


describe('Prepare Tx', () => {
    it('should repare txs sucessfully', (done) => {
        const txs = createTxs();
        prepTxs(txs).catch(done).then(done);
    })
})
