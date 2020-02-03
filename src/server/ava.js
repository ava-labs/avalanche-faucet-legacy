const slopes = require("slopes");
const BN = require('bn.js');
const Buffer = require('buffer').Buffer;

const AVA_IP = process.env.AVA_IP || "localhost";
const AVA_PORT = process.env.AVA_PORT || 9650;
const AVA_PROTOCOL = process.env.AVA_PROTOCOL || "https";
const AVA_NETWORK_ID = process.env.AVA_NETWORK_ID || "12345";
const PK =  process.env.PRIVATE_KEY; // The private key that holds the given assets to supply the faucet
const ASSET_ID = process.env.ASSET_ID; // Which asset is being sent from the faucet
const DROP_SIZE =  process.env.DROP_SIZE || 100; // how much of the given asset to transfer from the faucet

let bintools = slopes.BinTools.getInstance();

let ava = new slopes.Slopes(AVA_IP, AVA_PORT, AVA_PROTOCOL, parseInt(AVA_NETWORK_ID), "2PfbSxTqpTGFF2xCX2YgrW6ncrksfmEhcNXGv9rE9CgTRqT4hM");
let avm = ava.AVM();

let myKeychain = avm.keyChain();

const FAUCET_ADDRESS = myKeychain.importKey(PK);


// console.log(`Environment: \t${APP_ENV}`);
// console.log("Droplet size: \t",DROP_SIZE);
// console.log("Asset Id: \t",ASSET_ID);
// console.log("Faucet Address: \t",FAUCET_ADDRESS);

module.exports = {
    ava,
    avm,
    bintools,
    FAUCET_ADDRESS
};

// let pkbuf = bintools.b58ToBuffer(PK);
// let keypair = myKeychain.getKey(FAUCET_ADDRESS);

