import Tree from "./tree.js"
import Transaction from "./transaction.js"
import fs from 'fs'
import knex from "../../DB/dbClient.js";
import * as treeHelper from "../helpers/treeHelper.js"

const zeroCache = JSON.parse(fs.readFileSync('./config/zeroCache.json'))

export default class AccountTree extends Tree{
    constructor(
        _accounts,
        fullHeight
    ){
        super(_accounts.map(x => x.hashAccount()))
        this.accounts = _accounts
        this.fullHeight = fullHeight
        this.sparseProof = this.getSparseProof()
        this.fullRoot = treeHelper.rootFromLeafAndPath(
            this.root, 0, this.sparseProof
        )
    }


    getSparseProof(){
        const subtreeHeight = Math.log2(this.accounts.length);
        const subtreeDepth = this.fullHeight - subtreeHeight
        var sparseProof = new Array()
        for (var i = 0; i < subtreeDepth; i++){
            sparseProof.push(zeroCache[subtreeDepth - i])
        }
        return sparseProof
    }

    async save(){
        for (var i = 0; i < this.leafNodes.length; i++){
            var result = await knex.insert({
                depth: this.depth,
                index: i,
                hash: this.leafNodes[i]
            }).into('account_tree')
            .onDuplicateUpdate('hash');
        }
        for (var i = 0; i < this.innerNodes.length; i++){
            for (var j = 0; j < this.innerNodes[i].length; j++){
                var result = await knex.insert({
                    depth: i,
                    index: j,
                    hash: this.innerNodes[i][j]
                }).into('account_tree')
                .onDuplicateUpdate('hash');
            }
        }
    }

    async processTxArray(txTree){

        console.log("processing txArray. this may take a while...")

        const originalState = this.fullRoot;
        const txs = txTree.txs;

        // var paths2txRoot = new Array(txs.length);
        // var paths2txRootPos = new Array(txs.length);
        // var deltas = new Array(txs.length);
        var paths2txRoot = []
        var paths2txRootPos = []
        var deltas = []

        for (const tx of txs){

            // const tx = txs[i];

            // verify tx exists in tx tree
            const [txProof, txProofPos] = txTree.getTxProofAndProofPos(tx);
            txTree.checkTxExistence(tx, txProof);
            // paths2txRoot[i] = txProof;
            // paths2txRootPos[i] = txProofPos;
            paths2txRoot.push(txProof)
            paths2txRootPos.push(txProofPos)

            // process transaction
            // console.log('processing tx', i)
            // console.log('root at ', i, this.root)
            // deltas[i] = await this.processTx(tx)
            deltas.push(await this.processTx(tx))

        }

        await this.save()

        return {
            originalState: originalState,
            txTree: txTree,
            paths2txRoot: paths2txRoot,
            paths2txRootPos: paths2txRootPos,
            deltas: deltas
        }

    }

    async processTx(tx){
        // const sender = this.findAccountByPubkey(tx.fromX, tx.fromY);
        const sender = this.accounts[tx.fromIndex];
        const indexFrom = sender.index;
        const balanceFrom = sender.balance;

        // for (var i = 0; i < this.innerNodes.length; i++){
        //     console.log('depth', i, this.innerNodes[i])
        // }
		// console.log('accounts', this.leafNodes)
		
        const [senderProof, senderProofPos] = this.getAccountProof(sender);
        this.checkAccountExistence(sender, senderProof);
        tx.checkSignature();
        this.checkTokenTypes(tx);

		var newSender = await sender.debitAndIncreaseNonce(tx.amount)
		var newSenderHash = newSender.hash

		this.accounts[sender.index] = newSender
        this.leafNodes[sender.index] = newSenderHash
        this.updateInnerNodes(newSenderHash, sender.index, senderProof);
        this.root = this.innerNodes[0][0]
        const rootFromNewSender = this.root;
        // console.log("rootFromNewSender", rootFromNewSender)
		const fullRootFromNewSender = treeHelper.rootFromLeafAndPath(rootFromNewSender, 0, this.sparseProof)
		this.fullRoot = fullRootFromNewSender

        // const receiver = this.findAccountByPubkey(tx.toX, tx.toY);
        const receiver = this.accounts[tx.toIndex];
        const indexTo = receiver.index;
        const balanceTo = receiver.balance;
        const nonceTo = receiver.nonce;
        const tokenTypeTo = receiver.tokenType;
		const [receiverProof, receiverProofPos] = this.getAccountProof(receiver);
        this.checkAccountExistence(receiver, receiverProof);
        
        var newReceiver = await receiver.credit(tx.amount)
		var newReceiverHash = newReceiver.hash
		
		this.accounts[receiver.index] = newReceiver
        this.leafNodes[receiver.index] = newReceiverHash;
        this.updateInnerNodes(newReceiverHash, receiver.index, receiverProof);
        this.root = this.innerNodes[0][0]
        const rootFromNewReceiver = this.root;
        const fullRootFromNewReceiver = treeHelper.rootFromLeafAndPath(rootFromNewReceiver, 0, this.sparseProof)
		this.fullRoot = fullRootFromNewReceiver

        // console.log('rootFromNewReceiver', rootFromNewReceiver)

        return {
            senderProof: senderProof.concat(this.sparseProof),
            senderProofPos: senderProofPos.concat(new Array(this.sparseProof.length).fill(0)),
            rootFromNewSender: fullRootFromNewSender,
            receiverProof: receiverProof.concat(this.sparseProof),
            receiverProofPos: receiverProofPos.concat(new Array(this.sparseProof.length).fill(0)),
            rootFromNewReceiver: fullRootFromNewReceiver,
            indexFrom: indexFrom,
            balanceFrom: balanceFrom,
            indexTo: indexTo,
            balanceTo: balanceTo,
            nonceTo: nonceTo,
            tokenTypeTo: tokenTypeTo
        }

    }

    checkTokenTypes(tx){
        // const sender = this.findAccountByPubkey(tx.fromX, tx.fromY)
        // const receiver = this.findAccountByPubkey(tx.toX, tx.toY)
        const sender = this.accounts[tx.fromIndex];
        const receiver = this.accounts[tx.toIndex];
        const sameTokenType = (
            (tx.tokenType == sender.tokenType && tx.tokenType == receiver.tokenType)
            || receiver.tokenType == 0 //withdraw token type doesn't have to match
        );
        if (!sameTokenType){
            throw "token types do not match"
        }
    }

    checkAccountExistence(account, accountProof){
		console.log(
			"this.fullRoot", this.fullRoot
		)
        if (!this.verifyProof(account.hash, account.index, accountProof)){
            console.log('given account hash', account.hash)
            console.log('given account proof', accountProof)
            throw "account does not exist"
        }
    }

    getAccountProof(account){
        return this.getProof(account.index)
    }

    generateEmptyTx(pubkeyX, pubkeyY, index, prvkey){
        // const sender = this.findAccountByPubkey(pubkeyX, pubkeyY);
        const sender = this.accounts[tx.fromIndex];
        const nonce = sender.nonce;
        const tokenType = sender.tokenType;
        var tx = new Transaction(
            pubkeyX, pubkeyY, index,
            pubkeyX, pubkeyY,
            nonce, 0, tokenType
        );
        tx.signTxHash(prvkey);
    }

}
