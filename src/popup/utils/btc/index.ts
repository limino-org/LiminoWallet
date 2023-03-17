Object.defineProperty(global, '_bitcore', {get() { return undefined },set(){}})
import axios from "axios";
import { BTCMnemonicAccountInfo, BTCPrivateKeyAccountInfo, FeeRes, RPCBlockRes, RPCHeightRes, RPCOutputRes, RPCTxRes, RPCTxsRes, SelectUtxoRes, sendPrams } from "./type";
import { baseUrl, gasFeeUrl, network } from "./config";
import { getFee, selectUtxo, send, getBalance, fetcher } from './rpc'
const bitcore = require("bitcore-lib");
console.log('bitcore', bitcore)
const { PrivateKey, Address, Networks, Transaction, HDPrivateKey, Mnemonic, Message } = bitcore;
const bip39 = require('bip39');


export default () => {
    const handleImportPrivateKey = async (privateKey: string): Promise<BTCPrivateKeyAccountInfo> => {
        try {
            const privateKeyInstance = new PrivateKey(privateKey)
            const privateKeyStr = privateKeyInstance.toString()
            const wif = privateKeyInstance.toWIF()
            const address = privateKeyInstance.toAddress(network).toString();
            const publicKey = privateKeyInstance.publicKey.toString()
            return {
                privateKey: privateKeyStr,
                wif,
                address,
                publicKey
            }
        } catch (err) {
            console.error(err)
            throw Error(err)
        }
    }

    // Sign with the private key
    const handleSignWithPrivateKey = (message: string, privateKey: string): string => {
        const privateKeyIns = new PrivateKey(privateKey, network);
        const messageIns = new Message(message);
        const signature = messageIns.sign(privateKeyIns);
        return signature
    }


    // verify sign
    const handleVerifySign = (address: string, message: string, signature: string): boolean => {
        const verified = new Message(message).verify(address, signature);
        return verified
    }


    // Import an account useing a mnemonic, with account index
    const handleImportMnemonic = async (mnemonic: string, index: number = 0): Promise<BTCMnemonicAccountInfo> => {
        try {
            const valid = bip39.validateMnemonic(mnemonic)
            if (valid) {
                // calc seed:
                const seedHex = await bip39.mnemonicToSeed(mnemonic);
                // generate root:
                const root = bitcore.HDPrivateKey.fromSeed(seedHex);
                const pri = root.deriveChild(index);
                const privateKeyStr = pri.privateKey.toString()
                const address = pri.privateKey.toAddress(network).toString()
                const pubKeyStr = pri.privateKey.publicKey.toString()
                return {
                    privateKey: privateKeyStr,
                    publicKey: pubKeyStr,
                    address,
                    pathIndex: index
                }
            } else {
                throw Error('The mnemonic is in the wrong form')
            }
        } catch (err) {
            console.error(err)
            throw Error(err)
        }
    }


    // Generate random 
    // const 

    const handleSendTransaction = async (privateKeyStr: string, from: string, to: string, sendVal: number): Promise<string> => {
        // Transaction.UnspentOutput(from)
        console.log(privateKeyStr, from, to)
        const privateKey = new PrivateKey(privateKeyStr);
        return new Promise(async (resolve, reject) => {
            try {
                const { fastestFee, halfHourFee, hourFee } = await getFee()
                const { inputs } = await selectUtxo(from, sendVal, fastestFee)
                let list = []
                if (inputs && inputs.length) {
                    list = inputs.map(({ mintTxid, script, mintIndex, address, value }) => ({
                        txId: mintTxid,
                        outputIndex: mintIndex,
                        address,
                        script,
                        satoshis: value
                    }))
                    const tx = new Transaction()
                        .from(list)
                        .to(to, sendVal)
                        .sign(privateKey)
                        .serialize();
                    const txid = await send({ rawTx: tx })
                    // const txData = await getTx(txid)
                    resolve(txid)
                } else {
                    reject('The balance is not enough')
                }

            } catch (err) {
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
        handleVerifySign,
        handleSendTransaction
    }
}




