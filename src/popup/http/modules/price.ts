// https://api.etherscan.io/api?module=stats&action=ethprice&apikey=YourApiKeyToken


import { httpGet } from '../request'

import { wormholesscanApi } from '@/popup/http/httpUrl'



// Get NFT according to owner
export function erb_price(params = {}){
    return httpGet(`${wormholesscanApi}/erb_price`, params)
}



