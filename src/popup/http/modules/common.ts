import { httpGet, httpPost } from '../request'
import { wormholesscanApi,wormholesApi,contractApi } from '@/popup/http/httpUrl'


// One click to create an exchange
export const createExchange = (data: any) => {
    return httpGet(`${wormholesApi}/install/do_conf`, data)
}

// Query whether the exchange is generated successfully
export const is_install = (address: string) => {
    return httpGet(`${wormholesApi}/install/is_install`, { address: address.toLowerCase() })
}




// One click exchange to get the address /v2/getSysParam
export const getSysParams = (address: string) => {
    return httpGet(`${wormholesApi}/c${address.toLowerCase()}/v2/querySysParams`, {})
}

// Set system information
export const modifySysParams = (address: string, params = {}) => {
    console.log('params', JSON.stringify(params))
    return httpPost(`${wormholesApi}/c${address.toLowerCase()}/v2/modifySysParams`, params)
}

// Set one touch exchange data
export const setExchangeSig = (address: string, params = {}) => {
    console.log('params', JSON.stringify(params))
    return httpPost(`${wormholesApi}/c${address.toLowerCase()}/v2/setExchangeSig`, params)
}
/**
 * Query the signature data of the exchange
 * @param address 
 * @param params 
 * @returns boolean
 */
 export const getExchangeSig = (address: string, params = {}) => {
    return httpGet(`${wormholesApi}/c${address.toLowerCase()}/v2/getExchangeSig`, params)
}


// 
export const checkAuth = (address: string) => {
    return httpGet(`${contractApi}/extra/checkAuth`,{address})
}

// Get the smart contract address
export const getContractAddress = () => {
    return httpGet(`${wormholesscanApi}/ERBPay.json?${new Date().getTime()}`)
}


