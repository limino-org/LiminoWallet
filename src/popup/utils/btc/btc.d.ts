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
    network: string,
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
    network: string,
    chain: string,
    blockHeight: 12,
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
    network: string
}

//Get Authhead


export type ResOutputRes =         {
    address: string,
    chain: string,
    coinbase: true,
    confirmations: number,
    mintHeight: number,
    mintIndex: number,
    mintTxid: string,
    network: string,
    script: string,
    spentHeight: number,
    spentTxid: string,
    value: number,
    _id:string
  }

//Get Coins
export type RPCCoinsRes = {
    inputs: Array<[]>,
    outputs: Array<ResOutputRes>
}
//Get Address Transactions

//Get Transaction Outputs by Address


//Get Block

//Get Current Height