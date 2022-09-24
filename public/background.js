

import { ethers } from 'ethers';
import localforage from 'localforage';
import Cookies from 'js-cookie'



import Web3 from "web3";
export const web3 = new Web3(Web3.givenProvider);

export function createWalletByJson(params){
    const { password, json } = params
    if(!password || !json){
        return Promise.reject()
    }
    return ethers.Wallet.fromEncryptedJson(JSON.stringify(json), password)
}



// chrome.runtime.onInstalled.addListener(async() => {
//   console.log('Background.js onInstalled.')
// })

// chrome.runtime.onMessage.addListener((async (request, sender, sendResponse)  => {
//   const { data, target } = request;
//   console.log('Message:',target, data)
// }));


// import { ethers,localforage,createWalletByJson,web3,Cookies } from "../src/popup/utils/export";
// import { encrypt,decrypt } from '/src/popup/utils/cryptoJS.js'
// import Cookies from 'js-cookie'
// import Web3 from "web3";
// const web3 = new Web3(Web3.givenProvider);
// import localforage from 'localforage';
// const pwdKey = 'password'
// console.log('1------------------------------------------1')
// const getToken = async() =>{
//   const local = await localforage.getItem("vuex") || null
//   if(local) {
//     return local.system.wallet_token
//   }
//   return {}
// }

// async function  getCookies(key = pwdKey) {
//   const val = await getToken()
//   const value = Cookies.get(pwdKey)
//   if(value){
//     const {time} = val
//     const pwd = handleGetPwd(value, time)
//     walletPwd = pwd
//     return pwd
//   }
//   return ''
// }
// const handleGetPwd = (str,time) => {
//   return decrypt(str,time)
// }
// export function createWalletByJson(params){
//   const { password, json } = params
//   if(!password || !json){
//       return Promise.reject()
//   }
//   return ethers.Wallet.fromEncryptedJson(JSON.stringify(json), password)
// }
// export const errorCode = {
//   "4001": {
//       reason: "User Rejected Request",
//       message: "The user rejected the request. "
//   },
//   "4100": {
//       reason: "Unauthorized",
//       message: "The requested method and/or account has not been authorized by the user. "
//   },
//   "4200": {
//       reason: "Unsupported Method",
//       message: "The Provider does not support the requested method. "
//   },
//   "4900": {
//       reason: "Disconnected",
//       message: "The Provider is disconnected from all chains."
//   },
//   "4901": {
//       reason: "Chain Disconnected",
//       message: "The Provider is not connected to the requested chain."
//   }
// }


// const globalPath = `chrome-extension://${chrome.runtime.id}/popup.html`
// let walletPw = '';
// let wallet = null
// // Linked websites
// const connectList = []

// // Connect to site query sender connected account
// export function getSenderAccounts(sender) {
//   const se = connectList.find(item => item.origin == sender.origin)
//   if (!se) {
//     return []
//   }
//   return se.accountList || []
// }

// export function setSenderAccounts(sender, accountList = []) {
//   const se = connectList.find(item => item.origin == sender.origin)
//   if (!se) {
//     connectList.unshift({ ...sender, accountList })
//   } else {
//     const idx = connectList.findIndex(item => item.origin == sender.origin)
//     connectList[idx].accountList = accountList
//   }
//   connectList = connectList
// }

// // Sender Connected website Query Sender connected account Queries whether the current website is connected to the wallet
// async function isConnected(sender) {
//   const bool = connectList.find(item => item.origin == sender.origin)
//   if (!bool) {
//     return false
//   }
//   // Determines whether the sender has an authorized address
//   const accountList = getSenderAccounts(sender)
//   if (!accountList.length) {
//     return false
//   }
//   const wallet = await getWallet()
//   // Check whether the sender is connected with an authorized address and whether the authorized address is the current wallet address 
//   if (!accountList.includes(wallet.address)) {
//     return false
//   }
//   return true
// }

export const initWallet = async () => {
  const local = await localforage.getItem("vuex") || null
  if (!local && !walletPwd) {
    console.error("The wallet instance has not been initialized");
    const errMsg = { code: "-32002", reason: "Resource unavailable", message: "The wallet has not been initialized. Please initialize the wallet first" }
    throw errMsg
  }
  walletPwd = await getCookies()
  try {
    const { accountInfo, currentNetwork } = local.account;
    const { keyStore } = accountInfo;
    const { URL } = currentNetwork;
    const params = { json: keyStore, password: walletPwd };
    let wallet = null;
    wallet = await createWalletByJson(params);
    let provider = ethers.getDefaultProvider(URL);
    const newwallet = wallet.connect(provider);
    wallet = newwallet
    return newwallet
  } catch (err) {
    connectList = []
    return Promise.reject(err);
  }
}


// // Getting a wallet instance
export const getWallet = async () => {
  if (!wallet) {
    console.error("The wallet instance has not been initialized");
    wallet = await initWallet()
    // const errMsg = { code: "-32002", reason: "Resource unavailable", message: "The wallet has not been initialized. Please initialize the wallet first" }
    return wallet
  } else {
    return wallet
  }
};

// // Activity event
export const eventsEmitter = {
  // Account switching
  accountsChanged:'accountsChanged',
  // Chain switch
  chainChanged:'chainChanged',
  // connected
  connect:'connect',
  // disconnect
  disconnect:'disconnect'
}


// // The type of API that is open to the public
export const handleType = {
  // Signature 
  eth_sign : "eth_sign",
  // Get block height
  eth_blockNumber : "eth_blockNumber",
  // trade
  eth_sendTransaction : "eth_sendTransaction",
  // Signature Single signature data
  personal_sign : "personal_sign",
  // Signing multiple signature data
  multiple_sign : "multiple_sign",
  // Obtaining the network ID
  eth_getNetWork : "eth_getNetWork",
  // Connect to wallet
  wallet_requestPermissions : 'wallet_requestPermissions',
  // Connect to wallet
  eth_requestAccounts : 'eth_requestAccounts',
  // For chain id 
  eth_chainId : 'eth_cha:nId',
  // Gets the current wallet address
  eth_accounts : 'eth_accounts',
  // TODO Subscribe to news
  eth_subscription : 'eth_subscription',
  // Estimated gas cost
  eth_estimateGas : 'eth_estimateGas',
  // Obtain transaction information through transaction hash
  eth_getTransactionByHash : 'eth_getTransactionByHash',
  // Remove listening events
  removeAllListeners : 'removeAllListeners',
  // Get account balance
  eth_getBalance : 'eth_getBalance',
  net_version : 'net_version'
}
// //  Distributed event
// const params = {
//   // The connection callback
//   [handleType.wallet_requestPermissions]: {
//     data: null,
//     window: null,
//     sender: null,
//     handleResponse: null,
//     // Three states  close/open/pendding
//     status: 'close',
//     sendResponse: async (v) => {
//       const method = handleType.wallet_requestPermissions
//       const { response } = v;
//       const { sender } = params[method]
//       // Push when not connected
//       setSenderAccounts(sender, response)
//       const errMsg = { ...errorCode['200'], data: response }
//       const sendMsg = createMsg(errMsg, method)
//       console.warn('sendMsg', sendMsg)
//       sendMessage(sendMsg, {}, params[method].sender)
//       closeTabs()
//     }
//   },
//   // Signature Single signature data
//   [handleType.personal_sign]: {
//     data: null,
//     window: null,
//     sender: null,
//     handleResponse: null,
//     // Three states  close/open/pendding
//     status: 'close',
//     // Signature callback function - sent to Content-script 
//     sendResponse: (v) => {
//       const { response } = v;
//       console.warn("签名数据", v);
//       const errMsg = { ...errorCode['200'], data: response }
//       const method = handleType.personal_sign
//       const sendMsg = createMsg(errMsg, method)
//       console.warn('sendMsg', sendMsg)
//       sendMessage(sendMsg, {}, params[method].sender)
//       closeTabs()
//     },
//   },
//   [handleType.eth_sign]: {
//     data: null,
//     window: null,
//     sender: null,
//     handleResponse: null,
//     // Three states  close/open/pendding
//     status: 'close',
//     // Signature callback function - sent to Content-script 
//     sendResponse: (v) => {
//       const { response } = v;
//       const errMsg = { ...errorCode['200'], data: response }
//       const method = handleType.eth_sign
//       const sendMsg = createMsg(errMsg, handleType.eth_sign)
//       console.warn('sendMsg', sendMsg)
//       sendMessage(sendMsg, {}, params[method].sender)
//       closeTabs()
//     },
//   },
//   // Signing multiple signature data
//   [handleType.multiple_sign]: {
//     data: null,
//     window: null,
//     sender: null,
//     handleResponse: null,

//     // Three states  close/open/pendding
//     status: 'close',
//     // Signature callback function - sent to Content-script 
//     sendResponse: (v) => {
//       const { response } = v;
//       const errMsg = { ...errorCode['200'], data: response }
//       const method = handleType.multiple_sign
//       const sendMsg = createMsg(errMsg, handleType.multiple_sign)
//       sendMessage(sendMsg, {}, params[method].sender)
//       closeTabs()
//     },
//   },

//   // Get block height
//   [handleType.eth_blockNumber]: {
//     data: null,
//     sender: null,
//     handleResponse: null,
//     status: 'close',
//     // Get block height send data instance
//     sendResponse: async (v) => {
//       try {
//         const wallet = await getWallet()
//         const response = await wallet.provider.getBlockNumber()
//         const errMsg = { ...errorCode['200'], data: response }
//         const method = handleType.eth_getBlockNumber
//         const sendMsg = createMsg(errMsg, method)
//         console.warn('sendMsg', sendMsg)
//         sendMessage(sendMsg, {}, params[method].sender)
//       } catch (err) {
//         console.error('eth_blockNumber', err)
//       }
//     },
//   },
//   // Access to the network
//   [handleType.eth_getNetWork]: {
//     data: null,
//     sender: null,
//     handleResponse: null,
//     status: 'close',

//     // 获取网络id发送数据实例
//     sendResponse: (v) => {
//       const { response } = v
//       const errMsg = { ...errorCode['200'], data: response }
//       const method = handleType.eth_getNetWork
//       const sendMsg = createMsg(errMsg, handleType.eth_getNetWork)
//       console.warn('sendMsg', sendMsg)
//       sendMessage(sendMsg, {}, params[method].sender)
//     },
//   },

//   // switching network
//   [eventsEmitter.chainChanged]: {
//     data: null,
//     handleResponse: null,
//     sendResponse: async (v) => {
//       console.warn('changeNetWork', v)
//       const wallet = await getWallet()
//       const { response } = v;
//       const errMsg = { ...errorCode['200'], data: response }
//       const method = eventsEmitter.chainChanged
//       const sendMsg = createMsg(errMsg, eventsEmitter.chainChanged)
//       sendMsg.data.connectList = connectList
//       sendMsg.data.address = wallet.address
//       sendMessage(sendMsg, {}, params[method].sender)

//     },
//   },
//   // Switch account
//   [eventsEmitter.accountsChanged]: {
//     data: null,
//     sendResponse: async (v) => {
//       console.warn('changeNetWork', v)
//       const wallet = await getWallet()
//       const { response } = v;
//       const errMsg = { ...errorCode['200'], data: response }
//       const method = eventsEmitter.accountsChanged
//       const sendMsg = createMsg(errMsg, method)
//       sendMsg.data.connectList = connectList
//       sendMsg.data.address = wallet.address
//       sendMessage(sendMsg, {}, params[method].sender)

//     },
//   },
//   // trade
//   [handleType.eth_sendTransaction]: {
//     data: null,
//     window: null,
//     handleResponse: null,
//     // Three states  close/open/pendding
//     status: 'close',
//     sender: null,
//     sendResponse: (v) => {
//       const { response } = v;
//       const errMsg = { ...errorCode['200'], data: response.hash }
//       const method = handleType.eth_sendTransaction
//       const sendMsg = createMsg(errMsg, method)
//       console.warn('sendMsg', sendMsg)
//       sendMessage(sendMsg, {}, params[method].sender)
//       closeTabs()

//     },
//   },
// };
//  params = params;

// // Return to refuse
// const handleReject = (type) => {
//   const errMsg = { ...errorCode['4001'], data: null }
//   const sendMsg = createMsg(errMsg, type)
//   sendMessage(sendMsg, {},  params[type].sender)
//   closeTabs()
// }


// // call function
// const handlers = {
//   // Connect website
//   async [handleType.wallet_requestPermissions](data, sendResponse, sender) {
//     const method = handleType.wallet_requestPermissions
//     const { status } =  params[method]
//     console.warn('********************', 'wallet_requestPermissions', status)
//     const local = await localforage.getItem("vuex") || null
//     const url = chrome.extension.getURL("popup.html");
//     const accountList = getSenderAccounts(sender)
//     const newurl = `${url}#/connect?sender=${encodeURIComponent(JSON.stringify(sender))}&accountList=${encodeURIComponent(JSON.stringify(accountList))}`
//     try {
//       await openPopup(method, newurl, sendResponse, sender, 'popup')
//     } catch (err) {
//       console.error('err-', err || 'error...')
//     }

//     if (local && !local.account.accountInfo.address) {
//       let time = setTimeout(async () => {
//         try {
//           await closeTabs()
//           const errMsg = { code: "-32002", reason: "Resource unavailable", message: "The wallet has not been initialized. Please initialize the wallet first" }
//           const sendMsg = createMsg(errMsg, method)
//           sendMessage(sendMsg, {}, sender)
//           const url = `chrome-extension://${browser.runtime.id}/popup.html#/guide/step1`
//           await openTabPopup(method, url, sendResponse, sender, 'tab')
//           clearTimeout(time)
//         } catch (err) {
//           console.error('err-2', err)
//         }
//       }, 600)

//       return
//     }
//   },
//   // Connect website
//   async [handleType.eth_requestAccounts](data, sendResponse, sender) {
//     const url = chrome.extension.getURL("popup.html");
//     const newurl = `${url}#/connect?sender=${JSON.stringify(sender)}`
//     try {
//       await openPopup(handleType.eth_requestAccounts, newurl, sendResponse, sender)
//     } catch (err) {
//       sendMessage(err, {}, sender)
//     }
//   },
//   // Signature Indicates a single signature of the interface
//   async [handleType.personal_sign](data, sendResponse, sender) {
//     console.warn("chrome.windows", chrome.windows, data);
//     // 签名16进制数据，签名账户地址
//     const [sig, address] = data
//     // 解析签名数据
//     const recoverSig = utils.toUtf8String(sig)
//     console.warn('recoverSig', recoverSig)
//     const url = chrome.extension.getURL("popup.html");
//     let str = `sig=${recoverSig}&signType=personal_sign`;
//     const newurl = `${url}#/sign?${str}`;
//     try {
//       await openPopup(handleType.personal_sign, newurl, sendResponse, sender)
//     } catch (err) {
//       sendMessage(err, {}, sender)
//     }
//   },
//   //Signature Indicates a single signature of the interface
//   async [handleType.eth_sign](data, sendResponse, sender) {
//     console.warn("chrome.windows", chrome.windows, data);
//     //Sign the hexadecimal data and sign the account address
//     const [address, sig] = data
//     // Parsing signature data
//     const recoverSig = utils.toUtf8String(sig)
//     console.warn('recoverSig', recoverSig)
//     const url = chrome.extension.getURL("popup.html");
//     let str = `sig=${recoverSig}&signType=eth_sign`;
//     const newurl = `${url}#/sign?${str}`;
//     try {
//       await openPopup(handleType.eth_sign, newurl, sendResponse, sender)
//     } catch (err) {
//       sendMessage(err, {}, sender)
//     }
//   },
//   // Signature Interface has multiple signatures at a time
//   async [handleType.multiple_sign](data, sendResponse, sender) {
//     console.warn("chrome.windows", chrome.windows, data);
//     // Sign the hexadecimal data and sign the account address
//     const url = chrome.extension.getURL("popup.html");
//     let str = `sig=${data}`;
//     const newurl = `${url}#/multipleSign?${str}`;
//     try {
//       await openPopup(handleType.multiple_sign, newurl, sendResponse, sender)
//     } catch (err) {
//       sendMessage(err, {}, sender)
//     }
//   },
//   // Get block height
//   async [handleType.eth_blockNumber](data, sendResponse, sender) {
//     try {
//     const wallet = await getWallet();
//     const blockNumber = await wallet.provider.getBlockNumber();
//     const newBlockNumber = web3.utils.toHex(blockNumber)
//     const errMsg = { ...errorCode['200'], data: newBlockNumber }
//     const sendMsg = createMsg(errMsg, handleType.eth_blockNumber)
//     sendMessage(sendMsg, {}, sender)
//     } catch(err){
//       console.error(`eth_blockNumber: ${JSON.stringify(err)}`)
//     }
//   },
//   // Access to the network
//   async [handleType.eth_getNetWork](data, sendResponse, sender) {
//     const wallet = await getWallet();
//     const network = await wallet.provider.getNetwork();
//     const errMsg = { ...errorCode['200'], data: network }
//     const sendMsg = createMsg(errMsg, handleType.eth_getBlockNumber)
//     sendMessage(sendMsg, {}, sender)
//   },
//   // Get account balance
//   async [handleType.eth_getBalance](data, sendResponse, sender) {
//     const wallet = await getWallet();
//     const [address] = data
//     const balance = await wallet.provider.getBalance(address);
//     console.warn('balance', balance)
//     const errMsg = { ...errorCode['200'], data: balance }
//     const sendMsg = createMsg(errMsg, handleType.eth_getBalance)
//     sendMessage(sendMsg, {}, sender)
//   },
//   // tradable
//   async [handleType.eth_sendTransaction](data, sendResponse, sender) {
//     const url = chrome.extension.getURL("popup.html");
//     const [tx] = data
//     const newurl = `${url}#/nft-transaction?tx=${encodeURIComponent(JSON.stringify(tx))}`;
//     try {
//       await openPopup(handleType.eth_sendTransaction, newurl, sendResponse, sender)
//     } catch (err) {
//       sendMessage(err, {}, sender)
//     }
//   },
//   // Obtain transaction information through transaction hash
//   async [handleType.eth_getTransactionByHash](data, sendResponse, sender) {
//     const [hash] = data
//     console.warn('eth_getTransactionByHash---------------', data)
//     try {
//       const wallet = await getWallet();
//       const receipt = await wallet.provider.getTransaction(hash)
//       console.warn('receipt---------------', receipt)
//       receipt.hash = hash
//       const errMsg = { ...errorCode['200'], data: receipt || null }
//       const sendMsg = createMsg(errMsg, handleType.eth_getTransactionByHash)
//       sendMessage(sendMsg, {}, sender)
//     } catch (err) {
//       console.error(err)
//     }
//   },
//   // For chain id 
//   async [handleType.eth_chainId](data, sendResponse, sender) {
//     try {
//       const wallet = await getWallet();
//       console.log('wallet',wallet)
//       const network = await wallet.provider.getNetwork();
//       const chainId = web3.utils.toHex(network.chainId)
//       const errMsg = { ...errorCode['200'], data: chainId }
//       const sendMsg = createMsg(errMsg, handleType.eth_chainId)
//       sendMessage(sendMsg, {}, sender)
//     } catch (err) {
//       console.error(`eth_chainId:${JSON.stringify(err)}`)
//     }
//   },
//   // for chain id
//   async [handleType.net_version](data, sendResponse, sender) {
//     try {
//       const wallet = await getWallet();
//       console.log('wallet',wallet)
//       const network = await wallet.provider.getNetwork();
//       const chainId = web3.utils.toHex(network.chainId)
//       const errMsg = { ...errorCode['200'], data: chainId }
//       const sendMsg = createMsg(errMsg, handleType.net_version)
//       sendMessage(sendMsg, {}, sender)
//     } catch (err) {
//       console.error(`net_version:${JSON.stringify(err)}`)
//     }
//   },
//   // Gets the current wallet address
//   async [handleType.eth_accounts](data, sendResponse, sender) {
//     const wallet = await getWallet();
//     console.log('eth_accounts', wallet)
//     const errMsg = { ...errorCode['200'], data: [wallet.address] }
//     const sendMsg = createMsg(errMsg, handleType.eth_accounts)
//     sendMessage(sendMsg, {}, sender)
//   },
//   // TODO Subscribe to news 
//   [handleType.eth_subscription](data, sendResponse, sender) {
//     // Subscribe message, first store the Origin, send a message to determine whether it is the subscriber 
//   },
//   // Estimated gas cost 
//   async [handleType.eth_estimateGas](data, sendResponse, sender) {
//     const [tx] = data
//     const wallet = await getWallet()
//     try {
//       const gas = await wallet.provider.estimateGas(tx)
//       console.log('gas', gas)
//       const errMsg = { ...errorCode['200'], data: gas }
//       const sendMsg = createMsg(errMsg, handleType.eth_estimateGas)
//       sendMessage(sendMsg, {}, sender)
//     } catch (err) {
//       console.error('err', err)
//       const { reason, message } = err
//       const errMsg = {
//         code: "-32000",
//         reason,
//         message,
//         data: null
//       }
//       const sendMsg = createMsg(errMsg, handleType.eth_estimateGas)
//       sendMessage(sendMsg, {}, sender)
//     }

//   },
//   // Estimated gas charges remove listening events and client logout
//   [handleType.removeAllListeners](data, sendResponse, sender) {
//     console.warn('removeAllListeners------------------', connectList, sender)
//     const list = connectList.filter(item => item.origin != sender.origin)
//     connectList = list
//     const errMsg = { ...errorCode['200'], data: null }
//     const sendMsg = createMsg(errMsg, handleType.removeAllListeners)
//     sendMessage(sendMsg, {}, sender)
//   }
// };








// // Listening for Browser events
// // Return true for asynchronous messages
// chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
//   walletPwd = await getCookies()
//   walletPwd = walletPwd
//   if(!walletPwd){
//     connectList = []
//   }
//   const { data, target } = request;
//   if (!target) {
//     return false
//   }
//   if (target != 'wormholes-inpage' && (!data || !data.method)) {
//     const errMsg = errorCode['4100']
//     console.warn('111---------------------------------------------------------')
//     sendMessage(createMsg(errMsg, method || 'unknow'), {}, sender)
//     return false
//   }
//   const { method, params: newParams } = data
//   // Check whether target is a Content-script injected wormholes-inpage
//   // Authentication to check whether the connection is established
//   const isConnect = await isConnected(sender)
//   console.warn('isConnect', isConnect, sender)
//   //  When not connected
//   if ((target == 'wormholes-inpage' && !isConnect) && (method != handleType.wallet_requestPermissions && method != handleType.eth_requestAccounts)) {
//     const errMsg = errorCode['4100']
//     sendMessage(createMsg(errMsg, method || 'unknow'), {}, sender)
//     return false
//   }
//   // If no, return the account address if yes
//   if (isConnect && (method == handleType.wallet_requestPermissions || method == handleType.eth_requestAccounts)) {
//     const response = getSenderAccounts(sender)
//     const errMsg = { ...errorCode['200'], data: response }
//     const sendMsg = createMsg(errMsg, method)
//     console.warn('connected...', sendMsg)
//     sendMessage(sendMsg, {}, sender)
//     return false
//   }


//   // Check whether the RPC Method is supported
//   if (!handlers[method]) {
//     // Return error messages are not supported
//     const errMsg = errorCode['4200']
//     sendMessage(createMsg(errMsg, method || 'unknow'), {}, sender)
//     return false
//   }


//   if (target == 'wormholes-inpage') {
//     // RPC calls
//     if (handlers[method]) {
//       if ( params[method]) {
//          params[method]["sender"] = { ...sender };
//       }
//       handlers[method](newParams, sendResponse, sender)
//     } else {
//       console.error("method can't suppopt")
//     }
//     return true;
//   }
// });


// function getHostName(url = ''){
//   const protocol = url.split('://')[0]
//   const regex = /.*\:\/\/([^\/]*).*/;
//   const match = url.match(regex);
//   let host = ''
//   if(typeof match != "undefined" && null != match){
//     host = match[1];
//   }
//   return `${protocol}://${host}`;
// }

// // Send data to Content-script  
// /**
//  * 
//  * @param msg 
//  * @param opt 
//  * TODO Note The OPT configuration is important
// // currentWindow  Whether the TAB is in the current window.
// // active  Whether the TAB is in the current window.  TAB Indicates whether the TAB is active in the window 
//  */
// function sendMessage(msg = {}, opt = {}, sender) {
//   chrome.tabs.query(
//     opt,
//     (tabs) => {
//       console.log('chrome.tabs.query', tabs, msg, opt, sender)
//       if (tabs.length) {
//         // send to sender
//         for (const tab of tabs) {
//           if(sender){
//             if (tab.url.includes(sender.origin)) {
//               console.log('send message', msg, sender)
//               const { origin } = sender
//               chrome.tabs.sendMessage(tab.id, {...msg, origin});
//             }
//           } else {
//             const originList = connectList.map(item => item.origin)
//             const hostName = getHostName(tab.url)
//             if (originList.includes(hostName)) {
//               chrome.tabs.sendMessage(tab.id, {...msg, hostName});
//             }
//           }
//         }
//       }
//     }
//   );
// }
// // Encapsulate returned data
// function createMsg(response = null, method = 'unknow') {
//   return {
//     type: 'wormholes-callback',
//     data: {
//       method,
//       response
//     }
//   }
// }


// function closeTabs() {
//   return new Promise(resolve => {
//     chrome.tabs.query(
//       {
//       }, async (tabs) => {
//           for await (const win of tabs) {
//             if (win.url.includes(globalPath)) {
//               await chrome.tabs.remove(win.id)
//             }
//           }
//           resolve()
//       })
//   })

// }


// // Open the popup window
// export async function openPopup(
//   method,
//   url,
//   handleResponse,
//   sender,
//   type = 'popup'
// ) {
//   await closeTabs()
//   const { status } =  params[method]
//   if (status && status != 'close') {
//     return
//   }

//    params[method].status = 'pendding'
//   return new Promise(async (resolve) => {
//     chrome.windows.getCurrent(async function (e) {
//       chrome.windows.create(
//         {
//           url,
//           type: 'popup',
//           left: e.width - 355,
//           top: -10,
//           width: 390,
//           height: 700,
//         }, (e) => {
//            params[method]["window"] = e;
//            params[method]["handleResponse"] = handleResponse || null;
//            params[method].status = 'open'
//            params[method].pupupType = 'popup'
//           resolve(e)
//         });
//     });
//   })
// }

// async function openTabPopup(
//   method,
//   url,
//   handleResponse,
//   sender,
//   type = 'popup'
// ) {
//   await closeTabs()
//   return new Promise(resolve => {
//     const currentWindow = window.open(url)
//     chrome.windows.getCurrent(function (e) {
//        params[method]["window"] = e;
//        params[method]["sender"] = sender;
//        params[method]["handleResponse"] = handleResponse || null;
//        params[method].currentWindow = currentWindow
//        params[method].pupupType = 'tab'
//       resolve(e)
//     })
//   })

// }

// function resetParamsData(method) {
//   try {
//      params[method].window = null
//      params[method].handleResponse = null
//      params[method].status = 'close'
//      params[method].pupupType = ''
//   } catch (err) {
//     console.error(err)
//   }

// }

// //  Listen window closed
// chrome.tabs.onRemoved.addListener(function (tabid, { windowId }) {
//   console.warn("tab closed", tabid, windowId)
//   Object.keys( params).forEach(method => {
//     if ( params[method] &&  params[method].window &&  params[method].window.id == windowId) {
//       resetParamsData(method)
//     }
//   })
// })

// // Close a window
// export function closePopup(method, callback = () => { }) {
//   const win =  params[method].window
//   if (win) {
//     return new Promise((resolve, reject) => {
//       if ( params[method].pupupType == 'popup') {
//         try {
//           chrome.windows.remove(win.id, (e) => {
//             resetParamsData(method)
//             console.warn('close----',  params[method].window)
//             callback(e)
//             resolve(e)
//           });
//         } catch (err) {
//           console.error(err);
//           reject(err)
//         }
//       }

//       if ( params[method].pupupType == 'tab') {
//         try {
//            params[method].currentWindow.close()
//           resetParamsData(method)
//            params[method].currentWindow = null
//           resolve()
//         } catch (err) {
//           reject(err)
//         }
//       }

//     })
//   }
// }

