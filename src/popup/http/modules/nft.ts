

import { httpGet,httpPost } from '../request'
import { scanApi,snftUrl4,nftmintApi } from '@/popup/http/httpUrl'


// Get NFT according to owner
export function getNftOwner(params = {}){
    return httpGet(`${scanApi}/nft_meta/page`, params)
}



// Get snft by owner
export function getSnftOwner(params = {}){
    return httpGet(`${scanApi}/snft_meta/page`, params)
}





// Query collection
export function collectionList(params = {}) {
    return httpGet(`${scanApi}/collect/page`, params)
}




/**
 * Query snft list of collections
 * @param params 
 * @returns 
 */
export function snftCollectionById(params = {}){
    const { id }: any = params
    return httpGet(`${scanApi}/snft/collection/0x${id || ''}`)
}

/**
 * Query the collection under the specified account name
 * @param params {status}  1:pledged, 2:unPledged, other:all
 * @param params {owner}
 * @param params {page}
 * @param params {page_size}
 * @returns 
 */
export function collectionListPage(params = {}) {
    return httpGet(`${scanApi}/snft/collection/page`, params)
}

/**
 * Specify 256 fragments by ID query
 * @param id 
 * @returns 
 */
export function snftGroup(id: string) {
    return httpGet(`${scanApi}/snft/group/${id}`, {})
}




/**
 * /v2/querySnftByCollection
 * According to the classification, the owner search set
 */
export function queryOwnerSnftCollections(params ={}){
    return httpPost(`${snftUrl4}/v2/queryOwnerSnftCollections`, params)
}

export function queryAllSnftByCollection(params= {}) {
    return httpPost(`${snftUrl4}/v2/queryAllSnftByCollection`, params)
}

/**
 * Search snft according to the collection
 * @param params createaddr
 * @param params name 
 * @param params start_index
 * @param params count
 * @returns 
 */
export function queryCollectionAllSnft(params ={}){
    return httpPost(`${snftUrl4}/v2/queryCollectionAllSnft`, params)
}

/**
 * Search snft according to the collection
 * @param params createaddr
 * @param params name
 * @param params start_index
 * @param params count
 * @returns 
 */
 export function queryOwnerSnftChipAmount(params ={}){
    return httpPost(`${snftUrl4}/v2/queryOwnerSnftChipAmount`, params)
}


/**
 * Check the number of snft held according to the collection
 * @package params 
 */
export function querySnftByCollection(params ={}){
    return httpPost(`${snftUrl4}/v2/querySnftByCollection`, params)
}


/**
 * Query 256 fragments of snft fragments
 * @param params nft_contract_addr
 * @param params nft_token_id
 * @param params start_index
 * @param params count
 * @returns 
 */
export function QuerySnftChip(params = {}){
    return httpPost(`${snftUrl4}/v2/querySnftChip`, params)
}



// Query automatically synthesized SNFT data
export const snft_com_page = (params = {}) => {
    return httpGet(`${scanApi}/snft_com/page`,params)
   
  }
  // Example Query SNFT data
export const getSnftList = (params = {}) => {
   return httpGet(`${scanApi}/snft/page`,params)
}
  

export const queryArraySnft = (params = {}) => {
    return httpPost(`${snftUrl4}/v2/queryArraySnft`,params)
}

interface Response {
  code: string
  data: any
}

interface  QueryAllSnftByStageParams  {
  stage_addr: string
  start_index: string
  count:string
  snfttype: "chip" | "snft" | "collect"
}

export const queryAllSnftByStage = (params: QueryAllSnftByStageParams): Promise<Response>  => {
  return httpPost(`${snftUrl4}/v2/queryAllSnftByStage`, params)
}

interface  QueryOwnerStageParams  {
  owner_addr: string
  start_index: string
  count:string
}
export const queryOwnerStage = (params: QueryOwnerStageParams): Promise<Response> => {
  return httpPost(`${snftUrl4}/v2/queryOwnerStage`, params)
}



  // Query the account information about the specified address
export const getAccount = (address: string) => {
    return httpGet(`${scanApi}/account/${address}`)
}



export const getOwnerNftList = (params = {}) => {
  return httpGet(`${scanApi}/nft/page`,params)
}
export interface GetDrawInfoParams {
    useraddr: string
    index: string
    count: string
  }
  export const getDrawInfoByUser = (params: GetDrawInfoParams) => {
    return httpPost(`${nftmintApi}/v1/getDrawInfoByUser`, params)
  
  }
  
  export interface EmailParams {
    useraddr: string
  }
  export const getEmailByUser = (params: EmailParams) => {
    return httpPost(`${nftmintApi}/v1/getEmailByUser`, params)
  
  }
  
  
  export interface DrawListParams {
    nftaddrs: string
  }
  export const getDrawInfoByNftaddrs = (params: DrawListParams) => {
    return httpPost(`${nftmintApi}/v1/getDrawInfoByNftaddrs`, params)
  
  }
  
  
  
  
  export const getPaintFee = () => {
    return httpPost(`${nftmintApi}/v1/getPaintFee`, {})
  }
  export interface DrawImageParams {
    useraddr: string
    nftaddr: string
    email: string
    drawflag: string
  }
  export const drawImage = (params: DrawImageParams) => {
    return httpPost(`${nftmintApi}/v1/drawImage`, params)
  }
  
  
  export const getAiServerAddr = () => {
    return httpPost(`${nftmintApi}/v1/getAiServerAddr`, {})
  }
  
