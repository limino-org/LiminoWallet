import axios, { Axios } from "axios";
import { gasFeeUrl } from "./config";
import { AddWalletParams, BTCMnemonicAccountInfo, BTCPrivateKeyAccountInfo, FeeRes, RPCBalanceRes, RPCBlockRes, RPCHeightRes, RPCOutputRes, RPCTxRes, RPCTxsRes, SelectUtxoRes, sendPrams } from "./type";
import store from "@/popup/store";
const coinSelect = require('coinselect')



// Fetch Api
export const fetcher = (url: string) => axios.get(url).then((res) => res.data);
export const post = (url: string) => axios.post(url).then((res) => res.data);

export const getBaseUrl = () => {
   return store.state.account.currentNetwork.URL
}

// Get balance for address
export const getBalance = (address: string):Promise<RPCBalanceRes> => {
    const url = `${getBaseUrl()}/address/${address}/balance`;
    return fetcher(url);
};

// Get fee
export const getFee = (): Promise<FeeRes> => {
    const url = gasFeeUrl
    return fetcher(url);
}

export const getUtxos = (address: string): Promise<Array<RPCOutputRes>> => {
    const url = `${getBaseUrl()}/address/${address}/?limit=9999&unspent=true`
    return fetcher(url);
}

// Select the optimal UTXOS
export const selectUtxo = async (address: string, value: number, feeRate: number, pubKey: string): Promise<SelectUtxoRes> => {
    console.log('address', address, value, feeRate)
    const utxos = await getUtxos(address)
    const targets = [
        {
            address,
            value
        }
    ]
    return coinSelect(utxos, targets, feeRate)
}

// Send a transaction
export const send = async (params: sendPrams): Promise<string> => {
    const url = `${getBaseUrl()}/tx/send`
    const res = await axios.post(url, params);
    return res.data.txid;
}


// Add wallet
export const addWallet = (params: AddWalletParams) => {
    const url = `${getBaseUrl()}/wallet/`
    return axios.post(url, params);
}

export const importAddress = (pubKey: string, address: string) => {
    const url = `${getBaseUrl()}/wallet/${pubKey}`
    return axios.post(url, {address});
}

export const getTx = (txid: string): Promise<RPCTxRes> => {
    const url = `${getBaseUrl()}/tx/${txid}`
    return fetcher(url)
}

export const getTxs = (address: string): Promise<RPCTxsRes> => {
    const url = `${getBaseUrl()}/address/${address}/txs`
    return fetcher(url)
}

// Get Block
export const getBlock = (blockId: string): Promise<RPCBlockRes> => {
    const url = `${getBaseUrl()}/block/${blockId}`
    return fetcher(url)
}

// Get Current Height
export const getHeight = (): Promise<RPCHeightRes> => {
    console.warn('tip...')
    const url = `${getBaseUrl()}/block/tip`
    return fetcher(url)
}

export const getAuthHead = (txid: string) => {
    const url = `${getBaseUrl()}/tx/${txid}/authhead`
    return fetcher(url)
}

export const getBlockHash = (blockHash: string) => {
    const url = `${getBaseUrl()}/tx?blockHash=${blockHash}`
    return fetcher(url)
}

export const getCoins = (txid: string) => {
    const url = `${getBaseUrl()}/tx/${txid}/coins`
    return fetcher(url)
}

// TODO Obtain transaction receipt
export const waitBTCTransaction = (txid: string) => {

}



const service = axios.create({
    // Set the baseur address. If you cross domains through proxy, you can directly fill in the base address
    baseURL: '/',
    // Define unified request headers
    headers: {
       "Content-Type": "application/json; charset=UTF-8"
    },
    // Configure request timeout
    timeout: 60000, 
    auth: {
        username: 'admin',
        password: '123456'
      },
    // If jsonp is used, this parameter can be configured to bring cookie credentials. If it is proxy or CORS, it does not need to be set
})
/**
 * RPC Request
 * {"jsonrpc": "1.0", "id":"curltest", "method": "getblockchaininfo", "params": [] }
 */

export function btcRpcRequest(method: string, params: Array<any> = []): Promise<any> {
    console.warn('btcRpcRequest',method ,params)
    return service({
        url:'http://192.168.1.235:18443',
        method:"POST",
        data: {
            jsonrpc: "1.0", 
            id: "wallet",
            method,
            params
        }

    })
}


