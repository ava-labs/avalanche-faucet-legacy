import {CONFIG} from "./ava";
import {Express} from "express";

const bodyParser = require('body-parser');
const cors = require('cors');
const api = require('./api');

function beforeMiddleware(app: Express){
    app.use(cors());
    app.use(bodyParser.json());
    app.enable('trust proxy');
    app.use('/api', api)
}

function onListening(){
    console.log("(X) Droplet size: \t",CONFIG.DROP_SIZE);
    console.log("Asset Id: \t",CONFIG.ASSET_ID);
    console.log("Faucet Address: \t",CONFIG.FAUCET_ADDRESS);
}

export {
    beforeMiddleware,
    onListening
}

module.exports = {
    beforeMiddleware,
    onListening
};
