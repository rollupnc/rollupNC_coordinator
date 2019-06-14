const snarkjs = require("snarkjs");
const buildWitness = require("./buildwitness")
const {unstringifyBigInts} = require("./stringifybigint.js");

module.exports = {

    generateCall: function(p){
        proof =  unstringifyBigInts(p);
        function p256(n) {
            let nstr = n.toString(16);
            while (nstr.length < 64) nstr = "0"+nstr;
            nstr = "0x" + nstr;
            return nstr;
        }
        const call = {
            a: [p256(proof['pi_a'][0]), p256(proof["pi_a"][1])],
            b: [[p256(proof["pi_b"][0][1]), p256(proof["pi_b"][0][0])],[
                p256(proof["pi_b"][1][1]), p256(proof["pi_b"][1][0])]],
            c: [p256(proof["pi_c"][0]), p256(proof["pi_c"][1])]
        }
        return call
    },

    calculateWitness: function(cirDef, inputs){
        circuit = new snarkjs.Circuit(cirDef);
        witness = circuit.calculateWitness(inputs);
        witnessBin = buildWitness.buildWitness(witness)
        return witnessBin
    }
}