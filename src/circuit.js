import utils from './utils';
async function createProof(...txs) {
  var inputToSnark = await utils.prepTxs(txs);

}

export default createProof