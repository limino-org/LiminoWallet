
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
    eventsEmitter
} from './common.js'
import { useGetTxReceipt } from './useGetTxReceipt.js'
const { waitTxQueueResponse } = useGetTxReceipt()
// Distributed event
export const handleRpcResponse = {
    [handleType.waitTxQueueResponse]: {
        sendResponse: async (data, sendResponse, sender) => {
            const method = handleType.waitTxQueueResponse
            try {
                console.log('handleType.waitTxQueueResponse', handleType.waitTxQueueResponse, sender)
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
            const { method, tab } = data
            const senderParams = await getLocalParams(method)
            const errMsg = { ...errorCode['4001'], data: null }
            const sendMsg = createMsg(errMsg, method)
            await sendMessage(sendMsg, {}, senderParams.sender)
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
            const bgMsg = { ...errorCode['200'], data: null }
            const sendBgMsg = createBgMsg(bgMsg, method)
            await chrome.runtime.sendMessage(sender.id, sendBgMsg);

        }
    },
    [handleType.login]: {
        sendResponse: async (data, sendResponse, sender) => {
            const { password, tab } = data
            if (password) {
                await chrome.storage.local.set({ password })
                chrome.alarms.create(eventTypes.pwdExpired, { delayInMinutes: 720 });
                chrome.alarms.onAlarm.addListener(async (e) => {
                    const { name } = e
                    if (name == eventTypes.pwdExpired) {
                        // 12 h password expired clear data
                        await clearConnectList()
                        await clearPwd()
                    }
                })
                waitTxQueueResponse()
                const method = handleType.login
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
            const errMsg = { ...errorCode['200'], data: data }
            const sendMsg = createMsg(errMsg, method)
            await sendMessage(sendMsg, {}, sender)
            closeTabs()
        }
    },
    // Signature Single signature data
    [handleType.personal_sign]: {
        // Three states  close/open/pendding
        status: 'close',
        // Signature callback function - sent to Content-script
        sendResponse: async (data, sendResponse, sender) => {
            const errMsg = data
            const method = handleType.personal_sign
            const senderParams = await getLocalParams(method)
            const sendMsg = createMsg(errMsg, method)
            await sendMessage(sendMsg, {}, senderParams.sender)
            const bgMsg = { ...errorCode['200'], data: null }
            const sendGgMsg = createBgMsg(bgMsg, method)
            await sendMessage(sendGgMsg, {}, sender)
            closeTabs()
        },
    },
    [handleType.eth_sign]: {
        // Three states  close/open/pendding
        status: 'close',
        // Signature callback function - sent to Content-script
        sendResponse: async (v) => {
            const { response } = v;
            const errMsg = { ...errorCode['200'], data: response }
            const method = handleType.eth_sign
            const sendMsg = createMsg(errMsg, handleType.eth_sign)
            const senderParams = await getLocalParams(method)
            await sendMessage(sendMsg, {}, senderParams.sender)
            closeTabs()
        },
    },
    // Signing multiple signature data
    [handleType.multiple_sign]: {
        // Three states  close/open/pendding
        status: 'close',
        // Signature callback function - sent to Content-script
        sendResponse: async (v) => {
            const { response } = v;
            const errMsg = { ...errorCode['200'], data: response }
            const method = handleType.multiple_sign
            const sendMsg = createMsg(errMsg, handleType.multiple_sign)
            const senderParams = await getLocalParams(method)
            await sendMessage(sendMsg, {}, senderParams.sender)
            closeTabs()
        },
    },

    // Get block height
    [handleType.eth_blockNumber]: {
        status: 'close',
        // Get block height send data instance
        sendResponse: async (v) => {
            try {
                const wallet = await getWallet()
                const response = await wallet.provider.getBlockNumber()
                const errMsg = { ...errorCode['200'], data: response }
                const method = handleType.eth_getBlockNumber
                const sendMsg = createMsg(errMsg, method)
                const senderParams = await getLocalParams(method)
                sendMessage(sendMsg, {}, senderParams.sender)
            } catch (err) {
                console.error('eth_blockNumber', err)
            }
        },
    },
    // Access to the network
    [handleType.eth_getNetWork]: {
        status: 'close',

        // 获取网络id发送数据实例
        sendResponse: async (v) => {
            const { response } = v
            const errMsg = { ...errorCode['200'], data: response }
            const method = handleType.eth_getNetWork
            const sendMsg = createMsg(errMsg, handleType.eth_getNetWork)
            const senderParams = await getLocalParams(method)
            sendMessage(sendMsg, {}, senderParams.sender)
        },
    },

    // switching network
    [eventsEmitter.chainChanged]: {
        sendResponse: async (v) => {
            console.log('changeNetWork', v)
            const wallet = await getWallet()
            const { response } = v;
            const errMsg = { ...errorCode['200'], data: response }
            const method = eventsEmitter.chainChanged
            const sendMsg = createMsg(errMsg, eventsEmitter.chainChanged)
            const connectList = await getConnectList()
            sendMsg.data.connectList = connectList
            sendMsg.data.address = wallet.address
            const senderParams = await getLocalParams(method)
            sendMessage(sendMsg, {}, senderParams.sender)

        },
    },
    // Switch account
    [eventsEmitter.accountsChanged]: {
        sendResponse: async (v) => {
            console.log('accountsChanged', v)
            const wallet = await getWallet()
            const { response } = v;
            const errMsg = { ...errorCode['200'], data: response }
            const method = eventsEmitter.accountsChanged
            const sendMsg = createMsg(errMsg, method)
            const connectList = await getConnectList()
            sendMsg.data.connectList = connectList
            sendMsg.data.address = wallet.address
            const senderParams = await getLocalParams(method)
            sendMessage(sendMsg, {}, senderParams.sender)

        },
    },
    // trade
    [handleType.eth_sendTransaction]: {
        // Three states  close/open/pendding
        status: 'close',
        sendResponse: async (v, sendResponse, sender) => {
            const { data } = v;
            console.log('eth_sendTransaction', data)
            const errMsg = { ...errorCode['200'], data: data.hash }
            const method = handleType.eth_sendTransaction
            const senderParams = await getLocalParams(method)
            const sendMsg = createMsg(errMsg, method)
            await sendMessage(sendMsg, {}, senderParams.sender)
            const bgMsg = { ...errorCode['200'], data: null }
            const sendGgMsg = createBgMsg(bgMsg, method)
            await sendMessage(sendGgMsg, {}, sender)
            closeTabs()

        },
    },
};