
require('dotenv').config();

import express from 'express'
import {createApiKey, connectDB} from "./db";
import {CONFIG, avm} from "./ava";


const { resolve } = require('path');

const history = require('connect-history-api-fallback');
const {beforeMiddleware} = require('./configure');
const helmet = require("helmet");

import { createServer } from 'http';
import { Server } from 'socket.io';




// VALUE CHECKING ####################################################
if(!CONFIG.PK_X || !CONFIG.PK_C){
    console.error("You must start the server with a valid PRIVATE_KEY.");
}

if(!CONFIG.CAPTCHA_SECRET){
    console.error("You must provide a CAPTCHA_SECRET.");
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {  cors: {
    origin: '*',
  } });

io.on("connection", (socket) => {
    // ...
    console.log(`Socket ${socket.id} has connected!`)
    socket.on('disconnect', () => {
        console.log(`${socket.id} has disconnected`)
    })
});

app.use(helmet());

// API
// beforeMiddleware(app);

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
// Two directories up because compiled code is in build directory
const publicPath = resolve(__dirname, '../../dist');
const staticConf = { maxAge: '1y', etag: false };

app.use(express.static(publicPath, staticConf));
app.use(history());

// Connect database
connectDB().then(conn => {
    console.log("Database connected.")
}).catch((e: Error) => {
    console.log("Database connection failed.")
    console.log(e.message)
})

const port = process.env.PORT || 4000;
httpServer.listen(port, () => {
    console.log(`listening on port: \t${port}`);
    console.log("(X) Droplet size: \t",CONFIG.DROP_SIZE);
    console.log("Faucet Address: \t",CONFIG.FAUCET_ADDRESS);

    if(CONFIG.ASSET_ID){
        console.log("Asset Id: \t",CONFIG.ASSET_ID);
    }
});



export {io}
