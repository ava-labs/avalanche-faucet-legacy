const {CONFIG} = require('./ava');

const bodyParser = require('body-parser');
const cors = require('cors');
const api = require('./api');

// const APP_ENV = process.env.VUE_APP_ENV || "production";
// const ASSET_ID = process.env.ASSET_ID; // Which asset is being sent from the faucet
// const DROP_SIZE =  process.env.DROP_SIZE || 100; // how much of the given asset to transfer from the faucet

function beforeMiddleware(app){
    app.use(cors());
    app.use(bodyParser.json());
    app.enable('trust proxy');

    // HTTPS Enforcement


    app.use('/api', api)
}

function onListening(){
    console.log("(X) Droplet size: \t",CONFIG.DROP_SIZE);
    console.log("Asset Id: \t",CONFIG.ASSET_ID);
    console.log("Faucet Address: \t",CONFIG.FAUCET_ADDRESS);
}

module.exports = {
    beforeMiddleware,
    onListening
};