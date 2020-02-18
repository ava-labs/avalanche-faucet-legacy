const axios = require('axios').default;

const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET;
const ASSET_ID = process.env.ASSET_ID; // Which asset is being sent from the faucet
const DROP_SIZE =  process.env.DROP_SIZE || 100; // how much of the given asset to transfer from the faucet

const BN = require('bn.js');
const AVA = require('./ava');
var router = require('express').Router();



const APP_ENV = process.env.VUE_APP_ENV || "production";
const isDev = (APP_ENV==="development");


router.post('/token', (req, res) => {
    let address = req.body["address"];
    let captchaResponse = req.body["g-recaptcha-response"];


    // if on development mode, skip captcha
    if(isDev){
        sendTx(address).then(txid => {
            res.json({
                status: 'success',
                message: txid
            });
        }).catch(err => {
            console.error(err);
            res.json({
                status: 'error',
                message: 'Error issuing the transaction.'
            });
        });
        return;
    }

    // Return error if captcha doesnt exist
    if(!captchaResponse){
        res.json({
            status: 'error',
            message: 'Invalid captcha.'
        });
        return;
    }

    let params = new URLSearchParams();
    params.append('secret', CAPTCHA_SECRET );
    params.append('response', captchaResponse );


    // Verify Captcha
    axios({
        method: 'post',
        url: "https://www.google.com/recaptcha/api/siteverify",
        data: params,
    }).then(axios_res => {
        // console.log(axios_res.data);
        let data = axios_res.data;
        // If captcha succesfull send tx
        if(data.success){
            sendTx(address).then(txid => {
                res.json({
                    status: 'success',
                    message: txid
                });
            }).catch(err => {
                console.error(err);
                res.json({
                    status: 'error',
                    message: 'Error issuing the transaction.'
                });
            });

        }else{
            res.json({
                status: 'error',
                message: 'Invalid captcha.'
            });
        }
    });
});


module.exports = router;



// Sends a drop from the faucet to the given address
async function sendTx(addr){
    let myAddresses = [AVA.FAUCET_ADDRESS];
    let utxos = await AVA.avm.getUTXOs(myAddresses);
    // console.log(utxos.getAllUTXOs());
    let sendAmount = new BN(DROP_SIZE);

    let unsigned_tx = await AVA.avm.makeUnsignedTx(utxos, sendAmount, [addr], myAddresses, myAddresses, ASSET_ID);
    let signed_tx = AVA.avm.signTx(unsigned_tx);
    let txid = await AVA.avm.issueTx(signed_tx);

    console.log(`Sent a drop with tx id:  ${txid} to address: ${addr}`);
    return txid;
}