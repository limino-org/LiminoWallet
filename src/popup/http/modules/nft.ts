

import { httpGet,httpPost } from '../request'
import { wormholesscanApi,wormholesApi,snftUrl,snftUrl2,contractApi } from '@/popup/http/httpUrl'
const exchantest = 'c0x5051580802283c7b053d234d124b199045ead750'


// Get NFT according to owner
export function getNftOwner(params = {}){
    return httpGet(`${wormholesscanApi}/nft_meta/page`, params)
}



// Get snft by owner
export function getSnftOwner(params = {}){
    return httpGet(`${wormholesscanApi}/snft_meta/page`, params)
}

// Exchange casting nft
export function uploadNft(params = {}){
    return httpPost(`${wormholesApi}/v2/upload`, params)
}

// Query collection
export function collectionList(params = {}) {
    return httpGet(`${wormholesscanApi}/collect/page`, params)
}




/**
 * Query snft list of collections
 * @param params 
 * @returns 
 */
export function snftCollectionById(params = {}){
    const { id }: any = params
    return httpGet(`${wormholesscanApi}/snft/collection/0x${id || ''}`)
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
    return httpGet(`${snftUrl}/snft/collection/page`, params)
}

/**
 * Specify 256 fragments by ID query
 * @param id 
 * @returns 
 */
export function snftGroup(id: string) {
    return httpGet(`${wormholesscanApi}/snft/group/${id}`, {})
}




/**
 * /v2/querySnftByCollection
 * According to the classification, the owner search set
 */
export function queryOwnerSnftCollections(params ={}){
    return httpPost(`${snftUrl}/v2/queryOwnerSnftCollections`, params)
}

// /**
//  * Search snft according to the collection
//  * @param params createaddr
//  * @param params name 
//  * @param params start_index
//  * @param params count
//  * @returns 
//  */
// export function querySnftByCollection(params ={}){
//     return httpPost(`${snftUrl}/v2/querySnftByCollection`, params)
// }

/**
 * Search snft according to the collection
 * @param params createaddr
 * @param params name
 * @param params start_index
 * @param params count
 * @returns 
 */
 export function queryOwnerSnftChipAmount(params ={}){
    return httpPost(`${snftUrl}/v2/queryOwnerSnftChipAmount`, params)
}


/**
 * Check the number of snft held according to the collection
 * @package params 
 */
export function querySnftByCollection(params ={}){
    return httpPost(`${snftUrl2}/${exchantest}/v2/querySnftByCollection`, params)
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
    return httpPost(`${snftUrl2}/${exchantest}/v2/querySnftChip`, params)
}



// Query automatically synthesized SNFT data
export const snft_com_page = (params = {}) => {
    return httpGet(`${contractApi}/snft_com/page`,params)
   
  }
  // Example Query SNFT data
export const getSnftList = (params = {}) => {
   return httpGet(`${wormholesscanApi}/snft/page`,params)
}
  

export const queryArraySnft = (params = {}) => {
    return httpPost(`${snftUrl2}/${exchantest}/v2/queryArraySnft`,params)
   
  }
  // 查询指定地址的账户信息
export const getAccount = (address: string) => {
    return httpGet(`${wormholesscanApi}/account/${address}`)
}

