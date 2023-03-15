// @ts-nocheck
import bitcore from "bitcore-lib";
const bitcoinjs = require('bitcoinjs-lib')
console.log('bitcore', bitcore)
console.log('bitcoinjs', bitcoinjs)
// import Buffer from 'buffer'
// // @ts-ignore
// window.Buffer = Buffer
// const Message = require('bitcore-message')
import { onMounted, ref } from "vue";
const { PrivateKey, Address, Networks, Transaction, HDPrivateKey, Mnemonic, Message } = bitcore;
// const explorers = require('bitcore-explorers');
// const insight = new explorers.Insight();
const bip39 = require('bip39');

import axios from "axios";
import { VUE_APP_NODE_ENV } from "../enum/env";
const isProduct = VUE_APP_NODE_ENV === 'production' ? true : false;
const network = isProduct ? Networks.bitcore : Networks.testnet
const baseUrl = `https://api.bitcore.io/api/BTC/testnet`;
console.log('Mnemonic', Mnemonic)
console.log('bip39', bip39)

// Fetch Api
const fetcher = (url: string) => axios.get(url).then((res) => res.data);
// Get balance for address
export const getBalance = (address: string) => {
    const url = `${baseUrl}/address/${address}/balance`;
    return fetcher(url);
};

export const ListUnspent = (address: string) => {
    const url = `${baseUrl}/address/${address}/ListUnspent`;
    const data= {
        MinimumConfirmations: 1,
        MaximumConfirmations: 9999999,
        Addresses: address
    }
    return axios({
        method:'get',
        url: url,
        data
    })
}


export default () => {
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
        insight.getUtxos(from, function(err, utxos) {
            if (err) {
                console.log('err', err)
              // Handle errors...
            } else {
                console.log('utxos', utxos)
              // Maybe use the UTXOs to create a transaction
            }
          });
        const privateKey = new PrivateKey(privateKeyStr);
        const utxo = {
            "txId": "115e8f72f39fad874cfab0deed11a80f24f967a84079fb56ddf53ea02e308986",
            "outputIndex": 0,
            "address": from,
            "script": "76a91447862fe165e6121af80d5dde1ecb478ed170565b88ac",
            "satoshis": 5000
        };

        const transaction = new Transaction()
            .from(utxo)
            .to(to, 15000)
            .sign(privateKey);
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



export const useBTCRpc = () => {

}

interface BTCMnemonicAccountInfo {
    // Account privateKey
    privateKey: string
    // Account publicKey
    publicKey: string
    // Account address
    address: string
    // Account index
    pathIndex: number
}

interface BTCPrivateKeyAccountInfo {
    // Account privateKey
    privateKey: string
    // Account publicKey
    publicKey?: string
    // Account address
    address: string
    wif: string
}