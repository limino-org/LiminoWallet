
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
    getConnectList
} from './common.js'
import { ethers } from './ethers.js';
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
        const newurl = `${globalPath}#/connect?sender=${encodeURIComponent(JSON.stringify(sender))}&accountList=${encodeURIComponent(JSON.stringify(accountList))}`
        try {
            await openPopup(method, newurl, sendResponse, sender, 'popup')
        } catch (err) {
            console.error('err-', err || 'error...')
        }

        if (local && !local.account.accountInfo.address) {
            try {
                await closeTabs()
                const errMsg = { code: "-32002", reason: "Resource unavailable", message: "The wallet has not been initialized. Please initialize the wallet first" }
                const sendMsg = createMsg(errMsg, method)
                await sendMessage(sendMsg, {}, sender)
                const url = `chrome-extension://${chrome.runtime.id}/popup.html#/guide/step1`
                await openTabPopup(method, url, sendResponse, sender, 'tab')
            } catch (err) {
                console.error('err-2', err)
            }

            return
        }
    },
    // Connect website
    async [handleType.eth_requestAccounts](data, sendResponse, sender) {

        const newurl = `${globalPath}#/connect?sender=${JSON.stringify(sender)}`
        try {
            await openPopup(handleType.eth_requestAccounts, newurl, sendResponse, sender)
        } catch (err) {
            sendMessage(err, {}, sender)
        }
    },
    // Signature Indicates a single signature of the interface
    async [handleType.personal_sign](data, sendResponse, sender) {
        // Signed hexadecimal data, signed account address
        const [sig, address] = data
        // Parsing signature data
        const recoverSig = ethers.utils.toUtf8String(sig)
        let str = `sig=${recoverSig}&signType=personal_sign`;
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
        const [address, sig] = data
        // Parsing signature data
        const recoverSig = ethers.utils.toUtf8String(sig)
        let str = `sig=${recoverSig}&signType=eth_sign`;
        const newurl = `${globalPath}#/sign?${str}`;
        try {
            await openPopup(handleType.eth_sign, newurl, sendResponse, sender)
        } catch (err) {
            sendMessage(err, {}, sender)
        }
    },
    // Signature Interface has multiple signatures at a time
    async [handleType.multiple_sign](data, sendResponse, sender) {
        // Sign the hexadecimal data and sign the account address
        let str = `sig=${data}`;
        const newurl = `${globalPath}#/multipleSign?${str}`;
        try {
            await openPopup(handleType.multiple_sign, newurl, sendResponse, sender)
        } catch (err) {
            sendMessage(err, {}, sender)
        }
    },
    // Get block height
    async [handleType.eth_blockNumber](data, sendResponse, sender) {
        try {
            const wallet = await getWallet();
            const blockNumber = await wallet.provider.getBlockNumber();
            const newBlockNumber = ethers.utils.hexlify(blockNumber)
            const errMsg = { ...errorCode['200'], data: newBlockNumber }
            const sendMsg = createMsg(errMsg, handleType.eth_blockNumber)
            sendMessage(sendMsg, {}, sender)
        } catch (err) {
            console.error(`eth_blockNumber: ${JSON.stringify(err)}`)
        }
    },
    // Access to the network
    async [handleType.eth_getNetWork](data, sendResponse, sender) {
        const wallet = await getWallet();
        const network = await wallet.provider.getNetwork();
        const errMsg = { ...errorCode['200'], data: network }
        const sendMsg = createMsg(errMsg, handleType.eth_getBlockNumber)
        sendMessage(sendMsg, {}, sender)
    },
    // Get account balance
    async [handleType.eth_getBalance](data, sendResponse, sender) {
        const wallet = await getWallet();
        const [address] = data
        const balance = await wallet.provider.getBalance(address);
        const errMsg = { ...errorCode['200'], data: balance }
        const sendMsg = createMsg(errMsg, handleType.eth_getBalance)
        sendMessage(sendMsg, {}, sender)
    },
    // tradable
    async [handleType.eth_sendTransaction](data, sendResponse, sender) {
        const [tx] = data
        const newurl = `${globalPath}#/nft-transaction?tx=${encodeURIComponent(JSON.stringify(tx))}`;
        try {
            await openPopup(handleType.eth_sendTransaction, newurl, sendResponse, sender)
        } catch (err) {
            sendMessage(err, {}, sender)
        }
    },
    // Obtain transaction information through transaction hash
    async [handleType.eth_getTransactionByHash](data, sendResponse, sender) {
        const [hash] = data
        try {
            const wallet = await getWallet();
            const receipt = await wallet.provider.getTransaction(hash)
            receipt.hash = hash
            const errMsg = { ...errorCode['200'], data: receipt || null }
            const sendMsg = createMsg(errMsg, handleType.eth_getTransactionByHash)
            sendMessage(sendMsg, {}, sender)
        } catch (err) {
            console.error(err)
        }
    },
    async [handleType.eth_getTransactionReceipt](data, sendResponse, sender) {
        const [hash] = data
        try {
            const wallet = await getWallet();
            const receipt = await wallet.provider.getTransactionReceipt(hash)
            const errMsg = { ...errorCode['200'], data: receipt || null }
            const sendMsg = createMsg(errMsg, handleType.eth_getTransactionReceipt)
            sendMessage(sendMsg, {}, sender)
        } catch (err) {
            console.error(err)
        }
    },
    async [handleType.eth_getTransactionCount](data, sendResponse, sender) {
        console.log('eth_getTransactionCount', data)
        const [hash] = data
        try {
            const wallet = await getWallet();
            const receipt = await wallet.provider.getTransactionReceipt(hash)
            const errMsg = { ...errorCode['200'], data: receipt || null }
            const sendMsg = createMsg(errMsg, handleType.eth_getTransactionCount)
            sendMessage(sendMsg, {}, sender)
        } catch (err) {
            console.error(err)
        }
    },
    // For chain id
    async [handleType.eth_chainId](data, sendResponse, sender) {
        try {
            const wallet = await getWallet();
            const network = await wallet.provider.getNetwork();
            const chainId = ethers.utils.hexlify(network.chainId)
            const errMsg = { ...errorCode['200'], data: chainId }
            const sendMsg = createMsg(errMsg, handleType.eth_chainId)
            sendMessage(sendMsg, {}, sender)
        } catch (err) {
            console.error(`eth_chainId:${JSON.stringify(err)}`)
        }
    },
    // for chain id
    async [handleType.net_version](data, sendResponse, sender) {
        try {
            const wallet = await getWallet();
            const network = await wallet.provider.getNetwork();
            const chainId = ethers.utils.hexlify(network.chainId)
            const errMsg = { ...errorCode['200'], data: chainId }
            const sendMsg = createMsg(errMsg, handleType.net_version)
            sendMessage(sendMsg, {}, sender)
        } catch (err) {
            console.error(`net_version:${JSON.stringify(err)}`)
        }
    },
    // Gets the current wallet address
    async [handleType.eth_accounts](data, sendResponse, sender) {
        const wallet = await getWallet();
        const errMsg = { ...errorCode['200'], data: [wallet.address] }
        const sendMsg = createMsg(errMsg, handleType.eth_accounts)
        sendMessage(sendMsg, {}, sender)
    },
    // TODO Subscribe to news
    [handleType.eth_subscription](data, sendResponse, sender) {
        // Subscribe message, first store the Origin, send a message to determine whether it is the subscriber
    },
    // Estimated gas cost
    async [handleType.eth_estimateGas](data, sendResponse, sender) {
        const [tx] = data
        const wallet = await getWallet()
        try {
            const gas = await wallet.provider.estimateGas(tx)
            const errMsg = { ...errorCode['200'], data: gas }
            const sendMsg = createMsg(errMsg, handleType.eth_estimateGas)
            sendMessage(sendMsg, {}, sender)
        } catch (err) {
            const { reason, message } = err
            const errMsg = {
                code: "-32000",
                reason,
                message,
                data: null
            }
            const sendMsg = createMsg(errMsg, handleType.eth_estimateGas)
            sendMessage(sendMsg, {}, sender)
        }

    },
    // Estimated gas charges remove listening events and client logout
    async [handleType.removeAllListeners](data, sendResponse, sender) {
        let connectList = await getConnectList()
        const list = connectList.filter(item => item.origin != sender.origin)
        await chrome.storage.local.set({ connectList: list })
        const errMsg = { ...errorCode['200'], data: null }
        const sendMsg = createMsg(errMsg, handleType.removeAllListeners)
        sendMessage(sendMsg, {}, sender)
    }
};