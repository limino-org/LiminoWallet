
const bitcore = require("bitcore-lib");
import axios from "axios";
const { PrivateKey, Address, Networks, Transaction, HDPrivateKey, Mnemonic, Message } = bitcore;
const bip39 = require('bip39');
import useBTC from '@/popup/utils/btc/index'
import { getBalance, getUtxos, getTx, getTxs, getBlock, getHeight, getAuthHead, getBlockHash, getCoins, getFee } from './rpc'
import { isProduct } from './config';
import { RPCBalanceRes, SelectUtxoRes, RPCTxRes, RPCTxsRes, RPCBlockRes, RPCHeightRes, RPCAuthheadRes, RPCBlockHashRes, RPCCoinsRes, RPCOutputRes, FeeRes } from './type';
const { handleImportMnemonic, handleImportPrivateKey, handleSignWithPrivateKey, handleVerifySign, handleSendTransaction } = useBTC()


export class BTCWallet {
    // private key
    private privateKey: string;
    // public key
    private publicKey: string;
    // account address
    address: string;
    private wif: string
    network: string
    baseUrl: string
    provider: Provider
    constructor(privateKey?: string, network?: any) {
        if (privateKey && network) {
            try {
                let pristr = ''
                if (privateKey.toString().startsWith('0x')) {
                    pristr = privateKey.substr(2, privateKey.length)
                } else {
                    pristr = privateKey
                }
                this.privateKey = pristr
                const privateKeyIns = new PrivateKey(pristr, network)
                const address = privateKeyIns.toAddress().toString();
                // Derive the public key, address, and wif from the private key
                const wif = privateKeyIns.toWIF()
                const pubKey = privateKeyIns.publicKey.toString()
                this.wif = wif
                this.address = address
                this.network = network
                this.publicKey = pubKey
                this.provider = new Provider(network)
            } catch (err) {
                throw err
            }
        }
    }
    // sign message
    sigMessage(msg: string): string {
        return handleSignWithPrivateKey(msg, this.privateKey)
    }
    // send transaction
    sendTransaction(to: string, value: number, fee: number = 50): Promise<string> {
        return handleSendTransaction(this.privateKey, this.address, to, value, 10)
    }
}



class Provider extends BTCWallet {
    isProduct: boolean
    network: any
    waitIns: any
    timeoutIns: any
    waitSecond: number
    waitPeriod: number
    constructor(network: any) {
        super()
        // this.isProduct = isProduct
        this.network = network
        this.waitIns = null
        this.timeoutIns = null
        this.waitPeriod = 5000
    }
    removeAllListeners() {
        this.waitIns = null
        this.timeoutIns = null
        clearInterval(this.waitIns)
        clearInterval(this.timeoutIns)
    }
    waitForTransaction(hash: string, bool: null, time: number | null = null ) {
        console.log('this 000', this)
       return new Promise((resolve, reject) => {
        if(!time) {
            const ins = setInterval(async() => {
                console.log('this', this, ins)
                try {
                    const tx = await this.getTx(hash)
                    resolve(tx)
                    this.waitIns = null
                    clearInterval(this.waitIns)
                    clearInterval(ins)
                }catch(err) {
                    reject(err)
                }
            }, this.waitPeriod)
            this.waitIns = ins
        } else {
            const ins = setInterval(async() => {
                console.log('this111', this)
                try {
                    const tx = await this.getTx(hash)
                    resolve(tx)
                    clearInterval(this.waitIns)
                }catch(err) {
                    reject(err)
                }
            }, this.waitPeriod)
            this.waitIns = ins
            const timeIns = setTimeout(async() => {
                this.timeoutIns = null
                this.waitIns = null
                reject('timeout in obtaining transaction information')
                clearInterval(ins)
                clearInterval(this.waitIns)
                clearTimeout(timeIns)
                clearTimeout(this.timeoutIns)
            }, time)
            this.timeoutIns = timeIns
        }
       })
    }
    getNetwork() {
        return getBalance(this.address)
    }
    getBalance(address?: string): Promise<RPCBalanceRes> {
        return getBalance(address || this.address)
    }
    getUtxos(): Promise<Array<RPCOutputRes>> {
        return getUtxos(this.address)
    }
    getTx(txid: string): Promise<RPCTxRes> {
        return getTx(txid)
    }
    getTxs(): Promise<RPCTxsRes> {
        return getTxs(this.address)
    }
    getBlock(blockId: string): Promise<RPCBlockRes> {
        return getBlock(blockId)
    }
    getHeight(): Promise<RPCHeightRes> {
        return getHeight()
    }
    getAuthHead(txid: string): Promise<RPCAuthheadRes> {
        return getAuthHead(txid)
    }
    getBlockHash(blockHash: string): Promise<RPCBlockHashRes> {
        return getBlockHash(blockHash)
    }
    getCoins(txid: string): Promise<RPCCoinsRes> {
        return getCoins(txid)
    }
    getFee(): Promise<FeeRes> {
        return getFee()
    }
}