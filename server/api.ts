import {getApiKey, validateKey} from "./db";
import {AxiosResponse} from "axios";
import {CONFIG, avm, bintools} from './ava'
// const {CONFIG, avm, bintools} = require('./ava');
const axios = require('axios').default;
const {sendAvaC, CONFIG_C} = require("./eth");
const Web3 = require("web3");
import {BN} from 'avalanche'
import {getAddressChain, sendDrop, sendDropX} from "./helpers/helper";
import ApiHelper from "./helpers/apiHelper";
import { web3 } from "./eth";
// const AVA = require('./ava');
var router = require('express').Router();

const Queue = require('better-queue')

function findNewQueue(currentIndex: number) {
    let found = false 
    let index = currentIndex
    while(!found) {
        index = getValidIndex(index, queuesMap.length)
        if(CONFIG_C.KEYS_MAP[index].ttl > 1) {
            found = true
        }
        index++
    }
    return index
}

function getValidIndex(current: number, total: number) {
    let final = 0
    if(current >= total - 1) {
        final = 0
    }else{
       final = current + 1
    }
    return final
}
 
let currentIndex = 0

const queuesMap: any[] = []

// setup queues for a particular length 
console.log(`Setting up ${CONFIG_C.PKEYS_LENGTH} queues...`)
for(let i = 0; i < CONFIG_C.PKEYS_LENGTH; i++) {
    console.log(`Setting up queue ${i} out of ${CONFIG_C.PKEYS_LENGTH}...`)
    const q = new Queue(async ({address,captchaResponse, res, index}: any, callback: (arg0: null, arg1: string | Error) => void) => {
        ApiHelper.token(address, captchaResponse, index).then(txID => {
            onsuccess(res, txID)
            callback(null, txID)
        }).catch((e: Error) => {
            onError(res, e)
            callback(null, e)
        })
    })

    q.on('task_finish', function (taskId: any, result: any, stats: any) {
        console.log(`Queue with index ${i} has completed task with id: ${taskId}. Result: ${JSON.stringify(result)} ${JSON.stringify(stats)}`)
    })

    q.on('task_failed', function (taskId: any, err: any, stats: any) {
        console.log(`Queue with index ${i} has failed task with id: ${taskId}. Error and Stats: ${err} ${stats}`)
    })
    
    q.on('empty', function (){
        console.log(`Queue with index ${i} is empty`)
    })
    
    q.on('drain', function (){
        console.log(`Queue with index ${i} has been drained`)
    })

    queuesMap.push(q)
}

router.get('/howmuch', (req: any, res: any) => {
    res.json({
        dropSizeX: CONFIG.DROP_SIZE,
        dropSizeC: CONFIG_C.DROP_SIZE
    });
});

router.post('/token_custom', async (req: any, res: any) =>{
    let apiKey = req.body.key;
    let amount = req.body.amount; // in nAVAX
    let to = req.body.to; // must be valid X or C chain address

    ApiHelper.tokenCustom(apiKey,amount,to).then(txID => {
        onsuccess(res, txID)
    }).catch((e: Error)=>{
        onError(res, e)
    })
})

router.post('/token', async (req: any, res: any) => {
    let address = req.body.address;
    let captchaResponse = req.body["g-recaptcha-response"];
    
    const addressChain = getAddressChain(address)

    if(addressChain === 'X') {
        ApiHelper.token(address, captchaResponse).then(txID => {
            onsuccess(res, txID)
        }).catch((e: Error) => {
            onError(res, e)
        })

    }else{
        // round-robin
        currentIndex = getValidIndex(currentIndex, queuesMap.length)
        let queueToUse = queuesMap[currentIndex]
        // if TTL is low, check balance
        // if balance is low, transfer to another address
        const keyToUse = CONFIG_C.KEYS_MAP[currentIndex]
        if (keyToUse.ttl <= 1) {
            await web3.eth.getBalance(keyToUse.account.address).then((res:any) => {
                if(Number(res) > Number(CONFIG_C.DROP_SIZE)) {
                    console.log(`There is sufficient balance for address ${keyToUse.account.address}. Resetting ttl...`)
                    keyToUse.ttl = Math.floor(Number(res) / Number(CONFIG_C.DROP_SIZE))
                }else{
                    console.log(`Insufficient balance for address ${keyToUse.account.address}. changing the address...`)
                    currentIndex = findNewQueue(currentIndex)
                    queueToUse = queuesMap[currentIndex]
                }
            }).catch((e: any) => {
                console.log(`An error occured fetching the balance for ${keyToUse.account.address}: ${e.message}`) 
                currentIndex = findNewQueue(currentIndex)
                queueToUse = queuesMap[currentIndex]
            })
        }
        queueToUse.push({address, captchaResponse, res, index: currentIndex})
        // reduce ttl 
        CONFIG_C.KEYS_MAP[currentIndex].ttl -= 1   
    }

});

function onError(res: any, err: Error){
    res.json({
        status: 'error',
        message: err.message
    })
}
function onsuccess(res: any, txHash: string){
    res.json({
        status: 'success',
        message: txHash
    });
}

module.exports = router;
