import { prv2pub } from '../circomlib/src/eddsa';
import Account from '../src/account';


class User {
    constructor(name, index, privkey) {
        this.name = name
        this.index = index
        this.privkey = Buffer.from(privkey.toString().padStart(64, '0'), "hex");
        this.pubkey = prv2pub(this.privkey);
        this.X = this.pubkey[0].toString();
        this.Y = this.pubkey[1].toString();
        this.nonce = 0;
    }
    to_account(){
        return new Account(this.index, this.X, this.Y, 10000, 0, 10)
    }
}

const Alice = new User('Alice',2, 2);
const Bob = new User('Bob',3, 5);

export default {
    Alice,
    Bob,
}