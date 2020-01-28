const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const axios = require('axios').default;

const AVA_IP = "localhost";
const AVA_PORT = 9650;
const AVA_PROTOCOL = "https";

const PK = "9daUN2CUtPKMoTC8YneHd4Jp9VhaY4pRBnFox47Rs8vz"; // The private key that holds the given assets to supply the faucet
const ASSET_ID = ""; // Which asset is being sent from the faucet
const DROP_SIZE = 1; // how much of the given asset to transfer from the faucet


// SLOPES ####################################################
const slopes = require("slopes");
const BN = require('bn.js');
const Buffer = require('buffer').Buffer;

// import BN from 'bn.js';
// import { Buffer } from 'buffer/'; // the slash forces this library over native Node.js Buffer

let bintools = slopes.BinTools.getInstance();

let ava = new slopes.Slopes(AVA_IP, AVA_PORT, AVA_PROTOCOL);
let avm = ava.AVM();

console.log(ava.AVM)

let myKeychain = avm.keyChain();

let keypair = null;
let addr = null;

if(!PK){
    addr = myKeychain.makeKey();
    keypair = myKeychain.getKey(addr);
}else{
    addr = myKeychain.importKey(PK);
    keypair = myKeychain.getKey(addr);

    console.log(addr);
    createAsset(100, addr).then(res => {
        console.log("Created asset")
    }).catch(err => {
        console.error(err);
    });
}



// Create random asset to play with
async function createAsset(amt, addr){
    let amount = new BN(amt);
    console.log(amount);
    let addresses = [addr];

    // We require 2 addresses to sign in order to spend this initial asset's minted coins
    let threshold = 1;

    let output = new slopes.OutCreateAsset(amount, addresses, threshold);
    let unsigned = slopes.TxUnsigned([], [output]);
    let signed = avm.keyChain().signTx(unsigned); //returns a Tx class

    let txid = await avm.issueTx(signed);
    let status = await avm.getTxStatus(txid);

    console.log(txid,status);
    return true;
}

console.log(myKeychain.getAddreses());



// EXPRESS ####################################################
const CAPTCHA_SECRET = "6LcNj8sUAAAAAGIe-WNMCkqWttjkI-_BuGuOKXb1";

const app = express();

app.use(morgan('tiny'));
app.use(cors());
app.use(bodyParser.json());


app.post('/token', (req, res) => {
    let address = req.body["address"];
    let captchaResponse = req.body["g-recaptcha-response"];

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

    axios({
        method: 'post',
        url: "https://www.google.com/recaptcha/api/siteverify",
        data: params,
    }).then(axios_res => {
        console.log(axios_res.data);
        let data = axios_res.data;
        if(data.success){
            res.json({
                status: 'success',
                message: 'You got the coins!'
            });
        }else{
            res.json({
                status: 'error',
                message: 'Invalid captcha.'
            });
        }
    });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});