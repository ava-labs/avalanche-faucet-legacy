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

const q = new Queue(({address,captchaResponse, res}: any, callback: (arg0: null, arg1: string | Error) => void) => {
    ApiHelper.token(address, captchaResponse).then(txID => {
        onsuccess(res, txID)
        callback(null, txID)
    }).catch((e: Error) => {
        onError(res, e)
        callback(null, e)
    })
})

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

    q.push({address, captchaResponse})

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
