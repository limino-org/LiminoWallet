import { clone, guid } from "./common.js";

const callbacks = {

}
export const noticeList = []
export function notices(opt = {}) {
    chrome.notifications.getPermissionLevel(function (level) {
        console.log('0', level)
        if (level == 'granted') {
            const { title, message, type, data, clickCallback } = { ...{ title: 'Title', message: 'Message...', type: "basic", data: null, clickCallback:()=>{} }, ...opt }
            console.warn('notice', type, title, message, data)
            const noticeId = guid()
            const key = `notice-send-${noticeId}`
            chrome.storage.local.set({ [key]: clone(data) })
            try {
                chrome.notifications.create(
                    noticeId, // notifyId
                    { type, iconUrl: "icons/logo-48.png", title, message },
                    function (notifyId) {
                        callbacks[key] = clickCallback
                        noticeList.push(noticeId)
                    }
                );
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
    console.log('点击通知。。。', data);
    //   chrome.storage.local.remove([key])

});

chrome.notifications.onClosed.addListener((noticeId) => {
    const key = `notice-send-${noticeId}`
    console.log('close', key)
    chrome.storage.local.remove([key])
    delete callbacks[key]
})

