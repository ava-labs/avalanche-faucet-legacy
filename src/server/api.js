const {CONFIG, avm} = require('./ava');
const axios = require('axios').default;

const BN = require('bn.js');
// const AVA = require('./ava');
var router = require('express').Router();

router.get('/howmuch', (req, res) => {
    res.json({
        dropSize: CONFIG.DROP_SIZE
    });
});

router.post('/token', (req, res) => {
    let address = req.body["address"];
    let captchaResponse = req.body["g-recaptcha-response"];

    // Return error if captcha doesnt exist
    if(!captchaResponse){
        res.json({
            status: 'error',
            message: 'Invalid captcha.'
        });
        return;
    }

    let params = new URLSearchParams();
    params.append('secret', CONFIG.CAPTCHA_SECRET );
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
            sendTx(address, res).then(txid => {

                if(txid.status){
                    res.json(txid);
                }else{
                    res.json({
                        status: 'success',
                        message: txid
                    });
                }

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





// Sends a drop from the faucet to the given address
async function sendTx(addr){
    let myAddresses = [CONFIG.FAUCET_ADDRESS];
    // console.log(myAddresses);
    let utxos = await avm.getUTXOs(myAddresses);
    // console.log(utxos.getAllUTXOs());
    let sendAmount = new BN(CONFIG.DROP_SIZE);

    // console.log(avm.getBlockchainID());
    let unsigned_tx = await avm.makeUnsignedTx(utxos, sendAmount, [addr], myAddresses, myAddresses, CONFIG.ASSET_ID).catch(err => {
        console.log(err);
        return {
            status: 'error',
            message: 'Insufficient funds to create the transaction.'
        }
    });

    // Meaning an error occurred
    if(unsigned_tx.status){
        return unsigned_tx;
    }

    let signed_tx = avm.signTx(unsigned_tx);
    let txid = await avm.issueTx(signed_tx);

    console.log(`Sent a drop with tx id:  ${txid} to address: ${addr}`);
    return txid;
}



module.exports = router;
