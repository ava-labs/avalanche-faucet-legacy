<template>
    <div>
        <div class="card">
            <h1>The AVA Faucet</h1>
            <input type="text" v-model="address">
            <div ref="captcha"></div>
            <p>Please use https://ava.network:21015/ext/evm/rpc RPC to connect to the Athereum testnet.</p>
            <button @click="requestToken">REQUEST 0.25 ATH</button>
            <v-btn>yo</v-btn>
        </div>
    </div>
</template>
<script>
    import axios from '../axios';

    export default {
        data(){
            return{
                address: '',
                errors: [],
            }
        },
        methods:{
            onresponse(res){
                let data = res.data;
                if(data.status === 'success'){
                    alert("GOT THEM COINS");
                }else{
                    console.log(data);
                }
                window.grecaptcha.reset();
            },
            requestToken(){
                let captchaResponse = window.grecaptcha.getResponse();
                if(captchaResponse){
                    axios.post('/token',{
                        "g-recaptcha-response": captchaResponse,
                        "address": this.address
                    }).then(this.onresponse);
                }
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
    }
</script>
<style scoped>
    .card{
        margin: auto;
        background-color: #FFF;
        /*width: 320px;*/
        width: min-content;
        max-width: 100%;
        border: 1px solid #f2f2f2;
        padding: 30px;
        border-radius: 5px;
    }

    .card p{
        text-align: left;
    }
</style>