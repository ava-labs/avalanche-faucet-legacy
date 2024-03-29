import {parseEvmBechAddress} from "./helpers/helper";
import {BN} from "avalanche";

const Web3 = require('web3');

// Get constants
const axios = require('axios');

const PK = process.env.PRIVATE_KEY_C; // The private key that holds the given assets to supply the faucet
const txAmount = process.env.DROP_SIZE_C || "200000000000000000";
const AVA_IP = process.env.AVA_IP || "localhost";
const AVA_PORT = process.env.AVA_PORT || "9650";
const AVA_PROTOCOL = process.env.AVA_PROTOCOL || "http";

const MAX_GAS = 235000000000;

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
web3.eth.getBalance(account.address).then((res:any) => {
    console.log("(C) Available Balance: ", res);
    console.log("(C) Droplet size: \t",txAmount);
    console.log(`(C) Address: `,account.address)
});


async function getGasPrice(): Promise<number>{
    return await web3.eth.getGasPrice()
}

/**
 * Returns the gas price + 25%, or max gas
 */
async function getAdjustedGasPrice(): Promise<number>{
    let gasPrice = await getGasPrice()
    let adjustedGas = Math.floor(gasPrice * 1.25)
    return Math.min(adjustedGas, MAX_GAS)
}

async function getAcceptedTxCount(){
    let json = {
        jsonrpc: "2.0",
        method: "eth_getTransactionCount",
        params: [account.address, "accepted"],
        id: 1
    }
    let res = await axios.post(rpcUrl, json);
    let hex = res.data.result;
    let num = parseInt(hex, 16);
    return num
}

// !!! Receiver is given is either 0x or C-0x
// Amount is given in gWEI
async function sendAvaC(receiver: string, amount: BN){
    if(receiver[0]==='C'){
        receiver = parseEvmBechAddress(receiver)
    }

    let gasPrice = await getAdjustedGasPrice()

    // convert nAvax to wei
    let amountWei = amount.mul(new BN(1000000000))
    let latestTx = await web3.eth.getTransactionCount(account.address, 'latest');

    const txConfig = {
        from: account.address,
        gasPrice: gasPrice,
        gas: "21000",
        to: receiver,
        value: amountWei.toString(),
        data: "",
        nonce: latestTx,
    };

    let signedTx = await account.signTransaction(txConfig);
    let err, receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);


    if(!err) return receipt;
    console.log(err);
    throw err;
}

export {
    sendAvaC,
    web3,
    CONFIG_C
}

module.exports = {
    sendAvaC,
    web3,
    CONFIG_C
};
