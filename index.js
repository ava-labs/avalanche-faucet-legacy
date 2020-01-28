const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const axios = require('axios').default;

const PK = ""; // The private key that holds the given assets to supply the faucet
const ASSET_ID = ""; // Which asset is being sent from the faucet
const DROP_SIZE = 1; // how much of the given asset to transfer from the faucet

const slopes = require("slopes");

let ava = new slopes.Slopes("localhost", 9650, "https");
let avm = ava.AVM();

// console.log(avm);
const CAPTCHA_SECRET = "6LcNj8sUAAAAAGIe-WNMCkqWttjkI-_BuGuOKXb1";

const app = express();

app.use(morgan('tiny'));
app.use(cors());
app.use(bodyParser.json());


app.post('/token', (req, res) => {
    let address = req.body["address"];
    let captchaResponse = req.body["g-recaptcha-response"];

    console.log(address, captchaResponse);

    if(!captchaResponse){
        return;
    }

    // let param = {
    //     secret: CAPTCHA_SECRET,
    //     response: captchaResponse,
    // };

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