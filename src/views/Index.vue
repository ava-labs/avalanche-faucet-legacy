<template>
    <v-container fill-height >
        <v-row justify="center" align="center">
            <v-card class="card" :loading="isAjax">
                <v-img src="/og_banner.png" height="140"></v-img>
                <v-card-title>
                    AVAX Fuji Testnet Faucet
                </v-card-title>


                <v-card-text v-show="state==='form'">
                    <div>
                        <label>Address (Where to send the tokens.)</label>
                        <qr-input v-model="address" placeholder="Address"></qr-input>
                    </div>
                    <div ref="captcha" class="captcha"></div>
                    <div class="errors">
                        <p v-for="(error, i) in errors" :key="i">*{{error}}</p>
                    </div>
                    <v-alert type="error" dense outlined>
                        This is a beta faucet. Funds are not real.
                    </v-alert>
                    <v-btn class="submit" @click="onSubmit" block :loading="isAjax" depressed :disabled="!canSubmit">REQUEST {{dropSize}} {{assetName}}</v-btn>
                </v-card-text>


                <v-card-text v-show="state==='success'">
                    <p>Transfer successful</p>
                    <label style="font-weight: bold">Transaction ID</label>
                    <p>{{txId}}</p>
                    <v-btn @click="clear" depressed block>Start again</v-btn>
                </v-card-text>


                <v-card-text v-show="state==='error'">
                    <v-alert type="error" text>
                        {{responseError}}
                        <br><br>
                        <p>Oooops! Looks like something went wrong. Please try again later.</p>
                    </v-alert>
                    <v-btn @click="clear" depressed block>Try Again</v-btn>
                </v-card-text>
            </v-card>
        </v-row>
    </v-container>
</template>
<script>
    import axios from '../axios';
    import {QrInput} from '@avalabs/vue_components';
    const Web3 = require('web3');
    import Big from 'big.js';
    const avalanche = require("avalanche");
    let bintools = avalanche.BinTools.getInstance();



    export default {
        components: {
            QrInput
        },
        data(){
            return{
                errAddress: false,
                isAjax: false,
                address: '',
                errors: [],
                responseError: '',
                captchaResponse: '',
                state: 'form', // form || success
                dropSizeX: Big(0),
                dropSizeC: Big(0),
                txId: "",
            }
        },
        methods:{
            clear(){
                this.captchaResponse = "";
                window.grecaptcha.reset();
                this.state = "form";
            },

            verifyAddress(addr){
                // part of ava's chains
                if(addr[1] === '-'){
                    let chainAlias = addr[0];

                    if(chainAlias === 'X'){
                        try{
                            bintools.parseAddress(addr, chainAlias);
                            return true;
                        }catch (e) {
                            return false;
                        }
                    }else if(chainAlias === 'C'){
                        let ethAddr = addr.substring(2);

                        // C chain ETH address
                        if(ethAddr.substring(0,2) === '0x'){
                            return Web3.utils.isAddress(ethAddr)
                        }

                        // C chain b58 address
                        else{
                            try{
                                bintools.parseAddress(addr, chainAlias);
                                return true;
                            }catch (e) {
                                return false;
                            }
                        }
                    }
                }

                // Check if EVM address
                if(Web3.utils.isAddress(addr)){
                    return true
                }
                return false;
            },
            onSubmit(){
                this.errors = [];
                this.errAddress = false;

                this.captchaResponse = window.grecaptcha.getResponse();

                // Must enter Address
                if(!this.address){
                    this.errors.push("Please enter a valid address.");
                    this.errAddress = true;
                }

                // Must enter valid address
                let isValidAddr = this.verifyAddress(this.address);
                if(!isValidAddr){
                    this.errors.push("Invalid address");
                    this.errAddress = true;
                }

                // Must fill the captcha
                if(!this.captchaResponse ){
                    this.errors.push("You must fill the captcha.");
                }



                if(this.errors.length===0){
                    this.requestToken();
                }
            },
            onresponse(res){
                this.isAjax = false;
                let data = res.data;
                if(data.status === 'success'){
                    this.state = 'success';
                    let txId = data.message;
                    this.txId = txId;
                }else{
                    this.responseError = data.message;
                    this.state = 'error';
                }
                window.grecaptcha.reset();
            },
            requestToken(){
                let parent = this;
                this.isAjax = true;
                axios.post('/api/token',{
                    "g-recaptcha-response": this.captchaResponse,
                    "address": this.address
                }).then(this.onresponse).catch(() => {
                    parent.onresponse({
                        data:{
                            status: 'error',
                            message: "Request timeout."
                        }
                    });
                });
            }
        },
        created() {
            let parent = this;

            axios.get('/api/howmuch').then(res => {
                let sizeX = Big(res.data.dropSizeX);
                let sizeC = Big(res.data.dropSizeC);
                parent.dropSizeX = sizeX;
                parent.dropSizeC = sizeC;
            });



            // See if an address is given in the url
            let query = this.$router.currentRoute.query;
            let addr = query['address'];
            if(addr){
                // Check that it is indeed a valid address
                if(this.verifyAddress(addr)){
                    this.address = addr;
                }
            }
            console.log(query);

        },
        mounted() {
            let parent = this;

            window.onloadCallback = function(){
                console.log('CB');
                window.grecaptcha.render(
                    parent.$refs.captcha,
                    {
                        'sitekey' : parent.captchaKey
                    }
                )
            }
        },
        computed: {
            canSubmit(){
                if(this.address.length > 8){
                    return true;
                }
                return false;
            },
            captchaKey(){
                return process.env.VUE_APP_CAPTCHA_SITE_KEY;
            },

            // either X for x-chain or C for c-chain, or null if none
            assetType(){
                if(this.verifyAddress(this.address)){
                    return this.address[0];
                }
                return null;
            },
            assetName(){
                if(this.assetType === 'C'){
                    return 'C-AVAX';
                }
                return 'AVAX';
            },

            dropSize(){
                if(this.assetType === 'C'){
                    // ETH has 18 decimal points
                    return (this.dropSizeC.div(Math.pow(10,18))).toFixed(4);
                }else{
                    return this.dropSizeX.div(Math.pow(10,9)).toString();
                }
            }
        },
        destroyed() {
            window.grecaptcha.reset();
        }
    }
</script>
<style scoped>
    .card{
        margin: auto;
        /*padding: 30px;*/
        text-align: left;
        width: 420px;
        background-color: #fff !important;
    }

    .devmode{
        color: #ff4444;
    }

    .captcha{
        margin: 20px auto;
    }

    .errors{
        margin: 5px 0px;
    }

    .errors p{
        font-size: 12px;
        margin: 0;
        text-align: left;
        color: #f44;
    }

    .v-image{
        /*margin: 20px auto;*/
    }
    .v-btn{
        margin-top: 20px;
    }

    .gif{
        height: 120px;
        object-fit: fill;
    }

    .v-alert{
        font-size: 14px;
    }

    .submit{
        text-transform: none;
    }


    @media only screen and (max-width: 600px) {
        .container{
            padding: 0;
            align-items: baseline;
        }
        .row{
            width: 100%;
            margin: 0 !important;
        }
        .card{
            width: 100%;
            height: 100vh;
            border-radius: 0 !important;
        }
    }
</style>
