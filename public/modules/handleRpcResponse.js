
const clone = (data) => {
    return JSON.parse(JSON.stringify(data))
}
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
    addSenderByAddr
} from './common.js'
import { useGetTxReceipt } from './useGetTxReceipt.js'
const { waitTxQueueResponse } = useGetTxReceipt()
// Distributed event
export const handleRpcResponse = {
    [handleType.waitTxQueueResponse]: {
        sendResponse: async (data, sendResponse, sender) => {
            const method = handleType.waitTxQueueResponse
            try {
                await waitTxQueueResponse()
                const bgMsg = { ...errorCode['200'], data: null }
                const sendBgMsg = createBgMsg(bgMsg, method)
                chrome.runtime.sendMessage(sender.id, sendBgMsg);

            } catch (err) {
                const bgMsg = { ...errorCode['-32003'], data: null }
                const sendBgMsg = createBgMsg(bgMsg, method)
                chrome.runtime.sendMessage(sender.id, sendBgMsg);
            }

        }
    },
    [handleType.handleReject]: {
        sendResponse: async (data, sendResponse, sender) => {
            const { method, sendId } = data
            const senderParams = await getLocalParams(method)
            const errMsg = { ...errorCode['4001'], data: null }
            const sendMsg = createMsg(errMsg, method)
            await sendMessage({...sendMsg, sendId}, {}, senderParams.sender)
            const bgMsg = { ...errorCode['200'], data: null }
            const sendBgMsg = createBgMsg(bgMsg, method)
            await chrome.runtime.sendMessage(sender.id, sendBgMsg);
            closeTabs()
        }
    },

    [handleType.logout]: {
        sendResponse: async (data, sendResponse, sender) => {
            const { tab } = data
            await chrome.storage.local.set({ password: "" })
            await clearConnectList()
            const method = handleType.logout

            const errMsg = { ...errorCode['200'], data: true}
            const sendLogoutMsg =  createMsg(errMsg, 'logout')
            sendMessage(sendLogoutMsg, {}, null)
            if(sender && sender.id) {
                const bgMsg = { ...errorCode['200'], data: null }
                const sendBgMsg = createBgMsg(bgMsg, method)
                await chrome.runtime.sendMessage(sender.id, sendBgMsg);
                handleRpcResponse[eventTypes.pwdExpired].sendResponse()
            }
            chrome.alarms.clear(eventTypes.pwdExpired)
        }
    },
    [handleType.login]: {
        sendResponse: async (data, sendResponse, sender) => {
            const { password } = data
            if (password) {
                await chrome.storage.local.set({ password })
                chrome.alarms.create(eventTypes.pwdExpired, { delayInMinutes: 480 });
                const method = handleType.login
                const errMsg = { ...errorCode['200'], data: true}
                const sendLoginMsg =  createMsg(errMsg, 'loginIn')
                sendMessage(sendLoginMsg, {}, null)
                const bgMsg = { ...errorCode['200'], data: null }
                const sendBgMsg = createBgMsg(bgMsg, method)
                await chrome.runtime.sendMessage(sender.id, sendBgMsg);
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
            const bgMsg = { ...errorCode['200'], data: null }
            const sendGgMsg = createBgMsg(bgMsg, method)
            await sendMessage({ ...sendGgMsg, sendId }, {}, sender)
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