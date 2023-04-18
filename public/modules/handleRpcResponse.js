
const clone = (data) => {
    return JSON.parse(JSON.stringify(data))
}
import { removeBadge } from './actions.js'
import {
    getLocalParams,
    closeTabs,
    errorCode,
    sendMessage,
    clearConnectList,
    getConnectList,
    clearPwd,
    handleType,
    createMsg,
    createBgMsg,
    setSenderAccounts,
    getSenderAccounts,
    isConnected,
    openPopup,
    openTabPopup,
    globalPath,
    getWallet,
    globalHomePath,
    eventTypes,
    eventsEmitter,
    delSenderByAddr,
    addSenderByAddr,
    sendToPopup
} from './common.js'
import { removeAllListeners, useGetTxReceipt } from './useGetTxReceipt.js'
const { waitTxQueueResponse } = useGetTxReceipt()
// Distributed event
export const handleRpcResponse = {
    [handleType.waitTxQueueResponse]: {
        sendResponse: async (data, sendResponse, sender) => {
            const method = handleType.waitTxQueueResponse
            console.log('method', method)
            try {
                const res = await waitTxQueueResponse()
                console.warn('wait....', res)
                sendToPopup(res, method, sender, '200')

            } catch (err) {
                console.error('err wait', err)
                sendToPopup(res, method, sender, '-32003')
            }

        }
    },
    [handleType.handleReject]: {
        sendResponse: async (data, sendResponse, sender) => {
            console.warn('reject', sender, data)
            const { method, sendId } = data
            const senderParams = await getLocalParams(method)
            const errMsg = { ...errorCode['4001'], data: null }
            const sendMsg = createMsg(errMsg, method)
            console.warn('reject 1', sendMsg)

            await sendMessage({...sendMsg, sendId}, {}, senderParams.sender)
            console.warn('reject 2')
            // const bgMsg = { ...errorCode['200'], data: null }
            // const sendBgMsg = createBgMsg(bgMsg, method)
            // await chrome.runtime.sendMessage(senderParams.sender.id, sendBgMsg);
            sendToPopup({}, 'handleReject', sender, '200')
            console.warn('reject 3')
            removeBadge(senderParams.sender, method)
            closeTabs()
        }
    },

    [handleType.logout]: {
        sendResponse: async (data, sendResponse, sender) => {
            await clearPwd()
            await clearConnectList()
            const method = handleType.logout
   
            const bgMsg = { ...errorCode['200'], data: null }
            const sendBgMsg = createBgMsg(bgMsg, method)
            await chrome.runtime.sendMessage(sender.id, sendBgMsg);

            const errMsg = { ...errorCode['200'], data: false}
            const sendLogoutMsg =  createMsg(errMsg, method)
            sendMessage(sendLogoutMsg, {}, null)

        }
    },
    [handleType.login]: {
        sendResponse: async (data, sendResponse, sender) => {
            const { password } = data
            console.warn('login', password)
            if (password) {
                await chrome.storage.local.set({ password })
                chrome.alarms.create(eventTypes.pwdExpired, { delayInMinutes: 720 });
                chrome.alarms.onAlarm.addListener(async (e) => {
                    const { name } = e
                    console.warn('pwd pwdExpired', e, eventTypes.pwdExpired)
                    if (name == eventTypes.pwdExpired) {
                        console.warn('pwd pwdExpired', e)
                        // 12 h password expired clear data
                        handleRpcResponse[handleType.logout].sendResponse(null, sendResponse, null)
                        chrome.alarms.clear(eventTypes.pwdExpired)
                    }
                })
                const method = handleType.login
  
                const bgMsg = { ...errorCode['200'], data: null }
                const sendBgMsg = createBgMsg(bgMsg, method)
                await chrome.runtime.sendMessage(sender.id, sendBgMsg);
                
                const errMsg = { ...errorCode['200'], data: true}
                const sendLoginMsg =  createMsg(errMsg, method)
                sendMessage(sendLoginMsg, {}, null)
            }
        }
    },
    // The connection callback
    [handleType.wallet_requestPermissions]: {
        // Three states  close/open/pendding
        status: 'close',
        sendResponse: async (data) => {
            const method = handleType.wallet_requestPermissions
            const senderParams = await getLocalParams(method)
            const { sender } = senderParams
            // Push when not connected
            await setSenderAccounts(sender, data.data)
            const errMsg = { ...errorCode['200'], data: clone(data.data) }
            const sendMsg = createMsg(errMsg, method)
            await sendMessage(sendMsg, {}, sender)
            sendToPopup({}, method, senderParams.sender, '200')
            removeBadge(senderParams.sender, method)
            closeTabs()
        }
    },
    [handleType.eth_requestAccounts]: {
        // Three states  close/open/pendding
        status: 'close',
        sendResponse: async (data) => {
            const { sendId } = data
            const method = handleType.eth_requestAccounts
            const senderParams = await getLocalParams(method)
            const { sender } = senderParams
            // Push when not connected
            await setSenderAccounts(sender, data.data)
            const errMsg = { ...errorCode['200'], data: clone(data.data) }
            const sendMsg = createMsg(errMsg, method)
            await sendMessage({ ...sendMsg, sendId }, {}, sender)
            sendToPopup({}, method, senderParams.sender, '200')
            removeBadge(senderParams.sender, method)
            closeTabs()
        }
    },
    // Signature Single signature data
    [handleType.personal_sign]: {
        // Three states  close/open/pendding
        status: 'close',
        // Signature callback function - sent to Content-script
        sendResponse: async (data, sendResponse, sender) => {
            const { sendId } = data
            const method = handleType.personal_sign
            const errMsg = { ...errorCode['200'], data: clone(data.data) }
            const senderParams = await getLocalParams(method)
            const sendMsg = createMsg(errMsg, method)
            await sendMessage({ ...sendMsg, sendId }, {}, senderParams.sender)
            const bgMsg = { ...errorCode['200'], data: null }
            const sendGgMsg = createBgMsg(bgMsg, method)
            await sendMessage({ ...sendGgMsg, sendId }, {}, sender)
            sendToPopup({}, method, senderParams.sender, '200')
            removeBadge(senderParams.sender, method)
            closeTabs()
        },
    },
    [handleType.eth_sign]: {
        // Three states  close/open/pendding
        status: 'close',
        // Signature callback function - sent to Content-script
        sendResponse: async (v) => {
            const { sendId } = v;
            const errMsg = { ...errorCode['200'], data: clone(data.data) }
            const method = handleType.eth_sign
            const sendMsg = createMsg(errMsg, handleType.eth_sign)
            const senderParams = await getLocalParams(method)
            await sendMessage({ ...sendMsg, sendId }, {}, senderParams.sender)
            sendToPopup({}, method, senderParams.sender, '200')
            removeBadge(senderParams.sender, method)
            closeTabs()
        },
    },
    // Signing multiple signature data
    [handleType.multiple_sign]: {
        // Three states  close/open/pendding
        status: 'close',
        // Signature callback function - sent to Content-script
        sendResponse: async (v) => {
            const { sendId } = v;
            const errMsg = { ...errorCode['200'], data: clone(data.data) }
            const method = handleType.multiple_sign
            const sendMsg = createMsg(errMsg, handleType.multiple_sign)
            const senderParams = await getLocalParams(method)
            await sendMessage({ ...sendMsg, sendId }, {}, senderParams.sender)
            sendToPopup({}, method, senderParams.sender, '200')
            removeBadge(senderParams.sender, method)
            closeTabs()
        },
    },



    // switching network
    [eventsEmitter.chainChanged]: {
        sendResponse: async (v) => {
            const wallet = await getWallet()
            const { data } = v;
            const errMsg = { ...errorCode['200'], data }
            const method = eventsEmitter.chainChanged
            const sendMsg = createMsg(errMsg, eventsEmitter.chainChanged)
            const connectList = await getConnectList()
            sendMsg.data.connectList = connectList
            sendMsg.data.address = wallet.address
            const senderParams = await getLocalParams(method)
            sendMessage(sendMsg, {}, null)
        },
    },
    // Switch account
    [eventsEmitter.accountsChanged]: {
        sendResponse: async (v) => {
            const wallet = await getWallet()
            const { data } = v;
            const errMsg = { ...errorCode['200'], data }
            const method = eventsEmitter.accountsChanged
            const sendMsg = createMsg(errMsg, method)
            const connectList = await getConnectList()
            sendMsg.data.connectList = connectList
            sendMsg.data.address = wallet.address
            sendMessage(sendMsg, {}, null)
        },
    },
    // Message
    [eventsEmitter.message]: {
        sendResponse: async (v) => {
            console.log('message', v)

        }
    },
    [eventsEmitter.pwdExpired]: {
        sendResponse: async () => {
            const method = eventsEmitter.pwdExpired
            const errMsg = { ...errorCode['200'], data: true}
            const sendMsg = createMsg(errMsg, method)
            sendMessage(sendMsg, {}, null)
        },
    },
    // trade
    [handleType.eth_sendTransaction]: {
        // Three states  close/open/pendding
        status: 'close',
        sendResponse: async (v, sendResponse, sender) => {
            const { data, sendId } = v;
            const errMsg = { ...errorCode['200'], data: data.hash }
            const method = handleType.eth_sendTransaction
            const senderParams = await getLocalParams(method)
            const sendMsg = createMsg(errMsg, method)
            await sendMessage({ ...sendMsg, sendId }, {}, senderParams.sender)
            // const bgMsg = { ...errorCode['200'], data: null }
            // const sendGgMsg = createBgMsg(bgMsg, method)
            // await sendMessage({ ...sendGgMsg, sendId }, {}, sender)
            sendToPopup({}, method, senderParams.sender, '200')
            removeBadge(senderParams.sender, method)
            closeTabs()

        },
    },
    // connect
    ['connectByAddress']: {
        status: 'close',
        sendResponse: async (v) => {
            console.log('connectByAddress', v)
            const {sender, address } = v.data
            const acc = await addSenderByAddr(sender, address)
            console.log('add addr end.', acc)
        }
    },
    // disconnect
    ['disconnectByAddress']: {
        status: 'close',
        sendResponse: async (v) => {
            console.log('disconnectByAddress', v)
            const {sender, address } = v.data
            const acc= await delSenderByAddr(sender, address)
            console.log('del addr end.', acc)

        }
    }
};