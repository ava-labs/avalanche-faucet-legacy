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
// const AVA = require('./ava');
var router = require('express').Router();

const Queue = require('better-queue')
 
let currentIndex = 0

const queuesMap: any[] = []

// setup queues for a particular length 
console.log(`Setting up ${CONFIG_C.PKEYS_LENGTH} queues...`)
for(let i = 0; i < CONFIG_C.PKEYS_LENGTH; i++) {
    console.log(`Setting up queue ${i} out of ${CONFIG_C.PKEYS_LENGTH}...`)
    const q = new Queue(({address,captchaResponse, res, index}: any, callback: (arg0: null, arg1: string | Error) => void) => {
        ApiHelper.token(address, captchaResponse, index).then(txID => {
            onsuccess(res, txID)
            callback(null, txID)
        }).catch((e: Error) => {
            onError(res, e)
            callback(null, e)
        })
    })

    q.on('task_finish', function (taskId: any, result: any, stats: any) {
        console.log(`Queue with index ${i} has completed task with id: ${taskId}. Result: ${result} ${stats}`)
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

router.post('/token', (req: any, res: any) => {
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
        const queueToUse = queuesMap[currentIndex]

        queueToUse.push({address, captchaResponse, res, index: currentIndex})

        // round-robin
        if(currentIndex >= queuesMap.length) {
            currentIndex = 0
        }else{
            currentIndex++
        }
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
