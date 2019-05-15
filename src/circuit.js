import utils from './utils';
import zkSnark from 'snarkjs';
import fs from 'fs';
// const circuitDef = JSON.parse(fs.readFileSync("../snark/trasfer.cir", "utf8"));
// const circuit = new zkSnark.Circuit(circuitDef);
// const vk_proof = JSON.parse(fs.readFileSync("../snark/myCircuit.vk_proof", "utf8"));

async function createProof(...txs) {
  var input = await utils.prepTxs(txs);
  // var witness = circuit.calculateWitness(inputToSnark);
  // var { proof, publicSignals } = zkSnark.genProof(vk_proof, witness);
  // send proof to mainchain 
}

export default createProof;