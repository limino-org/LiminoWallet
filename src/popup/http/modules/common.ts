import { httpGet, httpPost } from '../request'
import { scanApi, snftUrl, snftUrl3 } from '@/popup/http/httpUrl'


// One click to create an exchange
export const createExchange = (data: any) => {
    return httpGet(`${snftUrl3}/install/do_conf`, data)
}

// Query whether the exchange is generated successfully
export const is_install = (address: string) => {
    return httpGet(`${snftUrl3}/install/is_install`, { address: address.toLowerCase() })
}




// One click exchange to get the address /v2/getSysParam
export const getSysParams = (address: string) => {
    return httpGet(`${snftUrl3}/c${address.toLowerCase()}/v2/querySysParams`, {})
}

// Set system information
export const modifySysParams = (address: string, params = {}) => {
    console.log('params', JSON.stringify(params))
    return httpPost(`${snftUrl3}/c${address.toLowerCase()}/v2/modifySysParams`, params)
}

// Set one touch exchange data
export const setExchangeSig = (address: string, params = {}) => {
    console.log('params', JSON.stringify(params))
    return httpPost(`${snftUrl3}/c${address.toLowerCase()}/v2/setExchangeSig`, params)
}
/**
 * Query the signature data of the exchange
 * @param address 
 * @param params 
 * @returns boolean
 */
export const getExchangeSig = (address: string, params = {}) => {
    return httpGet(`${snftUrl3}/c${address.toLowerCase()}/v2/getExchangeSig`, params)
}


// 
export const checkAuth = (address: string) => {
    return httpGet(`${scanApi}/extra/checkAuth`, { address })
}

// Get the smart contract address
export const getContractAddress = () => {
    return httpGet(`https://www.limino.com/upload/ERBPay.json?${new Date().getTime()}`)
}

export const getConfiguration = () => {
    return httpGet(`https://www.limino.com/upload/configuration.json?${new Date().getTime()}`)
}
export const getRedemption = () => {
    return httpGet(`https://www.limino.com/wallet_conf/wallet.json?${new Date().getTime()}`)
}

// Query the account information of the specified address
export const getAccountAddr = (address: string) => {
    return httpGet(`${scanApi}/account/${address}`, {})
}



export interface CreatorData {
    address: string
    count: number
    lastEpoch: string
    lastNumber: number
    lastTime: number
    number: number
    profit: string
    reward: string
    timestamp: number
}
// specifies the address to query the creator
export const getCreator = (address: string): Promise<CreatorData> => {
    return httpGet(`${scanApi}/creator/${address}`, {})
}


// specifies the ID to query the NFT period information of the system, including 16 collection information
export const getPeriodById = (id: string): Promise<any> => {
    return httpGet(`${snftUrl}/epoch/${id}`, {})
}