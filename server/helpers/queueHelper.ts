import { CONFIG_C, sendAvaC, web3 } from "../eth"

import Queue from 'better-queue'

// [queueMap] initializes all the queues and stores them in an array
const queueMap = setupQueuesMap()

// [findNewQueue] returns a queue that has a balance greater than the [DROP_SIZE]
// A [ttl] is calculated initially, which is the balance when the server bootstraps 
// divided by the [DROP_SIZE] and this [ttl] is decremented every time a drop is made.
// When the [ttl] drops to 1, a network call to [web3] is made to get the current balance.
// This [ttl] helps save us too many network calls.
function findNewQueue(currentIndex: number, queuesMap: Array<any>) {
    let found = false
    let index = currentIndex
    while (!found) {
        index = getValidIndex(index, queuesMap.length)
        if (CONFIG_C.KEYS_MAP[index].ttl > 1) {
            found = true
        } else {
            index++
        }

    }
    return index
}

// [getValidIndex] returns an index that is within the [queueMap] range
export function getValidIndex(current: number, total: number) {
    if (current >= total - 1) {
        return 0
    } else {
        return current + 1
    }
}

// [setupQueuesMap] initializes all the queues
export function setupQueuesMap() {
    const queuesMap: Queue<any, string | Error>[] = []

    // setup queues for a particular length 
    console.log(`Setting up ${CONFIG_C.PKEYS_LENGTH} queues...`)
    for (let i = 0; i < CONFIG_C.PKEYS_LENGTH; i++) {
        console.log(`Setting up queue ${i} out of ${CONFIG_C.PKEYS_LENGTH}...`)
        const q = new Queue(async ({ address, sendAmount, currentIndex }: any, callback: (arg0: null, arg1: string | Error) => void) => {
            let receipt = await sendAvaC(address, sendAmount, currentIndex);
            callback(null, receipt.transactionHash)
        })

        q.on('task_finish', function (taskId: any, result: any, stats: any) {
            console.log(`Queue with index ${i} has completed task with id: ${taskId}. Result: ${JSON.stringify(result)} ${JSON.stringify(stats)}`)
        })

        q.on('task_failed', function (taskId: any, err: any, stats: any) {
            console.log(`Queue with index ${i} has failed task with id: ${taskId}. Error and Stats: ${err} ${stats}`)
        })

        q.on('empty', function () {
            console.log(`Queue with index ${i} is empty`)
        })

        q.on('drain', function () {
            console.log(`Queue with index ${i} has been drained`)
        })

        queuesMap.push(q)
    }

    return queuesMap

}

// [getQueueWithSufficientBalance] returns a queue with a [ttl] greater than one
export async function getQueueWithSufficientBalance(currentIndex: number) {
    let queueToUse = queueMap[currentIndex]
    // if TTL is low, check balance
    // if balance is low, transfer to another address
    const keyToUse = CONFIG_C.KEYS_MAP[currentIndex]
    if (keyToUse.ttl <= 1) {
        await web3.eth.getBalance(keyToUse.account.address).then((res: any) => {
            if (Number(res) > Number(CONFIG_C.DROP_SIZE)) {
                console.log(`There is sufficient balance for address ${keyToUse.account.address}. Resetting ttl...`)
                keyToUse.ttl = Math.floor(Number(res) / Number(CONFIG_C.DROP_SIZE))
                return queueToUse
            } else {
                console.log(`Insufficient balance for address ${keyToUse.account.address}. changing the address...`)
                currentIndex = findNewQueue(currentIndex, queueMap)
                queueToUse = queueMap[currentIndex]
                return queueToUse
            }
        }).catch((e: any) => {
            console.log(`An error occured fetching the balance for ${keyToUse.account.address}: ${e.message}`)
            currentIndex = findNewQueue(currentIndex, queueMap)
            queueToUse = queueMap[currentIndex]
            return queueToUse
        })
    }
    
    return queueToUse

}