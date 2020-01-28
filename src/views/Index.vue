<template>
    <v-container fill-height >
        <v-row justify="center" align="center">
            <v-card class="card" :loading="isAjax">
                <v-img src="@/assets/ava_labs.jpeg" height="140"></v-img>
                <v-card-title>
                    The AVA Faucet
                </v-card-title>
                <v-card-text v-show="state==='form'">
                    <v-text-field placeholder="0000000AVA000" v-model="address" label="Address" hint="Which address to send the tokens." persistent-hint :error="errAddress"></v-text-field>
                    <div ref="captcha" class="captcha"></div>
                    <div class="errors">
                        <p v-for="(error, i) in errors" :key="i">*{{error}}</p>
                    </div>
                    <v-btn @click="onSubmit" block :loading="isAjax" depressed>REQUEST 100 $AVA</v-btn>
                </v-card-text>
                <v-card-text v-show="state==='success'">
                    <p>Transfer successfull.</p>
                    <v-btn @click="clear" block>Start again</v-btn>
                </v-card-text>
            </v-card>
        </v-row>
    </v-container>
</template>
<script>
    import axios from '../axios';

    export default {
        data(){
            return{
                errAddress: false,
                isAjax: false,
                address: '',
                errors: [],
                captchaResponse: '',
                state: 'form', // form || success
            }
        },
        methods:{
            clear(){
                this.address = "";
                this.captchaResponse = "";
                window.grecaptcha.reset();
                this.state = "form";
            },
            onSubmit(){
                this.errors = [];
                this.errAddress = false;

                this.captchaResponse = window.grecaptcha.getResponse();

                if(!this.address){
                    this.errors.push("Please enter a valid address.")
                    this.errAddress = true;
                }
                if(!this.captchaResponse){
                    this.errors.push("You must fill the captcha.")
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
                }
                window.grecaptcha.reset();
            },
            requestToken(){
                this.isAjax = true;
                axios.post('/token',{
                    "g-recaptcha-response": this.captchaResponse,
                    "address": this.address
                }).then(this.onresponse);
            }
        },
        mounted() {
            let parent = this;
            window.onloadCallback = function(){
                console.log('CB');
                window.grecaptcha.render(
                    parent.$refs.captcha,
                    {
                        'sitekey' : '6LcNj8sUAAAAAGjcbFpc9_0Aoh4v5rfadyMbPTKY'
                    }
                )
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
        width: 420px;
        background-color: #fff !important;
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
</style>