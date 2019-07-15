import mimcjs from "../../circomlib/src/mimc7.js";
import { bigInt } from 'snarkjs';


export function rootFromLeafAndPath(leaf, idx, merkle_path){
    if (merkle_path.length > 0){
        const depth = merkle_path.length;
        const merkle_path_pos = idxToBinaryPos(idx, depth)
        var root = new Array(depth);
        var left = bigInt(leaf) - bigInt(merkle_path_pos[0])*(bigInt(leaf) - bigInt(merkle_path[0]));
        var right = bigInt(merkle_path[0]) - bigInt(merkle_path_pos[0])*(bigInt(merkle_path[0]) - bigInt(leaf));
        root[0] = mimcjs.multiHash([left, right]);
        for (var i = 1; i < depth; i++) {
            var left = root[i-1] - bigInt(merkle_path_pos[i])*(root[i-1] - bigInt(merkle_path[i]));
            var right = bigInt(merkle_path[i]) - bigInt(merkle_path_pos[i])*(bigInt(merkle_path[i]) - root[i-1]);              
            root[i] = mimcjs.multiHash([left, right]);
        }
        return root[depth - 1];
    } else {
        return leaf
    }

}


export function innerNodesFromLeafAndPath(leaf, idx, merkle_path){
    if (merkle_path.length > 0){
        const depth = merkle_path.length;
        const merkle_path_pos = idxToBinaryPos(idx, depth)
        var innerNodes = new Array(depth);
        var left = bigInt(leaf) - bigInt(merkle_path_pos[0])*(bigInt(leaf) - bigInt(merkle_path[0]));
        var right = bigInt(merkle_path[0]) - bigInt(merkle_path_pos[0])*(bigInt(merkle_path[0]) - bigInt(leaf));
        innerNodes[0] = mimcjs.multiHash([left, right]);
        for (var i = 1; i < depth; i++) {
            var left = innerNodes[i-1] - bigInt(merkle_path_pos[i])*(innerNodes[i-1] - bigInt(merkle_path[i]));
            var right = bigInt(merkle_path[i]) - bigInt(merkle_path_pos[i])*(bigInt(merkle_path[i]) - innerNodes[i-1]);              
            innerNodes[i] = mimcjs.multiHash([left, right]);
        }
        return innerNodes;
    } else {
        return leaf
    }

}

export function proofPos(leafIdx, treeDepth){
    var proofPos = new Array(treeDepth);
    const proofBinaryPos = idxToBinaryPos(leafIdx, treeDepth);
    // console.log('proofPos', proofPos)

    if (leafIdx % 2 == 0){
        proofPos[0] = leafIdx + 1;
    } else {
        proofPos[0] = leafIdx - 1;
    }

    for (var i = 1; i < treeDepth; i++){
        if (proofBinaryPos[i] == 1){
            proofPos[i] = Math.floor(proofPos[i - 1] / 2) - 1;
        } else {
            proofPos[i] = Math.floor(proofPos[i - 1] / 2) + 1;
        }
    }

    return(proofPos)
}

export function getAffectedPos(proofPos){
    var affectedPos = new Array(proofPos.length);

    // skip the first node in the proof since it is not affected
    for (var i = 1; i < proofPos.length; i++){
        // if proof node has odd index (i.e. is the right sibling)
        if (proofPos[i] & 1){
            affectedPos[i - 1] = proofPos[i] - 1; // affected node is left sibling
        // if proof node has even index (i.e. is the left sibling)
        } else {
            affectedPos[i - 1] = proofPos[i] + 1; // affected node is right sibling
        }
    }

    affectedPos[proofPos.length - 1] = 0; // the root

    return affectedPos;
}

export function binaryPosToIdx(binaryPos){
    var idx = 0;
    for (i = 0; i < binaryPos.length; i++){
        idx = idx + binaryPos[i]*(2**i)
    }
    return idx;
}

export function idxToBinaryPos(idx, binLength){

    const binString = idx.toString(2);
    var binPos = Array(binLength).fill(0)
    for (var j = 0; j < binString.length; j++){
        binPos[j] = Number(binString.charAt(binString.length - j - 1));
    }
    return binPos;
}

export function pairwiseHash(array){
    if (array.length % 2 == 0){
        var arrayHash = []
        for (var i = 0; i < array.length; i = i + 2){
            arrayHash.push(mimcjs.multiHash(
                [array[i].toString(),array[i+1].toString()]
            ))
        }
        return arrayHash
    } else {
        console.log('array must have even number of elements')
    }
}

export function getBase2Log(y){
    return Math.log(y) / Math.log(2);
}

// fill an array with a fillerLength copies of a value
export function padArray(leafArray, padValue, fillerLength){
    if (Array.isArray(leafArray)){
        var arrayClone = leafArray.slice(0)
        const nearestPowerOfTwo = Math.ceil(getBase2Log(leafArray.length))
        const diff = fillerLength || 2**nearestPowerOfTwo - leafArray.length
        for (var i = 0; i < diff; i++){
            arrayClone.push(padValue)
        }
        return arrayClone
    } else {
        console.log("please enter pubKeys as an array")
    }
}
