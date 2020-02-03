require('dotenv').config();

const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
const { resolve } = require('path');
const {FAUCET_ADDRESS, avm} = require('./ava');
const history = require('connect-history-api-fallback');
const configureAPI = require('./configure');





// const axios = require('axios').default;

const APP_ENV = process.env.VUE_APP_ENV || "production";
// const isDev = (APP_ENV==="development");

// const AVA_IP = process.env.AVA_IP || "localhost";
// const AVA_PORT = process.env.AVA_PORT || 9650;
// const AVA_PROTOCOL = process.env.AVA_PROTOCOL || "https";
// const AVA_NETWORK_ID = process.env.AVA_NETWORK_ID || "12345";

const PK =  process.env.PRIVATE_KEY; // The private key that holds the given assets to supply the faucet
const ASSET_ID = process.env.ASSET_ID; // Which asset is being sent from the faucet
const DROP_SIZE =  process.env.DROP_SIZE || 100; // how much of the given asset to transfer from the faucet

const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET;

// VALUE CHECKING ####################################################
if(!PK){
    console.error("You must start the server with a valid PRIVATE_KEY.");
}
if(!ASSET_ID){
    console.error("You must start the server with a valid ASSET_ID.");
}

if(!CAPTCHA_SECRET){
    console.error("You must provide a CAPTCHA_SECRET.");
}

const app = express();


// API
configureAPI(app);


// UI
const publicPath = resolve(__dirname, '../../dist');
const staticConf = { maxAge: '1y', etag: false };


app.use(express.static(publicPath, staticConf));
app.use('/', history());

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`listening on \t${port}`);
    console.log(`Environment: \t${APP_ENV}`);
    console.log("Droplet size: \t",DROP_SIZE);
    console.log("Asset Id: \t",ASSET_ID);
    console.log("Faucet Address: \t",FAUCET_ADDRESS);

    avm.getUTXOs([FAUCET_ADDRESS]).then(utxos => {
        let balance = utxos.getBalance([FAUCET_ADDRESS], ASSET_ID);
        console.log("Available Balance: ",balance.toNumber());
    });
});