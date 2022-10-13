// @ts-nocheck

// all callback
const callbacks = {}

export const sendBackground = async (data: any = {}) => {
    return new Promise((resolve, reject) => {
        if (data && typeof data == 'object' && data.method) {
            callbacks[data.method] = (res: any) => {
                const { code, data } = res
                if (code == 200) {
                    resolve(data || {})
                } else {
                    reject(data || {})
                }
            }
        }
        chrome.runtime.sendMessage({ target: "wormholes-popup", data: { ...data } })
    })
}

// get service worker message
chrome.runtime.onMessage.addListener(async (request: any, sender: any, sendResponse: any) => {
    const { type, data } = request
    if (type && type == 'serviceWorker-callback') {
        const { method, response } = data
        if (response && method) {
            callbacks[method] && typeof callbacks[method] == 'function' ? callbacks[method](response) : ''
            callbacks[method] = null
        }
    }
})