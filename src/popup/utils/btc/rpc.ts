import axios, { Axios } from "axios";
import { baseUrl, gasFeeUrl, network } from "./config";
import { AddWalletParams, BTCMnemonicAccountInfo, BTCPrivateKeyAccountInfo, FeeRes, RPCBalanceRes, RPCBlockRes, RPCHeightRes, RPCOutputRes, RPCTxRes, RPCTxsRes, SelectUtxoRes, sendPrams } from "./type";
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
    const url = `${baseUrl}/address/${address}/?limit=9999&unspent=true`
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
    const url = `${baseUrl}/tx/send`
    const res = await axios.post(url, params);
    return res.data.txid;
}


// Add wallet
export const addWallet = (params: AddWalletParams) => {
    const url = `${baseUrl}/wallet/`
    return axios.post(url, params);
}

export const importAddress = (pubKey: string, address: string) => {
    const url = `${baseUrl}/wallet/${pubKey}`
    return axios.post(url, {address});
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

// {"jsonrpc":"1.0","id":"rpc","method":"getmempoolinfo", "params":[]}  
// {"jsonrpc":"1.0","id":"rpc","method":"getrawtransaction", "params":["' + transactionid + '"]} 
// {"jsonrpc":"1.0","id":"rpc","method":"decoderawtransaction", "params":["' + rawtransactiondata + '"]} 
// {"jsonrpc":"1.0","id":"rpc","method":"GetBestBlockHash", "params":[]} 返回最优链上最近区块的哈希
// {"jsonrpc":"1.0","id":"rpc","method":"GetBlock", "params":[]} 返回具有指定哈希的区块
// {"jsonrpc":"1.0","id":"rpc","method":"getblockchaininfo", "params":[]}  返回区块链当前状态信息
// {"jsonrpc":"1.0","id":"rpc","method":"GetBlockCount", "params":[]}  返回本地最优链上的区块数量
// {"jsonrpc":"1.0","id":"rpc","method":"GetBlockHash", "params":[]} 返回本地最有区块链上指定高度区块的哈希
// {"jsonrpc":"1.0","id":"rpc","method":"GetBlockHeader", "params":[]} 返回指定区块头
// {"jsonrpc":"1.0","id":"rpc","method":"GetChainTips", "params":[]} 返回每个本地区块链的最高位区块（tip）信息
// {"jsonrpc":"1.0","id":"rpc","method":"GetDifficulty", "params":[]} 返回POW难度
// {"jsonrpc":"1.0","id":"rpc","method":"GetMemPoolAncestors", "params":[]} 返回交易池内指定交易的所有祖先
// {"jsonrpc":"1.0","id":"rpc","method":"GetMemPoolDescendants", "params":[]} 返回交易池内指定交易的所有后代
// {"jsonrpc":"1.0","id":"rpc","method":"GetMemPoolEntry", "params":[]} 返回交易池内指定交易的池数据
// {"jsonrpc":"1.0","id":"rpc","method":"GetRawMemPool", "params":[]} 返回交易池内的所有交易
// {"jsonrpc":"1.0","id":"rpc","method":"GetTxOut", "params":[]} 返回指定交易输出的详细信息
// {"jsonrpc":"1.0","id":"rpc","method":"GetTxOutProof", "params":[]} 返回一个或多个交易的证明数据
// {"jsonrpc":"1.0","id":"rpc","method":"GetTxOutSetInfo", "params":[]} 返回UTXO集合的统计信息
// {"jsonrpc":"1.0","id":"rpc","method":"PreciousBlock", "params":[]} 
// {"jsonrpc":"1.0","id":"rpc","method":"PruneBlockChain", "params":[]} 对区块链执行剪枝操作
// {"jsonrpc":"1.0","id":"rpc","method":"VerifyChain", "params":[]}  验证本地区块链的每个记录
// {"jsonrpc":"1.0","id":"rpc","method":"VerifyTxOutProof", "params":[]} 验证交易输出证明



