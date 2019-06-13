import { prv2pub } from '../circomlib/src/eddsa';


class User {
    constructor(name, privkey) {
        this.name = name
        this.privkey = Buffer.from(privkey.toString().padStart(64, '0'), "hex");
        this.pubkey = prv2pub(this.privkey);
        this.X = this.pubkey[0].toString();
        this.Y = this.pubkey[1].toString();
    }
}

const Alice = new User('Alice', 2);
const Bob = new User('Bob', 5);

export default {
    Alice,
    Bob,
}