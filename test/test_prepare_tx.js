import { prepTxs } from "../src/helpers/utils";
import Transaction from "../src/models/transaction.js";
import { Zero, Coordinator, Alice, Bob } from "./fixtures";
import DB from "../src/db";
import knex from "../DB/dbClient.js";
import Account from "../src/models/account";
import { isZero } from "snarkjs/src/bigint";

async function createTx(from, to, nonce, amount, tokenType) {
  // User create a signed transcation
  const tx = new Transaction(
    from.X,
    from.Y,
    to.X,
    to.Y,
    nonce,
    amount,
    tokenType,
    null,
    null,
    null
  );
  tx.sign(from.privkey);
  // Relayer add indices of sender and receiver to it.
  await tx.addIndex();
  return tx;
}

async function createTxs() {
  const tx1 = await createTx(Alice, Bob, 0, 100, 0);
  const tx2 = await createTx(Bob, Alice, 0, 50, 0);
  const tx3 = await createTx(Alice, Bob, 1, 25, 0);
  const tx4 = await createTx(Bob, Alice, 1, 12, 0);
  return [tx1, tx2, tx3, tx4];
}

describe("Prepare Tx", () => {
  beforeEach(async () => {
    await knex.migrate.latest();
    await Zero.to_account().save();
    await Coordinator.to_account().save();
    await Alice.to_account().save();
    await Bob.to_account().save();
  });
  afterEach(async () => {
    await knex("accounts").del();
  });
  it("should repare txs sucessfully", async () => {
    const txs = await createTxs();
    await prepTxs(txs);
  });
});
