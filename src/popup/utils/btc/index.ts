Object.defineProperty(global,  '_bitcore', {get(){return undefined}, 	set(){} })
const bitcore = require( "bitcore-lib");
console.log('bitcore', bitcore)
const coinSelect = require('coinselect')
import { onMounted, ref } from "vue";
const { PrivateKey, Address, Networks, Transaction, HDPrivateKey, Mnemonic, Message } = bitcore;
console.log('coinSelect',coinSelect)
const bip39 = require('bip39');

import axios from "axios";
import { VUE_APP_NODE_ENV } from "@/popup/enum/env";

import { BTCMnemonicAccountInfo, BTCPrivateKeyAccountInfo, FeeRes, RPCBlockRes, RPCHeightRes, RPCOutputRes, RPCTxRes, RPCTxsRes, SelectUtxoRes, sendPrams } from "./type";
const isProduct = VUE_APP_NODE_ENV === 'production' ? true : false;
const network = isProduct ? Networks.bitcore : Networks.testnet
const baseUrl = `https://api.bitcore.io/api/BTC/testnet`;

// Fetch Api
const fetcher = (url: string) => axios.get(url).then((res) => res.data);
const post = (url: string) => axios.post(url).then((res) => res.data);

// Get balance for address
export const getBalance = (address: string) => {
    const url = `${baseUrl}/address/${address}/balance`;
    return fetcher(url);
};

// Get fee
export const getFee = ():Promise<FeeRes> => {
    const url = 'https://bitcoinfees.earn.com/api/v1/fees/recommended'
    return fetcher(url);
}

export const getUtxos = (address: string): Promise<Array<RPCOutputRes>> => {
    // return insight
    const url = `${baseUrl}/address/${address}/?unspent=true`
    return fetcher(url);
}

export const selectUtxo = async(address: string, value: number, feeRate: number): Promise<SelectUtxoRes> => {
    const utxos = await getUtxos(address)
    const targets = [
        {
          address,
          value
        }
      ]
    return coinSelect(utxos, targets, feeRate)
}


export const send = async (params: sendPrams): Promise<string> => {
    const url = `${baseUrl}/tx/send`
    const res = await axios.post(url, params);
    return res.data.txid;
}

export const getTx = (txid: string):Promise<RPCTxRes> => {
    const url = `${baseUrl}/tx/${txid}`
    return fetcher(url)
}

export const getTxs = (address: string):Promise<RPCTxsRes> => {
    const url = `${baseUrl}/address/${address}/txs`
    return fetcher(url)
}

// Get Block
export const getBlock = (blockId: string): Promise<RPCBlockRes> => {
    const url = `${baseUrl}/block/${blockId}`
    return fetcher(url)
}

// Get Current Height
export const getHeight = ():Promise<RPCHeightRes> => {
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
        const block = await getHeight()
        console.warn('getBlock', block.height)
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
                const { fastestFee, halfHourFee, hourFee } = await getFee()
                console.log('fastestFee', fastestFee)
                const { inputs } = await selectUtxo(from, 20000, fastestFee)
                let list = []
                if(inputs && inputs.length) {
                    list = inputs.map(({mintTxid,script,mintIndex,address,value}) => ({
                        txId : mintTxid,
                        outputIndex : mintIndex,
                        address,
                        script,
                        satoshis : value
                    }))
                    console.log('utxo', list)
                    const tx = new Transaction()
                      .from(list)
                      .to(to, 20000)
                      .sign(privateKey)
                      .serialize();
                    console.log('tx', tx)
                    const txid = await send({rawTx: tx})
                    console.warn('txid', txid)
                    const txData = await getTx(txid)
                    resolve(txData)
                } else {
                    console.error('没钱了...')
                }

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




