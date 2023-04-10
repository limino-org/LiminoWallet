
const bitcore = require("bitcore-lib");
import axios from "axios";
const { PrivateKey, Address, Networks, Transaction, HDPrivateKey, Mnemonic, Message } = bitcore;
const bip39 = require('bip39');
import useBTC from '@/popup/utils/btc/index'
import { getBalance, getUtxos, getTx, getTxs, getBlock, getHeight, getAuthHead, getBlockHash, getCoins, getFee, addWallet, importAddress } from './rpc'
import { isProduct } from './config';
import { RPCBalanceRes, SelectUtxoRes, RPCTxRes, RPCTxsRes, RPCBlockRes, RPCHeightRes, RPCAuthheadRes, RPCBlockHashRes, RPCCoinsRes, RPCOutputRes, FeeRes } from './type';
import store from "@/popup/store";
const { handleImportMnemonic, handleImportPrivateKey, handleSignWithPrivateKey, handleVerifySign, handleSendTransaction, handleEstimateFee } = useBTC()

console.warn('bitcore', bitcore)
export class BTCWallet {
    // private key
    private privateKey: string;
    // public key
    private publicKey: string;
    // account address
    address: string;
    private wif: string
    network: any
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
                this.provider = new Provider(network, address)
                // this.addWallet()
                // this.importAddress()
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
        return handleSendTransaction(this.privateKey, this.address, to, value, fee)
    }
    addWallet(): Promise<any> {
        return addWallet({
            name: 'name',
            chain: 'BTC',
            network: this.network.name,
            pubKey: this.publicKey,
            path: ''
        })
    }
    estimateGas(to: string, value: number, fee: number = 80): Promise<any> {
        return handleEstimateFee(this.privateKey, this.address, to, value, fee)
    }

}



class Provider extends BTCWallet {
    isProduct: boolean
    network: any
    address: string;
    waitIns: any
    timeoutIns: any
    waitSecond: number
    baseUrl: string
    waitPeriod: number
    constructor(network: any, address) {
        super()
        // this.isProduct = isProduct
        this.network = network
        this.address = address
        this.waitIns = null 
        this.timeoutIns = null
        this.waitPeriod = 4000
    }
    removeAllListeners() {

        clearInterval(this.waitIns)
        clearInterval(this.timeoutIns)
        this.waitIns = null
        this.timeoutIns = null
    }
    waitForTransaction(hash: string, bool: null, time: number | null = null ) {
        console.log('this 000', this)
        let ins = null
        let ins2 = null
       return new Promise(async(resolve, reject) => {
        try {
            const tx = await this.getTx(hash)
            resolve(tx)
        }catch(err) {
           
        }
        if(!time) {
            ins = setInterval(async() => {
                console.log('this', this, ins)
                try {
                    const tx = await this.getTx(hash)
                    resolve(tx)
                    this.waitIns = null
                    clearInterval(this.waitIns)
                    clearInterval(ins)
                }catch(err) {
                   
                }
            }, this.waitPeriod)
            this.waitIns = ins
        } else {
            ins2 = setInterval(async() => {
                console.log('this111', this)
                try {
                    const tx = await this.getTx(hash)
                    resolve(tx)
                    clearInterval(ins2)
                }catch(err) {
                    
                }
            }, this.waitPeriod)
            this.waitIns = ins2
            const timeIns = setTimeout(async() => {
                this.timeoutIns = null
                this.waitIns = null
                reject('timeout in obtaining transaction information')
                clearInterval(ins)
                clearInterval(ins2)
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