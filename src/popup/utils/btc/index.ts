Object.defineProperty(global,  '_bitcore', { 	get(){ 		return undefined 	}, 	set(){} })
// @ts-nocheck
import bitcore from "bitcore-lib";
console.log('bitcore', bitcore)
import { onMounted, ref } from "vue";
const { PrivateKey, Address, Networks, Transaction, HDPrivateKey, Mnemonic, Message } = bitcore;

const bip39 = require('bip39');

import axios from "axios";
import { VUE_APP_NODE_ENV } from "@/popup/enum/env";
import { httpPost } from "@/popup/http/request";
import { BTCMnemonicAccountInfo, BTCPrivateKeyAccountInfo, sendPrams } from "./btc";
const isProduct = VUE_APP_NODE_ENV === 'production' ? true : false;
const network = isProduct ? Networks.bitcore : Networks.testnet
const baseUrl = `https://api.bitcore.io/api/BTC/testnet`;
const bitcoinTransaction = require('bitcoin-transaction');
// const config = `https://user:pass@api.bitcore.io/api/BTC/testnet`
console.log('send ---', bitcoinTransaction)
console.log('Mnemonic', Mnemonic)
console.log('bip39', bip39)
// bitcoinTransaction.providers.utxo.testnet.default = bitcoinTransaction.providers.utxo.testnet.blockchain;


// Fetch Api
const fetcher = (url: string) => axios.get(url).then((res) => res.data);
const post = (url: string) => axios.post(url).then((res) => res.data);
// Get balance for address
export const getBalance = (address: string) => {
    const url = `${baseUrl}/address/${address}/balance`;
    return fetcher(url);
};

export const getUtxos = (address: string) => {
    // return insight
    const url = `${baseUrl}/address/${address}/?unspent=true`
    return fetcher(url);
}

export const selectUtxo = async(address: string, value: number) => {
    const utxos = await getUtxos(address)
    return utxos.find(item => item.value > value)
}


export const send = (params: sendPrams): Promise<string> => {
    const url = `${baseUrl}/tx/send`
    return axios.post(url, params).then(res => res.data.txid)
}

export const getTx = (txid: string) => {
    const url = `${baseUrl}/tx/${txid}`
    return fetcher(url)
}

export const getTxs = (address: string) => {
    const url = `${baseUrl}/address/${address}/txs`
    return fetcher(url)
}

export const getBlockNumber = () => {
    const url = `${baseUrl}/block/tip`
    return fetcher(url)
}

// TODO gas estimate
export const gasEstimate = () => {

}

export const getAuthHead = (txid: string) => {
    const url = `${baseUrl}/tx/${txid}/authhead`
    return fetcher(url)
}

export const getBlockHash = (blockHash: string) => {
    const url = `${baseUrl}/tx?blockHash=${blockHash}`
    return fetcher(url)
}

export const getCoins = (txid: string) => {
    const url = `${baseUrl}/tx/${txid}/coins`
    return fetcher(url)
}

export default () => {
    setInterval(async() => {
        const block = await getBlockNumber()
        console.warn('getBlockNumber', block.height)
    },2000)
    // Import an account using a private key
    const handleImportPrivateKey = async (privateKey: string): Promise<BTCPrivateKeyAccountInfo> => {
        try {
            const privateKeyInstance = new PrivateKey(privateKey)
            const privateKeyStr = privateKeyInstance.toString()
            const wif = privateKeyInstance.toWIF()
            const address = privateKeyInstance.toAddress(network).toString();
            return {
                privateKey: privateKeyStr,
                wif,
                address
            }
        } catch (err) {
            console.error(err)
        }
    }

    // Sign with the private key
    const handleSignWithPrivateKey = (message: string, privateKey: string) => {
        console.log('sign', message, privateKey)
        const privateKeyIns = new PrivateKey(privateKey, network);
        console.log('privateKeyIns', privateKeyIns)
        const messageIns = new Message(message);
        console.log('messageIns', messageIns)
        const signature = messageIns.sign(privateKeyIns);
        console.log('signature', signature)
        return signature
    }


    // verify sign
    const handleVerifySign = (address: string, message: string, signature: string) => {
        const verified = new Message(message).verify(address, signature);
        console.log('verified', verified)
        return verified
    }

    // Return account's path string
    const getPath = (index: number) => {
        return `m/44'/0'/0'/0/${index}`
    }
    // Import an account useing a mnemonic, with account index
    const handleImportMnemonic = async (mnemonic: string, index: number = 0): Promise<BTCMnemonicAccountInfo> => {
        try {
            const valid = bip39.validateMnemonic(mnemonic)
            console.log('valid', valid)
            if (valid) {
                // calc seed:
                const seedHex = await bip39.mnemonicToSeed(mnemonic);
                console.log('seed: ' + seedHex); // b59a8078...c9ebfaaa
                // generate root:
                const root = bitcore.HDPrivateKey.fromSeed(seedHex);
                console.log('root', root)
                const pri = root.deriveChild(index);
                console.log('pri', pri)
                const privateKeyStr = pri.privateKey.toString()
                console.log('privateKey', privateKeyStr)

                const address = pri.privateKey.toAddress(network).toString()
                console.log('address', address)

                return {
                    privateKey: privateKeyStr,
                    publicKey: '',
                    address,
                    pathIndex: index
                }
            }

        } catch (err) {
            console.error(err)
        }
    }


    // Generate subaccounts based on mnemonics 
    const handleGenerateAccountByMnemonic = () => {

    }

    // Generate random 
    // const 

    const handleSendTransaction = async (privateKeyStr: string, from: string, to: string) => {
        // Transaction.UnspentOutput(from)
        console.log(privateKeyStr,from, to)
        const privateKey = new PrivateKey(privateKeyStr);


        return new Promise(async(resolve,reject) => {
            try {
                const ut = await selectUtxo(from, 50000)
                const {mintTxid,script,mintIndex, address,value} = ut
                const utxo = {
                    "txId" : mintTxid,
                    "outputIndex" : mintIndex,
                    "address" : address,
                    "script" : script,
                    "satoshis" : value
                  };
                  console.log('utxo', utxo)
                  const tx = new Transaction()
                    .from(utxo)
                    .to(to, 50000)
                    .sign(privateKey)
                    .serialize();
                  console.log('tx', tx)
                  const txid = await send({rawTx: tx})
                  console.log('txid', txid)
                  const txData = await getTx(txid)
                  resolve(txData)
            }catch(err){
                reject(err)
                console.error(err)
            }
        })

    }
    return {
        getBalance,
        fetcher,
        handleImportPrivateKey,
        handleSignWithPrivateKey,
        handleImportMnemonic,
        handleGenerateAccountByMnemonic,
        handleVerifySign,
        handleSendTransaction
    }
}




