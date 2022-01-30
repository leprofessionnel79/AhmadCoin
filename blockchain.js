const SHA256 = require("crypto-js/sha256");
const EC = require('elliptic');
const ec = new EC.ec('secp256k1');
const debug = require('debug')('ahmad_blockchain:blockchain');



class Transaction{
    constructor(fromAddress,toAddress,amount){
        this.fromAddress=fromAddress;
        this.toAddress=toAddress;
        this.amount=amount;
    }

    calculateHash(){
        return SHA256(this.fromAddress+this.toAddress+this.amount).toString();
    }

    signTransaction(signingKey){
        if(signingKey.getPublic('hex')!==this.fromAddress){
            throw new Error('you cant sign transaction to other wallets');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx,'base64');
        this.signature = sig.toDER('hex');
    }

    isValid(){
        if(this.fromAddress===null) return true;

        if(!this.signature || this.signature.length===0){
            throw new Error('No signature in this Transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress,'hex');
        return publicKey.verify(this.calculateHash(),this.signature);
    }
}

class Block{
    constructor(timestamp,transactions,prevHash=''){
        
        this.timestamp=timestamp;
        this.transactions=transactions;
        this.prevHash=prevHash;
        this.nonce=0;
        this.hash=this.calculateHash();
    }

    calculateHash(){
        return SHA256(this.index+this.timestamp+JSON.stringify(this.transactions)+this.prevHash+this.nonce).toString();
    }

    mineBlock(difficulty){
        while((this.hash.substring(0,difficulty))!== Array(difficulty+1).join('0'))
        {
            this.nonce++;
            this.hash=this.calculateHash();

        }

        console.log('maining succesfull ....'+this.hash);
    }

    hasValidTransaction(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }
        return true;
    }

}

class Blockchain{
            constructor(){
                this.chain=[this.addGenesisBlock()];
                this.difficulty=2;
                this.pendingTransactions=[];
                this.miningReward=200;
                
            }

            addGenesisBlock(){
                return new Block(Date.parse('1/1/2022'),[],"0");
            }

            getLastBlock(){
                return this.chain[this.chain.length-1];
            }

            minePendingTransactions(miningRewardAddress){
            
            const rewardTx = new Transaction(null,miningRewardAddress,this.miningReward);
            this.pendingTransactions.push(rewardTx);


            let block= new Block(Date.now(),this.pendingTransactions,this.getLastBlock().hash);
            block.mineBlock(this.difficulty);

            // console.log('block mining succefull ...\n');

            this.chain.push(block);

            

            this.pendingTransactions=[];

            
            
            }

            addTransaction(transaction){

                if(!transaction.fromAddress || !transaction.toAddress){
                    throw new Error('transaction must include from and to address');
                }

                if(!transaction.isValid()){
                    throw new Error('cant add invalid transaction to chain');
                }

                if (transaction.amount <= 0) {
                    throw new Error('Transaction amount should be higher than 0');
                  }
                  
                  // Making sure that the amount sent is not greater than existing balance
                //   if (this.getBalanceOfAddress(transaction.fromAddress) < transaction.amount) {
                //     throw new Error('Not enough balance');
                //   }

                  
                this.pendingTransactions.push(transaction);
                debug('transaction added: %s', transaction);
            }

            getBalanceOfAddress(address){
                let balance=0;
                
                for(const block of this.chain){
                    for(const trans of block.transactions){
                        if(trans.fromAddress===address ){
                           
                            balance=balance - trans.amount;

                            
                        }
                        if(trans.toAddress===address){
                            balance=balance + trans.amount;
                        }
                        if( this.miningReward <trans.amount){
                            console.log('\n your balance is not enough');
                        }
                        
                    }
                }
                 return balance;
            }

            isChainValid(){
                for(let i=1;i<this.chain.length;i++){
                    const currentBlock= this.chain[i];
                    const prevBlock= this.chain[i-1];

                    if(!currentBlock.hasValidTransaction()){
                        return false;
                    }

                    if(currentBlock.hash!==currentBlock.calculateHash()){
                        return false;
                    }

                    if(currentBlock.prevHash!==prevBlock.hash){
                        return false;
                    }
                }

        return true;
    }
}

module.exports.Blockchain=Blockchain;
module.exports.Transaction=Transaction;