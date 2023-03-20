import {
    getLocalParams,
    closeTabs,
    errorCode,
    sendMessage,
    handleType,
    createMsg,
    getSenderAccounts,
    openPopup,
    openTabPopup,
    globalPath,
    getWallet,
    getConnectList,
    eventTypes,
    wallet_methods,
    eventsEmitter,
    createBgMsg,
    createWalletByJson,
    getPwd
} from './common.js'


import { ethers } from './ethers.js';
import { localforage } from './localforage.js'

export const handleEvents = {
    [eventsEmitter.disconnect](data, sendResponse, sender) {

    },
    [eventsEmitter.connect] (){

    },
    async [eventsEmitter.message](data, sendResponse, sender) {
        console.warn('message', data, sender)
        const { method: eventType } = data
        const wallet = await getWallet()
        const method = eventsEmitter.message
        wallet.provider.on(method, (res) => {
            const errMsg = { ...errorCode['200'], data: res }
            const sendMsg = createMsg(errMsg, method)
            const resp = {...sendMsg, eventType}
            console.log('resp', resp)
            sendMessage(resp, {}, sender)
        })
    },
    async [eventsEmitter.chainChanged] (data, sendResponse, sender) {
        const { method: eventType } = data
        const wallet = await getWallet()
        const method = eventsEmitter.chainChanged
        wallet.provider.on(method, (res) => {
            const errMsg = { ...errorCode['200'], data: res }
            const sendMsg = createMsg(errMsg, method)
            const resp = {...sendMsg, eventType}
            console.log('resp', resp)
            sendMessage(resp, {}, sender)
        })
    },
    async [eventsEmitter.accountsChanged](data, sendResponse, sender) {
        const { method: eventType } = data
        const wallet = await getWallet()
        const method = eventsEmitter.accountsChanged
        wallet.provider.on(method, (res) => {
            const errMsg = { ...errorCode['200'], data: res }
            const sendMsg = createMsg(errMsg, method)
            const resp = {...sendMsg, eventType}
            console.log('resp', resp)
            sendMessage(resp, {}, sender)
        })
    },
    // async [eventsEmitter.switchCoinType](data, sendResponse, sender) {
    //     const bgMsg = { ...errorCode['200'], data: null }
    //     const sendGgMsg = createBgMsg(bgMsg, eventsEmitter.switchCoinType)
    //     const local = await localforage.getItem("vuex") || {}
    //     const password = await getPwd()
    //     const { accountInfo, accountList, coinType } = local.account;
    //     const { name, value } = coinType
    //     for await(const key of accountList) {
    //         if (Object.hasOwnProperty.call(object, key)) {
    //             const element = object[key];
    //             const params = {
    //                 password,
    //                 json: element.keyStore
    //             }
    //             const privacyKeyStr = await createWalletByJson(params).privateKey
    //             switch (value){
    //                 case 0:
    //                     element.address = toAddrByPrivateKeyETH(privacyKeyStr)
    //                     break;
    //                 case 1:
    //                     element.address = toAddrByPrivateKeyBTC(privacyKeyStr)
    //                     break;
    //                 default:
    //                     break;
    //             }

      
    //         }
    //     }

    //     const privacyKeyStr2 = await createWalletByJson({
    //         password,
    //         json: accountInfo.keyStore
    //     }).privateKey
    //     switch (name){
    //         case 0:
    //             accountInfo.address = toAddrByPrivateKeyETH(privacyKeyStr2)
    //             break;
    //         case 1:
    //             accountInfo.address = toAddrByPrivateKeyBTC(privacyKeyStr2)
    //             break;
    //         default:
    //             break;
    //     }
    //     local.accountInfo = accountInfo
    //     local.accountList = accountList
    //     const newvuex = await localforage.getItem("vuex")
    //     await localforage.seItem('vuex', {...newvuex, local})
    //     sendMessage({ ...sendGgMsg }, {}, sender)
    // }
}