const {Blockchain,Transaction}=require('./blockchain');
const EC = require("elliptic").ec;
const ec = new EC('secp256k1');

const MyKey = ec.keyFromPrivate('is68df345db8310553197b81f1e4216052e79c5da7bcc057078d44d24b702e8898');
const MyWalletAddress= MyKey.getPublic('hex');



let ahmadblockch= new Blockchain();

const tx1= new Transaction(MyWalletAddress,'public address here',700);
tx1.signTransaction(MyKey);
ahmadblockch.addTransaction(tx1);


// ahmadblockch.createTransaction(new Transaction('address1','address2',100));
// ahmadblockch.createTransaction(new Transaction('address2','address1',50));

console.log('\n start mining ....');

ahmadblockch.minePendingTransactions(MyWalletAddress);
console.log('\n balance of ahmad is  ....'+ahmadblockch.getBalanceOfAddress(MyWalletAddress));





