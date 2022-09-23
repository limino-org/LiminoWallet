// @ts-nocheck
export const sendBackground = (data: any = {}) => {
    return new Promise((resolve,reject) => {
        chrome.runtime.sendMessage({target:"wormholes-popup",data},(response: any) => {
            resolve(response)
        })
    })

}