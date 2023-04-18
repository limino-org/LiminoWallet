import { guid } from "./common.js";

const queueKey = 'queue'


async function getBadgeList(){
    const queue = await chrome.storage.local.get([queueKey])
    return queue.queue || []
}

const hasMethodQueue =async (sender,method) => {
   const queue = await getBadgeList()
   console.warn('hasMethodQueue', queue)
   return queue.findIndex(item => item.method == method && item.sender.origin == sender.origin)
}
export const setBadge = async ({
    url,
    method,
    sender,
    window
}) => {
    const queue = await getBadgeList()
    const idx = await hasMethodQueue(sender, method)
     if(idx > -1) {
         return Promise.reject(`The sender's ${method} popup was exist`)
     }
     const tabId =  guid()
     chrome.action.setBadgeText({ text: queue.length + 1 + '' });
     chrome.action.setBadgeBackgroundColor({ color: '#037cd6' });
     chrome.action.setPopup({
         popup: url,
     })
     queue.push({sender,url,window,method})
     chrome.storage.local.set({[queueKey]: queue})
}


export const removeBadge = async (sender, method) => {
    const queue = await getBadgeList()
    if(!queue.length) {
        resetBadge()
    }
    const idx = await hasMethodQueue(sender, method)
    if(idx > -1){
        queue.splice(idx, 1)
        const data = queue[queue.length - 1]
        if(queue.length) {
            chrome.action.setBadgeText({ text: queue.length + '' });
            chrome.action.setBadgeBackgroundColor({ color: '#037cd6' });
            chrome.action.setPopup({
                popup: data.url,
            })
            chrome.storage.local.set({[queueKey]: queue})
        } else {
            resetBadge()
        }

    }
}

const homeUrl = `chrome-extension://${chrome.runtime.id}/popup.html#/home/wallet`
export const resetBadge = () => {
    chrome.storage.local.set({[queueKey]: []})
    chrome.action.setBadgeText({ text: "" });
    chrome.action.setBadgeBackgroundColor({ color: 'transparent' });
    chrome.action.setPopup({
        popup: homeUrl
    })
}