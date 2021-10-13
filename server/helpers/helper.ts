// Sends a drop from the faucet to the given address
import {BN} from "avalanche";
import {CONFIG_C, sendAvaC} from "../eth";
import { getQueueWithSufficientBalance, getValidIndex, setupQueuesMap } from "./queueHelper";
const {CONFIG, avm, bintools} = require('../ava');
const Web3 = require("web3");

// [currentIndex] holds the round robin index for the queue to use
let currentIndex = 0

const queueMap = setupQueuesMap()

// [queueLength] holds the number of queues we have
const queueLength = queueMap.length

// sendAmount is nAVAX
export async function sendDrop(address: string, sendAmount: BN){
    let addressChain = getAddressChain(address)
    if(addressChain === 'X'){
        let txId = await sendDropX(address, sendAmount)
        return txId
    }else if(addressChain === 'C'){
        // select queue to use
        const queueToUse = await getQueueWithSufficientBalance(currentIndex)

        queueToUse.push({address, sendAmount, currentIndex})

        // reduce ttl after pushing to queue
        CONFIG_C.KEYS_MAP[currentIndex].ttl -= 1   

        // increment [currentIndex]
        currentIndex = getValidIndex(currentIndex++, queueLength)

        queueToUse.on('task_finish', function (taskId: any, result: any, stats: any) {
            return result.receipt
        })
        
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
