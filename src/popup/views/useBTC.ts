
import bitcore from "bitcore-lib";
import Buffer from 'buffer'
// @ts-ignore
window.Buffer = Buffer
// const Message = require('bitcore-message')
import { onMounted, ref } from "vue";
const { PrivateKey, Address, Networks, Transaction, HDPrivateKey, Mnemonic, Message } = bitcore;

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

export default () => {
    // Import an account using a private key
    const handleImportPrivateKey = async(privateKey: string): Promise<BTCPrivateKeyAccountInfo> => {
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
        // const privateKeyInstance = new PrivateKey(privateKey, network)
        // // console.log('privateKeyInstance', privateKeyInstance, privateKeyInstance.toString())
        // // console.log('ADD', privateKeyInstance.toAddress(network).toString())
        // const messageStance = new Message(message);
        // // console.log('messageStance', messageStance)
        // const signature = messageStance.sign(privateKeyInstance);


        const privateKeyIns = new PrivateKey(privateKey, network);
        console.log('privateKeyIns', privateKeyIns)
        const messageIns = new Message(message);
        console.log('messageIns', messageIns)
        const signature = messageIns.sign(privateKeyIns);
        console.log('signature', signature)


        return signature
    }


    // verify sign
    const handleVerifySign = (sign: string) => {

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

    return {
        getBalance,
        fetcher,
        handleImportPrivateKey,
        handleSignWithPrivateKey,
        handleImportMnemonic,
        handleGenerateAccountByMnemonic,
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