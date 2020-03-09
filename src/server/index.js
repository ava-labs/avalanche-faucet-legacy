require('dotenv').config();

const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
const { resolve } = require('path');
const {CONFIG, avm} = require('./ava');
const history = require('connect-history-api-fallback');
const {beforeMiddleware} = require('./configure');


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


// Https rerouting
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
