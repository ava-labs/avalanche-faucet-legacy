const Web3 = require('web3');

// Get constants

const PK = process.env.PRIVATE_KEY_C; // The private key that holds the given assets to supply the faucet
const txAmount = process.env.DROP_SIZE_C || "200000000000000000";
const AVA_IP = process.env.AVA_IP || "localhost";
const AVA_PORT = process.env.AVA_PORT || "9650";
const AVA_PROTOCOL = process.env.AVA_PROTOCOL || "http";


// const GAS_PRICE = "100000000000";
const GAS_PRICE = "1";

const CONFIG_C = {
  PK: PK,
  DROP_SIZE: txAmount
};

// Init web 3 with target AVA Node

let rpcUrl = `${AVA_PROTOCOL}://${AVA_IP}:${AVA_PORT}/ext/bc/C/rpc`;
let web3 = new Web3(rpcUrl);

// Create the web3 account from the faucet private key
let account = web3.eth.accounts.privateKeyToAccount(PK);

// Get available C-AVA balance
web3.eth.getBalance(account.address).then(res => {
    console.log("(C) Available Balance: ", res);
    console.log("(C) Droplet size: \t",txAmount);
});

// let nonce = 0;
// web3.eth.getTransactionCount(account.address).then(res => {
//     nonce = res;
// })

// !!! Receiver is given in 0x format
async function sendAvaC(receiver){

    // let pendingTx = await web3.eth.getTransactionCount(account.address, 'pending');
    // let latestTx = await web3.eth.getTransactionCount(account.address, 'latest');
    // let txDiff = pendingTx - latestTx;
    // let nonce = await web3.eth.getTransactionCount(account.address);
        // nonce++;
    // let gasPrice = new BN(GAS_PRICE)
    // let m   gasPrice.div(new BN(10))
    // console.log(pendingTx,latestTx);


    const txConfig = {
        from: account.address,
        gasPrice: GAS_PRICE,
        gas: "21000",
        to: receiver,
        value: txAmount,
        data: "",
    };

    let signedTx = await account.signTransaction(txConfig);
    let err, receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    // console.log(receipt);

    if(!err) return receipt;
    console.log(err);
    throw err;
    // Send the transaction
    // return web3.eth.sendSignedTransaction(signedTx.rawTransaction);
}

module.exports = {
    sendAvaC,
    web3,
    CONFIG_C
};
