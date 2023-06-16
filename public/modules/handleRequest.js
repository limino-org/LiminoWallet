
import {
    getLocalParams,
    closeTabs,
    hasOpenConnectPopup,
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
    getProvider,
    handleDiffAddrAndLocalAddr,
    getLocalAddr
} from './common.js'
import { ethers } from './ethers.js';
import { handleEvents } from './event.js';
import { localforage } from './localforage.js'




// call function
export const handleRequest = {
    // Connect website
    async [handleType.wallet_requestPermissions](data, sendResponse, sender) {
        const method = handleType.wallet_requestPermissions
        const senderParams = await getLocalParams(method)
        const { status } = senderParams
        const local = await localforage.getItem("vuex") || null

        const accountList = await getSenderAccounts(sender)
        const newurl = `${globalPath}#/connect?sender=${encodeURIComponent(JSON.stringify(sender))}&accountList=${encodeURIComponent(JSON.stringify(accountList))}&method=wallet_requestPermissions`
        try {
            await hasOpenConnectPopup()
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
        const { sendId } = data
        const local = await localforage.getItem("vuex") || null
        const accountList = await getSenderAccounts(sender)
        const newurl = `${globalPath}#/connect?sendId=${sendId}&sender=${encodeURIComponent(JSON.stringify(sender))}&accountList=${encodeURIComponent(JSON.stringify(accountList))}&method=eth_requestAccounts`
        try {
            await hasOpenConnectPopup()
            await openPopup(method, newurl, sendResponse, sender, 'popup')
        } catch (err) {
            console.error('err-', err || 'error...')
        }
        if (local && !local.account.accountInfo.address) {
            await closeTabs()
            const errMsg = { code: "-32002", reason: "Resource unavailable", message: "The wallet has not been initialized. Please initialize the wallet first" }
            const sendMsg = createMsg(errMsg, method)
            await sendMessage({...sendMsg, sendId}, {}, sender)
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
        let str = `sig=${recoverSig}&signType=personal_sign&sendId=${sendId}&sender=${encodeURIComponent(JSON.stringify(sender))}&address=${address}`;
        const newurl = `${globalPath}#/sign?${str}`;
        try {
            // const localAddr = await getLocalAddr()
            // await handleDiffAddrAndLocalAddr(address, localAddr)
            await openPopup(handleType.personal_sign, newurl, sendResponse, sender)
        } catch (err) {
    
            sendMessage({...err, sendId}, {}, sender)
        }
    },
    //Signature Indicates a single signature of the interface
    async [handleType.eth_sign](data, sendResponse, sender) {
        //Sign the hexadecimal data and sign the account address
        const { newParams, sendId } = data
        try {
            const [address, sig] = newParams
            // const localAddr = await getLocalAddr()
            // await handleDiffAddrAndLocalAddr(address, localAddr)
            // Parsing signature data
            const recoverSig = ethers.utils.toUtf8String(sig)
            let str = `sig=${recoverSig}&signType=eth_sign&sendId=${sendId}&sender=${encodeURIComponent(JSON.stringify(sender))}&address=${address}`;
            const newurl = `${globalPath}#/sign?${str}`;
            await openPopup(handleType.eth_sign, newurl, sendResponse, sender)
        } catch(err) {
            const errMsg = createMsg(err, handleType.eth_sign)
            sendMessage({...errMsg, sendId}, {}, sender)
        }
    },
    // Signature Interface has multiple signatures at a time
    async [handleType.multiple_sign](data, sendResponse, sender) {
        const { newParams, sendId } = data
        const [address, sig] = newParams
        try {
            // const localAddr = await getLocalAddr()
            // await handleDiffAddrAndLocalAddr(address, localAddr)
             // Sign the hexadecimal data and sign the account address
            let str = `sig=${newParams}`;
            const newurl = `${globalPath}#/multipleSign?sendId=${sendId}&${str}&sender=${encodeURIComponent(JSON.stringify(sender))}&address=${address}`;

            await openPopup(handleType.multiple_sign, newurl, sendResponse, sender)
        } catch (err) {
            sendMessage({...err, sendId}, {}, sender)
        }
    },
    // // tradable
    async [handleType.eth_sendTransaction](data, sendResponse, sender) {
        const { sendId, newParams } = data
        console.warn('newParams', newParams)
        const [tx] = newParams
        // const {from} = tx
        try {
            // const localAddr = await getLocalAddr()
            // await handleDiffAddrAndLocalAddr(from, localAddr)
            const [tx] = newParams
            console.log('send0--', newParams)
            const newurl = `${globalPath}#/nft-transaction?sendId=${sendId}&tx=${encodeURIComponent(JSON.stringify(tx))}&sender=${encodeURIComponent(JSON.stringify(sender))}`;
            await openPopup(handleType.eth_sendTransaction, newurl, sendResponse, sender)
        } catch (err) {
            const errMsg = createMsg(err, handleType.eth_sendTransaction)
            console.error('err ----', err)
            sendMessage({...errMsg, sendId}, {}, sender)
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
    }
};

// Rpc generic method
export const handleRpc = async function (method, data, sendResponse, sender) {
    const { newParams, sendId } = data
    try {
        const provider = await getProvider()
        provider.send(method, newParams).then(res => {
            const errMsg = { ...errorCode['200'], data: res }
            const sendMsg = createMsg(errMsg, method)
            sendMessage({ ...sendMsg, sendId }, {}, sender)
        }).catch(err => {
            const errMsg = { ...errorCode['32000'], data: err }
            const sendMsg = createMsg(errMsg, method)
            sendMessage({ ...sendMsg, sendId }, {}, sender)
        })
    } catch (err) {
        console.log('err----', err)
        const errMsg = { ...errorCode['32000'], data: err }
        sendMessage({ ...errMsg, sendId }, {}, sender)
    }
}