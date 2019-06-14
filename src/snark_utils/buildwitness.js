const bigInt = require("big-integer");
const assert = require("assert");
const fs = require("fs");

module.exports = {

    writeUint32: function(h, val) {
        h.dataView.setUint32(h.offset, val, true);
        h.offset += 4;
    },
    
    
    writeBigInt: function(h, bi) {
        for (let i=0; i<8; i++) {
            bi = bigInt(bi)
            const v = bi.shiftRight(i*32).and(0xFFFFFFFF).toJSNumber();
            this.writeUint32(h, v);
        }
    },
    
    
    calculateBuffLen: function(witness) {
    
        let size = 0;
    
        // beta2, delta2
        size += witness.length * 32;
    
        return size;
    },

    toArrayBuffer: function(buf) {
        var ab = new ArrayBuffer(buf.length);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buf.length; ++i) {
            view[i] = buf[i];
        }
        return ab;
    },
    
    buildWitness: function(witness){
        const buffLen = module.exports.calculateBuffLen(witness);
    
        const buff = new ArrayBuffer(buffLen);
    
        const h = {
            dataView: new DataView(buff),
            offset: 0
        };
    
    
        // writeUint32(h, witness.length);
    
        for (let i=0; i<witness.length; i++) {
            module.exports.writeBigInt(h, witness[i]);
        }

        assert.equal(h.offset, buffLen);

        return module.exports.toArrayBuffer(Buffer.from(buff))

    }
}

