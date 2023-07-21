
const isProduct = process.env.VUE_APP_NODE_ENV == 'production'

// Block browser  
export const wormholesscanApi = 'https://www.wormholesscan.com'
const exchantest = 'c0x5051580802283c7b053d234d124b199045ead750'


export const scanApi = 'https://api.wormholesscan.com'
// Test url
export const snftUrl = 'http://43.132.176.185:3001'
// export const snftUrl2 = 'http://192.168.1.235:9006'
export const snftUrl3 = 'https://hub.wormholes.com'
// export const snftUrl4 = 'https://192.168.1.237:9012'
// export const snftUrl4 = isProduct ? snftUrl3 :`http://192.168.1.235:9006/${exchantest}`
export const snftUrl4 = isProduct ? snftUrl3 :`http://192.168.1.235:9006/${exchantest}`
// export const snftUrl4 = `http://192.168.1.235:9006/${exchantest}`

export const nftmintApi = 'http://192.168.1.235:18081'