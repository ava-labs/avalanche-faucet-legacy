
require('dotenv').config();

import express from 'express'
import {createApiKey, connectDB} from "./db";
import {CONFIG, avm} from "./ava";

const { resolve } = require('path');

const history = require('connect-history-api-fallback');
const {beforeMiddleware} = require('./configure');
const helmet = require("helmet");




// VALUE CHECKING ####################################################
if(!CONFIG.PK_X || !CONFIG.PK_C){
    console.error("You must start the server with a valid PRIVATE_KEY.");
}

if(!CONFIG.CAPTCHA_SECRET){
    console.error("You must provide a CAPTCHA_SECRET.");
}

const app = express();
app.use(helmet());


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
app.use(helmet.xssFilter());
app.use(helmet.frameguard());

// Serve static files
const publicPath = resolve(__dirname, '../dist');
const staticConf = { maxAge: '1y', etag: false };

app.use(express.static(publicPath, staticConf));
app.use(history());

// Connect database
connectDB().then(conn => {
    console.log("Database connected.")
}).catch(e => {
    console.log("Database connection failed.")
})

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`listening on port: \t${port}`);
    console.log("(X) Droplet size: \t",CONFIG.DROP_SIZE);
    console.log("Faucet Address: \t",CONFIG.FAUCET_ADDRESS);

    if(CONFIG.ASSET_ID){
        console.log("Asset Id: \t",CONFIG.ASSET_ID);
    }
});
