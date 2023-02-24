
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
    eventsEmitter
} from './common.js'
import { ethers } from './ethers.js';
import { handleEvents } from './event.js';
import { localforage } from './localforage.js'


// call function
export const handleRpcRequest = {
    // Connect website
    async [handleType.wallet_requestPermissions](data, sendResponse, sender) {
        const method = handleType.wallet_requestPermissions
        const senderParams = await getLocalParams(method)
        const { status } = senderParams
        const local = await localforage.getItem("vuex") || null

        const accountList = await getSenderAccounts(sender)
        const newurl = `${globalPath}#/connect?sender=${encodeURIComponent(JSON.stringify(sender))}&accountList=${encodeURIComponent(JSON.stringify(accountList))}&method=wallet_requestPermissions`
        try {
            await openPopup(method, newurl, sendResponse, sender, 'popup')
        } catch (err) {
            console.error('err-', err || 'error...')
        }
        if (local && !local.account.accountInfo.address) {
            await closeTabs()
            const errMsg = { code: "-32002", reason: "Resource unavailable", message: "The wallet has not been initialized. Please initialize the wallet first" }
            const sendMsg = createMsg(errMsg, method)
            await sendMessage(sendMsg, {}, sender)
            const url = `chrome-extension://${chrome.runtime.id}/popup.html#/guide/step1`
            await openTabPopup(method, url, sendResponse, sender)
            return
        }
    },
    // Connect website
    async [handleType.eth_requestAccounts](data, sendResponse, sender) {
        const method = handleType.eth_requestAccounts
        const senderParams = await getLocalParams(method)
        const { sendId } = data
        const { status } = senderParams
        const local = await localforage.getItem("vuex") || null
        const accountList = await getSenderAccounts(sender)
        const newurl = `${globalPath}#/connect?sendId=${sendId}&sender=${encodeURIComponent(JSON.stringify(sender))}&accountList=${encodeURIComponent(JSON.stringify(accountList))}&method=eth_requestAccounts`
        try {
            await openPopup(method, newurl, sendResponse, sender, 'popup')
        } catch (err) {
            console.error('err-', err || 'error...')
        }
        if (local && !local.account.accountInfo.address) {
            await closeTabs()
            const errMsg = { code: "-32002", reason: "Resource unavailable", message: "The wallet has not been initialized. Please initialize the wallet first" }
            const sendMsg = createMsg(errMsg, method)
            await sendMessage(sendMsg, {}, sender)
            const url = `chrome-extension://${chrome.runtime.id}/popup.html#/guide/step1`
            await openTabPopup(method, url, sendResponse, sender)
            return
        }
    },
    // Signature Indicates a single signature of the interface
    async [handleType.personal_sign](data, sendResponse, sender) {
        // Signed hexadecimal data, signed account address
        const { newParams, sendId } = data
        const [sig, address] = newParams
        // Parsing signature data
        const recoverSig = ethers.utils.toUtf8String(sig)
        let str = `sig=${recoverSig}&signType=personal_sign&sendId=${sendId}&sender=${encodeURIComponent(JSON.stringify(sender))}`;
        const newurl = `${globalPath}#/sign?${str}`;
        try {
            await openPopup(handleType.personal_sign, newurl, sendResponse, sender)
        } catch (err) {
            sendMessage(err, {}, sender)
        }
    },
    //Signature Indicates a single signature of the interface
    async [handleType.eth_sign](data, sendResponse, sender) {
        //Sign the hexadecimal data and sign the account address
        const { newParams, sendId } = data
        const [address, sig] = newParams
        // Parsing signature data
        const recoverSig = ethers.utils.toUtf8String(sig)
        let str = `sig=${recoverSig}&signType=eth_sign&sendId=${sendId}&sender=${encodeURIComponent(JSON.stringify(sender))}`;
        const newurl = `${globalPath}#/sign?${str}`;
        try {
            await openPopup(handleType.eth_sign, newurl, sendResponse, sender)
        } catch (err) {
            sendMessage(err, {}, sender)
        }
    },
    // Signature Interface has multiple signatures at a time
    async [handleType.multiple_sign](data, sendResponse, sender) {
        const { newParams, sendId } = data
        // Sign the hexadecimal data and sign the account address
        let str = `sig=${newParams}`;
        const newurl = `${globalPath}#/multipleSign?${str}&sender=${encodeURIComponent(JSON.stringify(sender))}`;
        try {
            await openPopup(handleType.multiple_sign, newurl, sendResponse, sender)
        } catch (err) {
            sendMessage(err, {}, sender)
        }
    },
    // Rpc generic method
    async handleRpc(method, data, sendResponse, sender) {
        const { newParams, sendId } = data
        try {
            const wallet = await getWallet()
            wallet.provider.send(method, newParams).then(res => {
                const errMsg = { ...errorCode['200'], data: res }
                const sendMsg = createMsg(errMsg, method)
                sendMessage({ ...sendMsg, sendId }, {}, sender)
            }).catch(err => {
                const errMsg = { ...errorCode['32000'], data: JSON.stringify(err) }
                const sendMsg = createMsg(errMsg, method)
                sendMessage({ ...sendMsg, sendId }, {}, sender)
            })
        } catch (err) {
            const errMsg = { ...errorCode['32000'], data: JSON.stringify(err) }
            sendMessage({ ...errMsg, sendId }, {}, sender)
        }
    },

    // // tradable
    async [handleType.eth_sendTransaction](data, sendResponse, sender) {
        const { sendId, newParams } = data
        const [tx] = newParams
        console.log('send0--',newParams)
        const newurl = `${globalPath}#/nft-transaction?sendId=${sendId}&tx=${encodeURIComponent(JSON.stringify(tx))}&sender=${encodeURIComponent(JSON.stringify(sender))}`;
        try {
            await openPopup(handleType.eth_sendTransaction, newurl, sendResponse, sender)
        } catch (err) {
            sendMessage(err, {}, sender)
        }
    },

    // Gets the current wallet address
    async [handleType.eth_accounts](data, sendResponse, sender) {
        const { sendId } = data
        try {
            const wallet = await getWallet();
            const errMsg = { ...errorCode['200'], data: [wallet.address] }
            const sendMsg = createMsg(errMsg, handleType.eth_accounts)
            sendMessage({ ...sendMsg, sendId }, {}, sender)
        } catch (err) {
            const errMsg = { ...errorCode['32000'], data: JSON.stringify(err) }
            sendMessage({ ...errMsg, sendId }, {}, sender)
        }
    },
};