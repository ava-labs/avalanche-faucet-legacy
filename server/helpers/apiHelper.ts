import {addTransaction, getApiKey, getDailyUsage} from "../db";
import {getAddressChain, sendDrop, sendDropX} from "./helper";
import {BN} from "avalanche";
import {CONFIG} from "../ava";
import axios, {AxiosResponse} from "axios";
import {CONFIG_C} from "../eth";


class ApiHelper{
    constructor() {
    }

    static async tokenCustom(apiKey: string, amount: string, to:string){
        if(!apiKey || !amount || !to){
            throw new Error('Invalid request parameters.')
        }

        // Get hash and compare against DB
        let key = await getApiKey(apiKey)
        if(!key){
            throw new Error('Invalid API key.')
        }

        // Check if amount is not above the daily limit, compare against this key's transactions in the past 24h
        let amtBN = new BN(amount.toString())

        let usage = await getDailyUsage(key)
        let maxUsage = new BN(key.daily_limit)
        let available = maxUsage.sub(usage)

        if(available.lt(amtBN)){
            throw new Error(`Failed to send drop. Daily token quota is reached. Remaining Quota: ${available.toString()} nAVAX`)
        }

        let txID = await sendDrop(to, amtBN)

        // If successful add to tx list
        let tx = await addTransaction(key, amtBN, to)
        return txID
    }


    static async token(address: string, captchaResponse: string, index = 0): Promise<string>{
        // Return error if captcha doesnt exist
        if(!captchaResponse){
            throw new Error('Invalid Captcha')
        }

        let params = new URLSearchParams();
        params.append('secret', CONFIG.CAPTCHA_SECRET! );
        params.append('response', captchaResponse );


        // Verify Captcha
        let axios_res = await axios({
            method: 'post',
            url: "https://www.google.com/recaptcha/api/siteverify",
            data: params,
        })

        let data = axios_res.data;
        // If captcha succesfull send tx
        if(data.success){
            let amtX = new BN(CONFIG.DROP_SIZE)
            let amxC = new BN(CONFIG_C.DROP_SIZE).divRound(new BN(1000000000))

            let chain = getAddressChain(address)

            let amtBN = chain==='X' ? amtX : amxC

            let txID = await sendDrop(address, amtBN, index)
            return txID
        }else{
            throw new Error('Invalid Captcha')
        }
    }
}
export default ApiHelper
