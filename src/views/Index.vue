<template>
    <v-container fill-height >
        <v-row justify="center" align="center">
            <v-card class="card" :loading="isAjax">
                <v-img src="@/assets/ava_labs.jpeg" height="140"></v-img>
                <v-card-title>
                        The $AVA Faucet
                </v-card-title>
                <v-card-subtitle>

                </v-card-subtitle>
                <v-card-text v-show="state==='form'">
                    <div>
                        <label>Address (Where to send the tokens.)</label>
                        <qr-input v-model="address"></qr-input>
                    </div>
                    <div ref="captcha" class="captcha"></div>
                    <div class="errors">
                        <p v-for="(error, i) in errors" :key="i">*{{error}}</p>
                    </div>
                    <v-alert type="error" dense outlined>
                        This is a beta faucet. Funds are not real.
                    </v-alert>
                    <v-btn class="submit" @click="onSubmit" block :loading="isAjax" depressed :disabled="!canSubmit">REQUEST {{dropSize}} $nAVA</v-btn>
                </v-card-text>
                <v-card-text v-show="state==='success'">
                    <p>Transfer successfull.</p>
                    <v-btn @click="clear" depressed block>Start again</v-btn>
                </v-card-text>
                <v-card-text v-show="state==='error'">
                    <v-alert type="error" text>
                        {{responseError}}
                        <br><br>
                        <p>Oooops! Looks like something went wrong. Pleasse try again later..</p>
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
                dropSize: 0,
            }
        },
        methods:{
            clear(){
                this.captchaResponse = "";
                window.grecaptcha.reset();
                this.state = "form";
            },
            onSubmit(){
                this.errors = [];
                this.errAddress = false;

                this.captchaResponse = window.grecaptcha.getResponse();

                if(!this.address){
                    this.errors.push("Please enter a valid address.");
                    this.errAddress = true;
                }
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
                }else{
                    console.log(data);
                    this.responseError = data.message;
                    this.state = 'error';
                }
                window.grecaptcha.reset();
            },
            requestToken(){
                this.isAjax = true;
                axios.post('/api/token',{
                    "g-recaptcha-response": this.captchaResponse,
                    "address": this.address
                }).then(this.onresponse);
            }
        },
        created() {
            let parent = this;

            axios.get('/api/howmuch').then(res => {
                let size = res.data.dropSize;
                parent.dropSize = size;
            });

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