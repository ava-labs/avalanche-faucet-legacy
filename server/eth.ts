import { parseEvmBechAddress } from "./helpers/helper";
import { Avalanche, BN } from "avalanche";

const Web3 = require('web3');

const PK = process.env.PRIVATE_KEY_C; // The private key that holds the given assets to supply the faucet
const txAmount = process.env.DROP_SIZE_C || "200000000000000000";
const AVA_IP = process.env.AVA_IP || "localhost";
const AVA_PORT = process.env.AVA_PORT || "9650";
const AVA_PROTOCOL = process.env.AVA_PROTOCOL || "http";

const CONFIG_C = {
  PK: PK,
  DROP_SIZE: txAmount
};

// Init web 3 with target AVA Node

let rpcUrl = `${AVA_PROTOCOL}://${AVA_IP}:${AVA_PORT}/ext/bc/C/rpc`;
let web3 = new Web3(rpcUrl);

// Create the web3 account from the faucet private key
let account = web3.eth.accounts.privateKeyToAccount(PK);

// For estimating max fee and priority fee using CChain APIs
const avalanche = new Avalanche('api.avax-test.network', 9650, 'https', 43113);
const cchain = avalanche.CChain();

type WaitArrType = {
  amount: BN,
  receiver: string,
  cb: (transactionHash: string) => void
}

type Queue = {
  amount: BN,
  receiver: string,
  nonce: number | undefined
}

let nonceUpdating: Boolean = false;
let nonceVal: number = -1;
let balanceUpdating: Boolean = false;
let balance: BN = new BN(0);
let balanceWaitArr: WaitArrType[] = [];
let waitArr: WaitArrType[] = [];
let queue: Queue[] = [];

let recaliber = false;
let pendingTxNonces: any = [];

// Recaliber nonce and balance every 1 hour if there are no pending tx
setInterval(() => {
	if(pendingTxNonces.length === 0 && nonceUpdating === false && balanceUpdating === false) {
		recaliber = true;
		waitArr = [];
		balanceWaitArr = [];
		console.log("Nonce and balance recalibrated!")
	}
}, 60*60*1000)

// !!! Receiver is given is either 0x or C-0x
// Put requests in balance queue after calculating nonce -
// - Amount is given in gWEi
// - cb() call back function for returning txHash to caller
async function sendAvaC(receiver: string, amount: BN, cb: (transactionHash: string) => void) {
  if (receiver[0] === 'C') {
    receiver = parseEvmBechAddress(receiver)
  }

  // converting amount into wei
  amount = amount.mul(new BN(1e9));

  if (nonceVal === -1 || recaliber === true) {
    const waitArrIndex = waitArr.length;
    waitArr.push({ amount, receiver, cb });
    if (!nonceUpdating) {
      nonceUpdating = true;
      nonceVal = await web3.eth.getTransactionCount(account.address, 'latest');
      nonceUpdating = false;
    } else {
      const timeout = setInterval(() => {
        if (!nonceUpdating) {
          clearInterval(timeout)
          putInBalanceQueue(waitArr[waitArrIndex]);
        }
      }, 300)
    }
  } else {
    return putInBalanceQueue({ amount, receiver, cb })
  }
}

// Put requests in execution queue after calculating faucet balance
async function putInBalanceQueue({ amount, receiver, cb }: WaitArrType) {
  if (balance.eq(new BN(0)) || recaliber === true) {
    const balanceWaitArrIndex = balanceWaitArr.length;
    balanceWaitArr.push({ amount, receiver, cb });
    if (!balanceUpdating) {
      balanceUpdating = true;
      balance = new BN(await web3.eth.getBalance(account.address));
      balanceUpdating = false;
      recaliber = false;
    } else {
      const timeout = setInterval(() => {
        if (!balanceUpdating) {
          clearInterval(timeout);
          putInQueue(balanceWaitArr[balanceWaitArrIndex]);
        }
      }, 300)
    }
  } else {
    putInQueue({ amount, receiver, cb })
  }
}

// Executes queue after checking faucet balance
async function putInQueue({ amount, receiver, cb }: WaitArrType) {
  if (balance.gt(amount)) {
    const nonce = nonceVal;
    queue.push({ amount, receiver, nonce })
    nonceVal++;
    balance = balance.sub(amount);
    cb(await execQueue());
  } else {
    throw "Error: Faucet balance too low!"
  }
}

// Executes 1 element from the queue at a time
async function execQueue() {
  const q = queue.shift();
  const amount: any = q?.amount;
  const receiver: any = q?.receiver;
  const nonce: any = q?.nonce;
  return sendAvaCUtil(amount, receiver, undefined, undefined, nonce);
}

// Function to estimate max fee and max priority fee
const calcFeeData = async (maxFeePerGas: number | undefined = undefined, maxPriorityFeePerGas: number | undefined = undefined) => {
  const baseFee = parseInt(await cchain.getBaseFee(), 16) / 1e9;
  maxPriorityFeePerGas = maxPriorityFeePerGas == undefined ? parseInt(await cchain.getMaxPriorityFeePerGas(), 16) / 1e9 : maxPriorityFeePerGas;
  maxFeePerGas = maxFeePerGas == undefined ? baseFee + maxPriorityFeePerGas : maxFeePerGas;

  if (maxFeePerGas < maxPriorityFeePerGas) {
    throw ("Error: Max fee per gas cannot be less than max priority fee per gas");
  }

  return {
    maxFeePerGas: maxFeePerGas,
    maxPriorityFeePerGas: maxPriorityFeePerGas
  };
}

// Function to issue sendAVAX transaction: amount in wei
// - maxFeePerGas and maxPriorityFeePerGas is given in gWei
const sendAvaCUtil = async (amount: BN, to: string, maxFeePerGas: number | undefined = undefined, maxPriorityFeePerGas: number | undefined = undefined, nonce = undefined): Promise<string> => {
  console.log(`Tx with nonce ${nonce} initiated...`);
  pendingTxNonces.push(nonce);

  // If max fee or max priority fee is not provided, then it will automatically calculate using CChain APIs
  ({ maxFeePerGas, maxPriorityFeePerGas } = await calcFeeData(maxFeePerGas, maxPriorityFeePerGas));

  maxFeePerGas = web3.utils.toWei(maxFeePerGas.toString(), "ether") / 1e9;
  maxPriorityFeePerGas = web3.utils.toWei(maxPriorityFeePerGas.toString(), "ether") / 1e9;

  // Type 2 transaction is for EIP1559
  const tx = {
    type: 2,
    gas: "21000",
    nonce,
    to,
    maxPriorityFeePerGas,
    maxFeePerGas,
    value: amount,
  };

  try {
    const signedTx = await account.signTransaction(tx);
    const txHash = signedTx.transactionHash;

    console.log(`View transaction with nonce ${nonce}: https://testnet.snowtrace.io/tx/${txHash}`);

    // Sending a signed transaction and waiting for its inclusion
    web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    const timeout = setInterval(async () => {
      if(await web3.eth.getTransactionReceipt(txHash) != null) {
        console.log(`tx with nonce ${nonce} accepted`)
        pendingTxNonces.indexOf(nonce) !== -1 && pendingTxNonces.splice(pendingTxNonces.indexOf(nonce), 1);		
        clearInterval(timeout);
      }
    }, 500)

    return txHash;
  } catch (err) {
    console.log(err)
    console.log(`Error with nonce ${nonce}`);
    console.log(`Resending tx with ${nonce} to same address.`);

    // resending to same address with higher priority fee
    return sendAvaCUtil(amount, to, undefined, 10, nonce);
  }
};

export {
  sendAvaC,
  web3,
  CONFIG_C
}

module.exports = {
  sendAvaC,
  web3,
  CONFIG_C
};
