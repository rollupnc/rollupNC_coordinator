import { prv2pub } from '../circomlib/src/eddsa';


class User {
    constructor(privkeyStr) {
        this.privkey = Buffer.from(privkeyStr.padStart(64, '0'), "hex");
        this.pubkey = prv2pub(this.privkey);
        this.X = this.pubkey[0].toString();
        this.Y = this.pubkey[1].toString();
    }
}

const Alice = new User("2");
const Bob = new User("5");

export default {
    Alice,
    Bob,
}