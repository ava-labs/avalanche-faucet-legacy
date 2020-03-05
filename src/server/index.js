require('dotenv').config();

const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
const { resolve } = require('path');
const {CONFIG, avm} = require('./ava');
const history = require('connect-history-api-fallback');
const {beforeMiddleware} = require('./configure');





// const axios = require('axios').default;

// const APP_ENV = process.env.VUE_APP_ENV || "production";
// const isDev = (APP_ENV==="development");

// const AVA_IP = process.env.AVA_IP || "localhost";
// const AVA_PORT = process.env.AVA_PORT || 9650;
// const AVA_PROTOCOL = process.env.AVA_PROTOCOL || "https";
// const AVA_NETWORK_ID = process.env.AVA_NETWORK_ID || "12345";

// const PK =  process.env.PRIVATE_KEY; // The private key that holds the given assets to supply the faucet
// let ASSET_ID = process.env.ASSET_ID; // Which asset is being sent from the faucet
// const DROP_SIZE =  process.env.DROP_SIZE || 100; // how much of the given asset to transfer from the faucet


// VALUE CHECKING ####################################################
if(!CONFIG.PK){
    console.error("You must start the server with a valid PRIVATE_KEY.");
}

if(!CONFIG.CAPTCHA_SECRET){
    console.error("You must provide a CAPTCHA_SECRET.");
}

const app = express();





// API
beforeMiddleware(app);


// UI
app.use((req, res, next) => {
    if (req.secure) {
        // request was via https, so do no special handling
        next();
    } else {
        // request was via http, so redirect to https
        res.redirect('https://' + req.headers.host + req.url);
    }
});

// Serve static files
const publicPath = resolve(__dirname, '../../dist');
const staticConf = { maxAge: '1y', etag: false };
app.use(express.static(publicPath, staticConf));


app.use(history());






// async function start(){
//     if(!ASSET_ID){
//         let res = await avm.getAssetDescription('AVA');
//         ASSET_ID = bintools.avaSerialize(res.assetID);
//     }
//
//
// }
// start();

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`listening on \t${port}`);
    console.log("Droplet size: \t",CONFIG.DROP_SIZE);
    console.log("Faucet Address: \t",CONFIG.FAUCET_ADDRESS);

    if(CONFIG.ASSET_ID){
        console.log("Asset Id: \t",CONFIG.ASSET_ID);
        avm.getUTXOs([CONFIG.FAUCET_ADDRESS]).then(utxos => {
            let balance = utxos.getBalance([CONFIG.FAUCET_ADDRESS], CONFIG.ASSET_ID);
            console.log("Available Balance: ",balance.toString());
        });
    }

});

// const port = process.env.PORT || 4000;
// app.listen(port, () => {
//     console.log(`listening on \t${port}`);
//     console.log(`Environment: \t${APP_ENV}`);
//     console.log("Droplet size: \t",DROP_SIZE);
//     console.log("Asset Id: \t",ASSET_ID);
//     console.log("Faucet Address: \t",FAUCET_ADDRESS);
//
//     avm.getUTXOs([FAUCET_ADDRESS]).then(utxos => {
//         let balance = utxos.getBalance([FAUCET_ADDRESS], ASSET_ID);
//         console.log("Available Balance: ",balance.toString());
//     });
// });