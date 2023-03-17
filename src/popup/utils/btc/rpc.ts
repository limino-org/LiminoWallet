import axios from "axios";
import { baseUrl, gasFeeUrl, network } from "./config";
import { BTCMnemonicAccountInfo, BTCPrivateKeyAccountInfo, FeeRes, RPCBalanceRes, RPCBlockRes, RPCHeightRes, RPCOutputRes, RPCTxRes, RPCTxsRes, SelectUtxoRes, sendPrams } from "./type";
const coinSelect = require('coinselect')



// Fetch Api
export const fetcher = (url: string) => axios.get(url).then((res) => res.data);
export const post = (url: string) => axios.post(url).then((res) => res.data);

// Get balance for address
export const getBalance = (address: string):Promise<RPCBalanceRes> => {
    const url = `${baseUrl}/address/${address}/balance`;
    return fetcher(url);
};

// Get fee
export const getFee = (): Promise<FeeRes> => {
    const url = gasFeeUrl
    return fetcher(url);
}

export const getUtxos = (address: string): Promise<Array<RPCOutputRes>> => {
    const url = `${baseUrl}/address/${address}/?unspent=true`
    return fetcher(url);
}

// Select the optimal UTXOS
export const selectUtxo = async (address: string, value: number, feeRate: number): Promise<SelectUtxoRes> => {
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
    const url = `${baseUrl}/tx/send`
    const res = await axios.post(url, params);
    return res.data.txid;
}

export const getTx = (txid: string): Promise<RPCTxRes> => {
    const url = `${baseUrl}/tx/${txid}`
    return fetcher(url)
}

export const getTxs = (address: string): Promise<RPCTxsRes> => {
    const url = `${baseUrl}/address/${address}/txs`
    return fetcher(url)
}

// Get Block
export const getBlock = (blockId: string): Promise<RPCBlockRes> => {
    const url = `${baseUrl}/block/${blockId}`
    return fetcher(url)
}

// Get Current Height
export const getHeight = (): Promise<RPCHeightRes> => {
    const url = `${baseUrl}/block/tip`
    return fetcher(url)
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

// TODO Obtain transaction receipt
export const waitBTCTransaction = (txid: string) => {

}