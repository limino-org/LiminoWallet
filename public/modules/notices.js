import { clone, debounce, guid } from "./common.js";
import { getPenddingList } from "./db.js";

const callbacks = {

}


export function notices(opt = {}) {
    chrome.notifications.getPermissionLevel(async function (level) {
        if (level == 'granted') {
            const { title, message, type, data, clickCallback } = { ...{ title: 'Title', message: 'Message...', type: "basic", data: null, clickCallback:()=>{} }, ...opt }
            console.warn('notice', type, title, message, data)
            const key = `notice-send-${message}`
            chrome.storage.local.set({ [key]: clone(data) })
            if(callbacks[key]){
                return
            }
            try {
                debounce(chrome.notifications.create(
                    message, // notifyId
                    { type, iconUrl: "icons/logo-48.png", title, message },
                    function (notifyId) {
                        callbacks[key] = clickCallback
                    }
                ), 2000);
            } catch (err) {
                console.warn('err', err)
            }
        } else {
            //...
            console.log('complele...')
        }
    });
}

chrome.notifications.onClicked.addListener(async (noticeId) => {
    const key = `notice-send-${noticeId}`
    const data = await chrome.storage.local.get([key])
    callbacks[key]()
    delete callbacks[key]
    //   chrome.storage.local.remove([key])

});

chrome.notifications.onClosed.addListener((noticeId) => {
    const key = `notice-send-${noticeId}`
    console.log('close', key)
    chrome.storage.local.remove([key])
    delete callbacks[key]
})

