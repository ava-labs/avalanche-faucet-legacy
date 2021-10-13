
import {CONFIG} from './ava'
const { CONFIG_C} = require("./eth");
import ApiHelper from "./helpers/apiHelper";
var router = require('express').Router();


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

    ApiHelper.token(address, captchaResponse).then(txID => {
        onsuccess(res, txID)
    }).catch((e: Error) => {
        onError(res, e)
    })

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
