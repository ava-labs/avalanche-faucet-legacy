// Sends a drop from the faucet to the given address
import {BN} from "avalanche";
import {CONFIG_C, sendAvaC, sendAvaxCOnQueue} from "../eth";
const {CONFIG, avm, bintools} = require('../ava');
const Web3 = require("web3");

// sendAmount is nAVAX
export async function sendDrop(address: string, sendAmount: BN){
    let addressChain = getAddressChain(address)
    if(addressChain === 'X'){
        let txId = await sendDropX(address, sendAmount)
        return txId
    }else if(addressChain === 'C'){
        let receipt = await sendAvaxCOnQueue(address, sendAmount);
        return receipt.transactionHash
    }else{
        throw new Error("Invalid Address")
    }
}

export async function sendDropX(addr: string, sendAmount: BN){
    let myAddresses = [CONFIG.FAUCET_ADDRESS];
    let utxos: any = (await avm.getUTXOs(myAddresses)).utxos;


    // If balance is lower than drop size, throw an insufficient funds error
    let balance = await avm.getBalance(CONFIG.FAUCET_ADDRESS, CONFIG.ASSET_ID);
    let balanceVal = new BN(balance.balance);

    if(sendAmount.gt(balanceVal)){
        console.log("Insufficient funds. Remaining AVAX: ",balanceVal.toString());
        return {
            status: 'error',
            message: 'Insufficient funds to create the transaction. Please file an issues on the repo: https://github.com/ava-labs/faucet-site'
        }
    }
    // console.log(avm.getBlockchainID());
    let memo = bintools.stringToBuffer("Faucet drip");
    let unsigned_tx = await avm.buildBaseTx(
        utxos,
        sendAmount,
        CONFIG.ASSET_ID,
        [addr],
        myAddresses,
        myAddresses,
        memo
    ).catch((err: any) => {
        console.log(err);
    });

    // Meaning an error occurred
    if(unsigned_tx.status){
        return unsigned_tx;
    }

    let signed_tx = avm.signTx(unsigned_tx);
    let txid = await avm.issueTx(signed_tx);

    console.log(`(X) Sent a drop with tx id:  ${txid} to address: ${addr}`);
    return txid;
}


export type AddressChainType = 'X' | 'C'
export function getAddressChain(address: string): AddressChainType{
    if(address[0] === 'X') {
        return 'X'
    }else if(address[0] === 'C'){
        return 'C'
    }else if(Web3.utils.isAddress(address)){
        return 'C'
    }
    throw new Error("Not a valid address.")
}

// Address is given as C-0x...
export function parseEvmBechAddress(address: string): string{
    let ethAddr = address.substring(2);
    let deserial = bintools.cb58Decode(ethAddr);
    let hex = deserial.toString('hex');
    return hex
}
