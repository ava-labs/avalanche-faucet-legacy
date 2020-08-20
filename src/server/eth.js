const Web3 = require('web3');

import { BN } from 'avalanche';
// Get constants

const PK = process.env.PRIVATE_KEY_C; // The private key that holds the given assets to supply the faucet
const txAmount = process.env.DROP_SIZE_C || "200000000000000000";
const AVA_IP = process.env.AVA_IP || "localhost";
const AVA_PORT = process.env.AVA_PORT || "9650";
const AVA_PROTOCOL = process.env.AVA_PROTOCOL || "http";


const GAS_PRICE = "20000000000";

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



// !!! Receiver is given in 0x format
async function sendAvaC(receiver){
    const txConfig = {
        from: account.address,
        gasPrice: GAS_PRICE,
        gas: "21000",
        to: receiver,
        value: txAmount,
        data: ""
    };

    let signedTx = await account.signTransaction(txConfig);

    // Send the transaction
    return  web3.eth.sendSignedTransaction(signedTx.rawTransaction);
}

module.exports = {
    sendAvaC,
    web3,
    CONFIG_C
};