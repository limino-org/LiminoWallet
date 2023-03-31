import { CoinType } from "@/popup/store/modules/account"

export interface BTCMnemonicAccountInfo {
    // Account privateKey
    privateKey: string
    // Account publicKey
    publicKey: string
    // Account address
    address: string
    // Account index
    pathIndex: number
}

export interface BTCPrivateKeyAccountInfo {
    // Account privateKey
    privateKey: string
    // Account publicKey
    publicKey?: string
    // Account address
    address: string
    wif: string
}
export enum ChainType {
    BTC = 'BTC',
    ETH = 'ETH',
    BCH = 'BCH'
}

//Send Raw Transaction params
export type sendPrams = {
    rawTx: string
}

//Get Balance for an Address
export type RPCBalanceRes = {
    confirmed: number,
    unconfirmed: number,
    balance: number
}

// Send Raw Transaction res
export type RPCSendRes = {
    txid: string
}

// Get Transactions by blockHash
export type RPCBlockHashRes = {
    _id: string,
    txid: string,
    network: BtcNetwork,
    chain: string,
    blockHeight: number,
    blockHash: string,
    blockTime: string,
    blockTimeNormalized: string,
    coinbase: true,
    locktime: number,
    inputCount: number,
    outputCount: number,
    size: number,
    fee: number,
    value: number,
    confirmations: number
}

// Get Transactions by blockHeight
export type RPCBlockHeightRes = {
    _id: string,
    txid: string,
    network: BtcNetwork,
    chain: string,
    blockHeight: number,
    blockHash: string,
    blockTime: string,
    blockTimeNormalized: string,
    coinbase: boolean,
    locktime: number,
    inputCount:number,
    outputCount:number,
    size: number,
    fee: number,
    value: number,
    confirmations: number
}

// Get Transaction by txid
export type RPCAuthheadRes = {
    authbase: string,
    chain: string,
    identityOutputs: Array<[]>,
    network: BtcNetwork
}

//Get Authhead


export type RPCOutputRes = {
    address: string,
    chain: string,
    coinbase: true,
    confirmations: number,
    mintHeight: number,
    mintIndex: number,
    mintTxid: string,
    network: BtcNetwork,
    script: string,
    spentHeight: number,
    spentTxid: string,
    value: number,
    _id:string
  }

//Get Coins
export type RPCCoinsRes = {
    inputs: Array<[]>,
    outputs: Array<RPCOutputRes>
}
//Get Address Transactions
export type RPCTxRes = RPCOutputRes

export type RPCTxsRes = Array<RPCOutputRes>

//Get Transaction Outputs by Address


//Get Block

//Get Current Height
export type RPCHeightRes = {
    _id: string,
    chain: string,
    network: BtcNetwork,
    hash: string,
    height: number,
    version: number,
    size: number,
    merkleRoot: string,
    time: string,
    timeNormalized: string,
    nonce: number,
    bits: number,
    previousBlockHash: string,
    nextBlockHash: string,
    reward: number,
    transactionCount: number,
    confirmations: number
}

export type RPCBlockRes = RPCHeightRes

export interface AddWalletParams {
    name: string,
    chain: string,
    network: CoinType,
    pubKey: string,
    path: string
}

export enum BtcNetwork {
    mainnet = 'mainnet',
    testnet = 'testnet',
}

export type OutPut = {
    address: string,
    value: number
}

export type SelectUtxoRes = { 
    inputs: Array<RPCOutputRes> | undefined,
    outputs: Array<OutPut> | undefined,
    fee: number | null
}

export type FeeRes = {
    fastestFee: number,
    halfHourFee: number,
    hourFee: number
}