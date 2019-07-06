import utils from './helpers/utils';
import config from '../config/config.js';
import logger from './helpers/logger';
import knex from '../DB/dbClient'
import db from './db'

const q = global.gConfig.tx_queue;
const maxTxs = global.gConfig.txs_per_snark;

// empties queue after validation check 
// dumps valid transactions in `mempool` table
// makes querying easier.
export default class Mempool {
  async StartSync() {
    let conn = await utils.getConn();
    let ch = await conn.createChannel();
    let res = await ch.assertQueue(q, { durable: true });

    ch.consume(q, async msg => {
      var txCount = await db.getTxCount()
      console.log("Total transactions in mempool", txCount)
      var tx = utils.JSON2Tx(msg.content)
      // TODO add all  validation components here 
      // 1. Check all input lengths
      // 2. Check signature 
      // 3. Check all snark constraints 
      // 4. Reject duplicate transactions 
      // 5. Reject if mempool at capacity
      // IFF everything passes and the tx is likey to go through, persist the tx to DB 
      var res = await tx.save()
      // logger.info("Transaction passed all validation, adding to mempool", { tx: msg.content.toString() });
    }, { noAck: true });
  }

}

