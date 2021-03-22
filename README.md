# Avalanche Faucet

There are two different layers in this project. The Node Express backend and the Vue.js frontend.

## Requirements
- Recent version of npm (6.13.4)
- Node `v15.6.0` or greater
- Google reCaptcha keys for **reCaptcha v2** with **"I'm not a robot" Checkbox**. Make sure to have 'localhost' listed in the domains. (https://www.google.com/recaptcha/intro/v3.html)

## Vue Application
### Installation
1) Clone the repository ``git clone https://github.com/ava-labs/avalanche-faucet.git``
2) Go to the root directory `cd avalanche-faucet`
3) Install javascript dependencies with ``npm install``.
4) Create a ``.env`` file by copying ``.env.example`` 
5) Install Gecko, our Avalanche node client written in Golang to spin up a network (https://github.com/ava-labs/gecko). 

### ENV Files
Variables beginning with ``VUE_APP_`` will get injected into the vue application.
 
Refer to ``.env.example``

- ``AVA_IP`` The ip address of the Gecko jrpc node.
- ``AVA_PORT`` The port of the Gecko jrpc node.
- ``AVA_PROTOCOL`` Either ``http`` or ``https``
- ``AVA_NETWORK_ID`` What is the network id of the Avalanche network you are connecting to.
- ``AVA_CHAIN_ID`` The blockchain id of the Avalanche  Network you are connecting to.
- ``CAPTCHA_SECRET`` Your captcha secret from Google reCaptcha
- ``VUE_APP_CAPTCHA_SITE_KEY`` Your public site captcha key from Google reCaptcha
- ``ASSET_ID`` The asset id of the asset the faucet will give. If not set, will default to AVAX asset id.
- ``PRIVATE_KEY_X`` A private key for the X chain with funds in it. You can use the default for AVAX tokens.
- ``PRIVATE_KEY_C`` A private key for the C chain with funds in it. Only needed for the transactions on the C chain.
- ``DROP_SIZE_X`` How much nanoAvax is given from this faucet. Used by the X chain.
- ``DROP_SIZE_C`` How much wei is given from this faucet. Used by the C chain.

### Running The Project

In order for the faucet to work, it needs the Avalanche network to operate on. 
1) Make sure you have installed and able to run a Gecko node properly.
2) All environment variables are correct and your private key has funds in it.
2) Run the project with hot reloading ``npm run serve``

When you go to the website on your browser, you might get a warning saying 
'Site is not secure'. This is because we are signing our own SSL Certificates. Please ignore and continue to the website.

# Node Express

This backend is used to verify captchas and make a request to the Avalanche Network to issue tokens. The backend files are stored 
in the ``src/server`` directory.
The node is automatically started with the ``npm run serve`` command but can be individually started with ``node src/server/index.js``

## Deployment
 1) Setup environment variables for production
 2) Compile and minify to have a production ready application with ``npm run build``. 
 3) Run the node backend by running ``node src/server/index.js``.




# Browser Support

We suggest using Google Chrome to view the AVAX Faucet website.

### Firefox and https

Firefox does not allow https requests to localhost. But the AVAX Faucet uses https by default, so we will need to change this to http. Make this switch by editing the `vue.config.json` file in the root directory and change 

```
devServer: {
    https: true
},
```

to

```
devServer: {
    https: false
},
```

and run `npm run serve` to reflect the change.


### Query Parameters
You can pass in the fields below to the faucet URL.
1) `address` for example `faucet.ava.network/?address=X-M2fCANtVE6dedYgbW5k6jVVQYf2jiCo7v`. Will populate the address field from the query.

### QR Reader and HTTPS
Most browsers disable access to cameras if the website is not served over https. 
For this reason the QR reader at the address input field may fail to find any cameras if served over http.
