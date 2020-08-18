const {CONFIG, avm, bintools} = require('./ava');
const axios = require('axios').default;
const {sendAvaC, CONFIG_C} = require("./eth");
const BN = require('bn.js');
// const AVA = require('./ava');
var router = require('express').Router();

router.get('/howmuch', (req, res) => {
    res.json({
        dropSizeX: CONFIG.DROP_SIZE,
        dropSizeC: CONFIG_C.DROP_SIZE
    });
});


router.post('/token', (req, res) => {
    let address = req.body["address"];
    let captchaResponse = req.body["g-recaptcha-response"];

    // Return error if captcha doesnt exist
    if(!captchaResponse){
        res.json({
            status: 'error',
            message: 'Invalid Captcha'
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
    }).then( async (axios_res) => {
        // console.log(axios_res.data);
        let data = axios_res.data;
        // If captcha succesfull send tx
        if(data.success){

            // X CHAIN
            if(address[0] === 'X'){
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
            }

            // C CHAIN
            else if(address[0] === 'C'){

                let ethAddr = address.substring(2);
                let result;

                if(ethAddr.substring(0,2) === '0x'){
                    try{
                        result = await sendAvaC(ethAddr);
                    }catch(e){
                        res.json({
                            status: 'error',
                            message: 'Invalid Address'
                        });
                    }
                }else{
                    try{
                        let deserial = bintools.avaDeserialize(ethAddr);
                        let hex = deserial.toString('hex');

                        result = await sendAvaC(`0x${hex}`);
                    }catch(e){
                        console.log(e);
                        res.json({
                            status: 'error',
                            message: 'Invalid Address'
                        });
                    }
                }

                console.log(`(C) Sent a drop with tx hash: ${result.transactionHash} to ${address}`);
                res.json({
                    status: 'success',
                    message: result.transactionHash
                });
            }else{
                res.json({
                    status: 'error',
                    message: 'Invalid Address'
                });
            }
        }else{
            res.json({
                status: 'error',
                message: 'Invalid Captcha'
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


    // If balance is lower than drop size, throw an insufficient funds error
    let balance = await avm.getBalance(CONFIG.FAUCET_ADDRESS, CONFIG.ASSET_ID);
    let balanceVal = new BN(balance.balance);

    console.log(balanceVal);
    if(sendAmount.gt(balanceVal)){
        return {
            status: 'error',
            message: 'Insufficient funds to create the transaction. Please file an issues on the repo: https://github.com/ava-labs/faucet-site'
        }
    }
    // console.log(avm.getBlockchainID());
    let unsigned_tx = await avm.buildBaseTx(utxos, sendAmount, CONFIG.ASSET_ID,[addr], myAddresses, myAddresses, ).catch(err => {
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



module.exports = router;
