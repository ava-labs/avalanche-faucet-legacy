// Typeorm
import {Connection, createConnection, LessThan, MoreThan} from "typeorm";
import {ApiKey} from "./entity/ApiKey";
import {BN} from "avalanche";
import {Transaction} from "./entity/Transaction";
var md5 = require('md5');

const uuidAPIKey = require('uuid-apikey');

let dbConnection: null|Connection;



async function connectDB(){
    let connection = await createConnection().catch((e:any)=>{
        throw e
    })
    dbConnection = connection
    return connection
}


async function validateKey(key: string): Promise<boolean>{
    if(!dbConnection) throw new Error("No database connection.")

    let keyHash = md5(key)

    let repo = await dbConnection.getRepository(ApiKey)
    let res= await repo.findOne({
        hash: keyHash
    })
    if(!res) return false
    return true
}

async function addTransaction(key: ApiKey, amount: BN, to:string): Promise<Transaction>{
    if(!dbConnection) throw new Error("No database connection.")

    let tx = new Transaction()
    tx.api_key = key
    tx.amount = amount.toNumber()
    tx.to = to
    let res = await dbConnection.manager.save(tx)
    return res
}

// Returns how many nAVAX was sent in the past 24hours
async function getDailyUsage(key: ApiKey): Promise<BN>{
    if(!dbConnection) throw new Error("No database connection.")
    let now = Date.now()
    const HOUR_MS = 1000 * 60 * 60
    const DAY_MS = HOUR_MS * 24
    let yesterday = new Date(now - DAY_MS)

    let repo = await dbConnection.getRepository(Transaction)
    let res= await repo.find({
        where: {
            api_key: key,
            createdAt: MoreThan(yesterday)
        }
    })
    let sum = res.reduce((acc: BN, tx: Transaction) => {
        return acc.add(new BN(tx.amount))
    }, new BN(0))
    return sum
}

async function getApiKey(key: string): Promise<ApiKey|null>{
    if(!dbConnection) throw new Error("No database connection.")

    let keyHash = md5(key)

    let repo = await dbConnection.getRepository(ApiKey)
    let res= await repo.findOne({
        hash: keyHash
    })
    if(!res) return null
    return res
}

// Limit given in nAVAX
async function createApiKey(name: string, dailyLimit: number){
    if(!dbConnection) throw new Error("No database connection.")

    // Show secret to user only once
    let uuidKey = uuidAPIKey.create();
    let apiKey = uuidKey.apiKey

    let hash = md5(apiKey)

    const key = new ApiKey()
    key.name = name
    key.hash = hash
    key.daily_limit = dailyLimit
    let res = await dbConnection.manager.save(key)
    return apiKey
}

export {connectDB, createApiKey, validateKey, getApiKey, addTransaction, getDailyUsage}
