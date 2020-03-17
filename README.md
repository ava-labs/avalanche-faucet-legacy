# AVA Faucet

There are two different layers in this project. The Node Express backend and the Vue.js frontend.

## Requirements
- Recent version of npm (6.13.4)
- Node v12.14.1
- Google reCaptcha keys for **reCaptcha v2** with **"I'm not a robot" Checkbox**. Make sure to have 'localhost' listed in the domains. (https://www.google.com/recaptcha/intro/v3.html)

## Vue Application
### Installation
1) Clone the repository ``git clone https://github.com/ava-labs/faucet-site.git``
2) Go to the root directory `cd faucet-site`
3) Install javascript dependencies with ``npm install``.
4) Create a ``.env`` file by copying ``.env.example`` 
5) Install Gecko, our AVA node client written in Golang to spin up a network (https://github.com/ava-labs/gecko). 

### ENV Files
Variables beginning with ``VUE_APP_`` will get injected into the vue application.
 
Refer to ``.env.example``

- ``AVA_IP`` The ip address of the Gecko jrpc node.
- ``AVA_PORT`` The port of the Gecko jrpc node.
- ``AVA_PROTOCOL`` Either ``http`` or ``https``
- ``AVA_NETWORK_ID`` What is the network id of the AVA network you are connecting to.
- ``AVA_CHAIN_ID`` The blockchain id of the AVA  Network you are connecting to.
- ``CAPTCHA_SECRET`` Your captcha secret from Google reCaptcha
- ``VUE_APP_CAPTCHA_SITE_KEY`` Your public site captcha key from Google reCaptcha
- ``ASSET_ID`` The asset id of the asset the faucet will give. If not set, will default to AVA asset id.
- ``PRIVATE_KEY`` A private key with funds in it. You can use the default for AVA tokens.
- ``DROP_SIZE`` How much nanoAvas is given from this faucet.

### Running The Project

In order for the faucet to work, it needs the AVA network to operate on. 
1) Make sure you have installed and able to run a Gecko node properly.
2) All environment variables are correct and your private key has funds in it.
2) Run the project with hot reloading ``npm run serve``

When you go to the website on your browser, you might get a warning saying 
'Site is not secure'. This is because we are signing our own SSL Certificates. Please ignore and continue to the website.

# Node Express

This backend is used to verify captchas and make a request to the AVA Network to issue tokens. The backend files are stored 
in the ``src/server`` directory.
The node is automatically started with the ``npm run serve`` command but can be individually started with ``node src/server/index.js``

## Deployment
 1) Setup environment variables for production
 2) Compile and minify to have a production ready application with ``npm run build``. 
 3) Run the node backend by running ``node src/server/index.js``.




# Browser Support

We suggest using Google Chrome to view the AVA Faucet website.

### Firefox and https

Firefox does not allow https requests to localhost. But the AVA Faucet uses https by default, so we will need to change this to http. Make this switch by editing the `vue.config.json` file in the root directory and change 

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