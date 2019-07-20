import knex from "../../DB/dbClient.js";


// finds index based on nonce+fromX+tokenType
// TODO enhance by searching balance > amount
async function getAccountFromPubkey(pubkeyX, pubkeyY) {
    const account = await knex("accounts")
        .where({
        pubkeyX: pubkeyX,
        pubkeyY: pubkeyY
        // tokenType: this.tokenType
        })
        .first();
    return account;
}

export default{
    getAccountFromPubkey
}