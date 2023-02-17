
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
    wallet_methods
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
        const newurl = `${globalPath}#/connect?sender=${encodeURIComponent(JSON.stringify(sender))}&accountList=${encodeURIComponent(JSON.stringify(accountList))}&method=wallet_requestPermissions`
        try {
            await openPopup(method, newurl, sendResponse, sender, 'popup')
        } catch (err) {
            console.error('err-', err || 'error...')
        }
        console.log('local----',local)
        if (local && !local.account.accountInfo.address) {
            console.log('before open tab popup -2...')
            await closeTabs()
            console.log('before open tab popup -1...')
            const errMsg = { code: "-32002", reason: "Resource unavailable", message: "The wallet has not been initialized. Please initialize the wallet first" }
            const sendMsg = createMsg(errMsg, method)
            console.log('before open tab popup 0...')
            await sendMessage(sendMsg, {}, sender)
            const url = `chrome-extension://${chrome.runtime.id}/popup.html#/guide/step1`
            console.log('before open tab popup...')
            await openTabPopup(method, url, sendResponse, sender)
            return
        }
    },
    // Connect website
    async [handleType.eth_requestAccounts](data, sendResponse, sender) {
        const method = handleType.eth_requestAccounts
        const senderParams = await getLocalParams(method)
        const { status } = senderParams
        const local = await localforage.getItem("vuex") || null
        const accountList = await getSenderAccounts(sender)
        const newurl = `${globalPath}#/connect?sender=${encodeURIComponent(JSON.stringify(sender))}&accountList=${encodeURIComponent(JSON.stringify(accountList))}&method=eth_requestAccounts`
        try {
            await openPopup(method, newurl, sendResponse, sender, 'popup')
        } catch (err) {
            console.error('err-', err || 'error...')
        }
        console.log('local----',local)
        if (local && !local.account.accountInfo.address) {
            console.log('before open tab popup -2...')
            await closeTabs()
            console.log('before open tab popup -1...')
            const errMsg = { code: "-32002", reason: "Resource unavailable", message: "The wallet has not been initialized. Please initialize the wallet first" }
            const sendMsg = createMsg(errMsg, method)
            console.log('before open tab popup 0...')
            await sendMessage(sendMsg, {}, sender)
            const url = `chrome-extension://${chrome.runtime.id}/popup.html#/guide/step1`
            console.log('before open tab popup...')
            await openTabPopup(method, url, sendResponse, sender)
            return
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
    // Rpc generic method
    async handleRpc(method, data, sendResponse, sender) {
        const wallet = await getWallet()
        try {
            const res = await wallet.provider.send(method, data)
            const errMsg = { ...errorCode['200'], data: res }
            const sendMsg = createMsg(errMsg, method)
            sendMessage(sendMsg, {}, sender)
           }catch(err){
            sendMessage(err, {}, sender)
           }
        // if(!wallet_methods.includes(method)) {
      
        // } else {
        //     if(handleRpcRequest[method]) {
        //         handleRpcRequest[method](data, sendResponse, sender)
        //         return true
        //     } else {
        //         // Return error messages are not supported
        //         const errMsg = errorCode['4200']
        //         sendMessage(createMsg(errMsg, method || 'unknow'), {}, sender)
        //         return false
        //     }
        // }
    },
    // Get block height
    async [handleType.eth_blockNumber](data, sendResponse, sender) {
        try {
            const wallet = await getWallet();
            const blockNumber = await wallet.provider.send(handleType.eth_blockNumber,data);
            const errMsg = { ...errorCode['200'], data: blockNumber }
            const sendMsg = createMsg(errMsg, handleType.eth_blockNumber)
            sendMessage(sendMsg, {}, sender)
        } catch (err) {
            console.error(`eth_blockNumber: ${JSON.stringify(err)}`)
        }
    },
    async [handleType.eth_gasPrice](data, sendResponse, sender) {
        try {
            const wallet = await getWallet();
            const gasPrice = await wallet.provider.send(handleType.eth_gasPrice,data);
            // const newPrice = ethers.utils.formatUnits(gasPrice, 'wei')
            const errMsg = { ...errorCode['200'], data: gasPrice }
            const sendMsg = createMsg(errMsg, handleType.eth_gasPrice)
            sendMessage(sendMsg, {}, sender)
        } catch (err) {
            console.error(`eth_gasPrice: ${JSON.stringify(err)}`)
        }
    },
    async [handleType.eth_getCode](data, sendResponse, sender) {
        try {
            const wallet = await getWallet();
            const code = await wallet.provider.send('eth_getCode', data);
            console.warn('code--', code)
            const errMsg = { ...errorCode['200'], data: code }
            const sendMsg = createMsg(errMsg, handleType.eth_getCode)
            sendMessage(sendMsg, {}, sender)
        } catch (err) {
            console.error(`eth_getCode: ${JSON.stringify(err)}`)
        }
    },
    async [handleType.eth_getBlockByNumber](data, sendResponse, sender) {
        try {
            const wallet = await getWallet();
            const receipt = await wallet.provider.send('eth_getBlockByNumber',data);
            const errMsg = { ...errorCode['200'], data: JSON.stringify(receipt) }
            const sendMsg = createMsg(errMsg, handleType.eth_getBlockByNumber)
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
        const balance = await wallet.provider.send('eth_getBalance', data);
        const errMsg = { ...errorCode['200'], data: balance}
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
    async [handleType.eth_call](data, sendResponse, sender){
        const wallet = await getWallet();
        const newData = await wallet.provider.send(handleType.eth_call, data);
        const errMsg = { ...errorCode['200'], data: newData}
        const sendMsg = createMsg(errMsg, handleType.eth_call)
        sendMessage(sendMsg, {}, sender)
    },
    // Obtain transaction information through transaction hash
    async [handleType.eth_getTransactionByHash](data, sendResponse, sender) {
        try {
            const wallet = await getWallet();
            const receipt = await wallet.provider.send(handleType.eth_getTransactionByHash, data)
            const errMsg = { ...errorCode['200'], data: JSON.stringify(receipt) || null }
            const sendMsg = createMsg(errMsg, handleType.eth_getTransactionByHash)
            sendMessage(sendMsg, {}, sender)
        } catch (err) {
            console.error(err)
        }
    },
    async [handleType.eth_getTransactionReceipt](data, sendResponse, sender) {
        try {
            const wallet = await getWallet();
            const receipt = await wallet.provider.send(handleType.eth_getTransactionReceipt, data)
            console.warn('receipt', receipt)
            const errMsg = { ...errorCode['200'], data: JSON.stringify(receipt) || null }
            const sendMsg = createMsg(errMsg, handleType.eth_getTransactionReceipt)
            sendMessage(sendMsg, {}, sender)
        } catch (err) {
            console.error(err)
        }
    },
    
    async [handleType.eth_getBlockByHash](data, sendResponse, sender) {
        try {
            const wallet = await getWallet();
            const receipt = await wallet.provider.send(handleType.eth_getBlockByHash, data)
            const errMsg = { ...errorCode['200'], data: JSON.stringify(receipt) || null }
            const sendMsg = createMsg(errMsg, handleType.eth_getBlockByHash)
            sendMessage(sendMsg, {}, sender)
        } catch (err) {
            console.error(err)
        }
    },
    async [handleType.eth_getTransactionCount](data, sendResponse, sender) {
        console.log('eth_getTransactionCount', data)
        try {
            const wallet = await getWallet();
            const receipt = await wallet.provider.send(handleType.eth_getTransactionCount, data)
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
            const network = await wallet.provider.send(handleType.eth_chainId, data);
            // const chainId = ethers.utils.hexlify(network.chainId)
            const errMsg = { ...errorCode['200'], data: network }
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
            const network = await wallet.provider.send(handleType.net_version, data)
            // const chainId = ethers.utils.hexlify(network.chainId)
            const errMsg = { ...errorCode['200'], data: network }
            const sendMsg = createMsg(errMsg, handleType.net_version)
            sendMessage(sendMsg, {}, sender)
        } catch (err) {
            console.error(`net_version:${JSON.stringify(err)}`)
        }
    },
    async [handleType.eth_subscribe](data, sendResponse, sender) {
        console.warn('eth_subscribe', data)
        try {
            const wallet = await getWallet();
            const newData = await wallet.provider.send(handleType.eth_subscribe, data);
            // const chainId = ethers.utils.hexlify(network.chainId)
            const errMsg = { ...errorCode['200'], data: newData }
            const sendMsg = createMsg(errMsg, handleType.eth_subscribe)
            sendMessage(sendMsg, {}, sender)
        } catch (err) {
            const errMsg = { ...errorCode['32000'], data: null }
            sendMessage(errMsg, {}, sender)
            console.warn(`eth_subscribe:${JSON.stringify(err)}`)
        }
    },
    
    // Gets the current wallet address
    async [handleType.eth_accounts](data, sendResponse, sender) {
        const wallet = await getWallet();
        // const adds = await wallet.provider.send('eth_accounts',[])
        // console.warn('adds----', adds)
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
            const gas = await wallet.provider.send(handleType.eth_estimateGas,data)
            // const newgas = ethers.utils.hexlify(gas)
            const errMsg = { ...errorCode['200'], data: gas }
            const sendMsg = createMsg(errMsg, handleType.eth_estimateGas)
            sendMessage(sendMsg, {}, sender)
        } catch (err) {
            console.error('eth_estimateGas', err)
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