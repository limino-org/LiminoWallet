


import { ethers } from './modules/ethers.js';
import { localforage } from './modules/localforage.js'
import { encrypt, decrypt } from './modules/cryptojs.js'

console.log('ethers', ethers)
console.log('localforage', localforage)
console.log('encrypt', encrypt)
console.log('decrypt', decrypt)
// Listening for Browser events
// Return true for asynchronous messages
chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  const walletPwd = await getPwd()
  if(!walletPwd){
    clearConnectList()
  }
  const { data, target } = request;
  if (!target) {
    return false
  }
  if (target != 'wormholes-inpage' && target != 'wormholes-popup' && (!data || !data.method)) {
    const errMsg = errorCode['4100']
    sendMessage(createMsg(errMsg, data.method || 'unknow'), {}, sender)
    return false
  }
  const { method, params: newParams } = data
  // Check whether target is a Content-script injected wormholes-inpage
  // Authentication to check whether the connection is established
  const isConnect = await isConnected(sender)
  //  When not connected
  if ((target == 'wormholes-inpage' && !isConnect) && (method != handleType.wallet_requestPermissions && method != handleType.eth_requestAccounts)) {
    const errMsg = errorCode['4100']
    sendMessage(createMsg(errMsg, method || 'unknow'), {}, sender)
    return false
  }
  // If no, return the account address if yes
  if (isConnect && (method == handleType.wallet_requestPermissions || method == handleType.eth_requestAccounts)) {
    const response = await getSenderAccounts(sender)
    const errMsg = { ...errorCode['200'], data: response }
    const sendMsg = createMsg(errMsg, method)
    sendMessage(sendMsg, {}, sender)
    return false
  }




// form web page message
  if (target == 'wormholes-inpage') {
      // Check whether the RPC Method is supported
  if (!handlers[method]) {
    // Return error messages are not supported
    const errMsg = errorCode['4200']
    sendMessage(createMsg(errMsg, method || 'unknow'), {}, sender)
    return false
  }
    // RPC calls
    handlers[method](newParams, sendResponse, sender)
    return true;
  }


// form popup message
  if (target == 'wormholes-popup') {
    const { method, response} = data
    if (method == 'update-wallet') {
      initWallet()
      sendResponse({code:200})
      return false
    }

    if (!params[method] || !params[method].sendResponse) {
      const errMsg = errorCode['4200']
      sendMessage(createMsg(errMsg, method || 'unknow'), {}, sender)
      return false
    }
    params[method].sendResponse(response || {}, sendResponse, sender)
    return true
  }
});

const handleGetPwd = (str, time) => {
  return decrypt(str, time)
}



chrome.runtime.onInstalled.addListener(async () => {
  await clearConnectList()
  await clearPwd()
  console.log('Background.js onInstalled.')
})



export function createWalletByJson(params) {
  const { password, json } = params
  if (!password || !json) {
    return Promise.reject()
  }
  return ethers.Wallet.fromEncryptedJson(JSON.stringify(json), password)
}
export const errorCode = {
 // The request is successful
 "200": {
  code: 200,
  message: "Successful "
},
// 	User rejects request
"4001": {
  code: 4001,
  reason: "User Rejected Request",
  message: "The user rejected the request. "
},
// without authorization
"4100": {
  code: 4100,
  reason: "Unauthorized",
  message: "The requested method and/or account has not been authorized by the user. "
},
// Unsupported methods
"4200": {
  code: 4200,
  reason: "Unsupported Method",
  message: "The Provider does not support the requested method. "
},
// disconnect
"4900": {
  code: 4900,
  reason: "Disconnected",
  message: "The Provider is disconnected from all chains."
},
// Chain disconnected
"4901": {
  code: 4901,
  reason: "Chain Disconnected",
  message: "The Provider is not connected to the requested chain."
},
// Parse error
"-32700":{
  code:"-32700",
  reason: "Parse error",
  message: "Invalid JSON"
},
// Invalid request
"-32600":{
  code:"-32600",
  reason: "Invalid request",
  message: "JSON is not a valid request object"
},
// No invalid request method was found
"-32601":{
  code:"-32601",
  reason: "Method not found",
  message: "Method does not exist"
},
// Invalid parameter
"-32602":{
  code:"-32602",
  reason: "Invalid params",
  message: "Invalid method parameters"
},
"-32603":{
  code:"-32603",
  reason: "Internal error",
  message: "Internal JSON-RPC error"
},
// The input is invalid
"-32000":{
  code:"-32000",
  reason: "Invalid input",
  message: "Missing or invalid parameters"
},
// Internal resources not found
"-32001":{
  code:"-32001",
  reason: "Resource not found",
  message: "Requested resource not found"
},
// Resource unavailable
"-32002":{
  code:"-32002",
  reason: "Resource unavailable",
  message: "Requested resource not available"
},
// The requested resource was denied
"-32003":{
  code:"-32003",
  reason: "Transaction rejected",
  message: "Transaction creation failed"
},
}


const globalPath = `chrome-extension://${chrome.runtime.id}/popup.html`
const globalHomePath = `chrome-extension://${chrome.runtime.id}/home.html`



// Connect to site query sender connected account
async function getSenderAccounts(sender) {
  const connectList = await getConnectList()
  const se = connectList.find(item => item.origin == sender.origin)
  if (!se) {
    return []
  }
  return se.accountList || []
}

async function setSenderAccounts(sender, accountList = []) {
  const connectList = await getConnectList()
  const se = connectList.find(item => item.origin == sender.origin)
  if (!se) {
    connectList.unshift({ ...sender, accountList })
  } else {
    const idx = connectList.findIndex(item => item.origin == sender.origin)
    connectList[idx].accountList = accountList
  }
  return chrome.storage.local.set({connectList:connectList})
}

// Sender Connected website Query Sender connected account Queries whether the current website is connected to the wallet
async function isConnected(sender) {
  const connectList = await getConnectList()
  const bool = connectList.find(item => item.origin == sender.origin)
  if (!bool) {
    return false
  }
  // Determines whether the sender has an authorized address
  const accountList = await getSenderAccounts(sender)
  if (!accountList.length) {
    return false
  }
  const local = await localforage.getItem("vuex") || null
  const {address} = local.account.accountInfo
  // Check whether the sender is connected with an authorized address and whether the authorized address is the current wallet address 
  if (!accountList.includes(address)) {
    return false
  }
  return true
}


//  get connectList
async function getConnectList(){
  const list = await chrome.storage.local.get(['connectList'])
  return list && list.connectList ? list.connectList : []
}

// clear connectList
function clearConnectList(){
  return chrome.storage.local.set({connectList:[]})
}

// clear password
function clearPwd(){
  return chrome.storage.local.set({password:''})
}

async function getPwd() {
  const local = await localforage.getItem("vuex") || null
  let localPwd = await chrome.storage.local.get(['password'])
  if (local && localPwd.password) {
    return handleGetPwd(localPwd.password, local.system.wallet_token.time)
  }
  return ''
}

const eventTypes = {
  // Password failure event
  pwdExpired:"password-expired-event",
  initWallet:"init-wallet"
}



async function initWallet() {
  const local = await localforage.getItem("vuex") || null
  if (!local) {
    const errMsg = { code: "-32002", reason: "Resource unavailable", message: "The wallet has not been initialized. Please initialize the wallet first" }
    throw errMsg
  }
  const pwdVal = await getPwd()
  if (!pwdVal) {
    const errMsg = { code: "-32002", reason: "Resource unavailable", message: "The wallet has not been initialized. Please initialize the wallet first" }
    throw errMsg
  }
  try {
    const { accountInfo,currentNetwork } = local.account;
    const { keyStore } = accountInfo;
    const {URL} = currentNetwork
    const params = { json: keyStore, password: pwdVal };
    let wallet = null;
    wallet = await createWalletByJson(params);
    let provider = ethers.getDefaultProvider(URL);
    const newwallet = wallet.connect(provider);
    return newwallet
  } catch (err) {
    clearConnectList()
    return Promise.reject(err);
  }
}

// The wallet is connect to the node
async function getConnectWallet() {
  try {
    const local = await localforage.getItem("vuex") || {}
    const { accountInfo, currentNetwork } = local.account;
    const {URL} = currentNetwork
    const wallet = await getWallet()
    let provider = ethers.getDefaultProvider(URL);
    const newwallet = wallet.connect(provider);
    return newwallet
  } catch {
    const errMsg = { code: "-32002", reason: "Resource unavailable", message: "The wallet connection node failed" }
    throw errMsg
  }
}

// Getting a wallet instance
export const getWallet = async () => {
  const wallet = await initWallet()
  // const errMsg = { code: "-32002", reason: "Resource unavailable", message: "The wallet has not been initialized. Please initialize the wallet first" }
  return wallet
};

// // Activity event
export const eventsEmitter = {
  // Account switching
  accountsChanged: 'accountsChanged',
  // Chain switch
  chainChanged: 'chainChanged',
  // connected
  connect: 'connect',
  // disconnect
  disconnect: 'disconnect'
}


// // The type of API that is open to the public
export const handleType = {
  // Signature 
  eth_sign: "eth_sign",
  // Get block height
  eth_blockNumber: "eth_blockNumber",
  // trade
  eth_sendTransaction: "eth_sendTransaction",
  // Signature Single signature data
  personal_sign: "personal_sign",
  // Signing multiple signature data
  multiple_sign: "multiple_sign",
  // Obtaining the network ID
  eth_getNetWork: "eth_getNetWork",
  // Connect to wallet
  wallet_requestPermissions: 'wallet_requestPermissions',
  // Connect to wallet
  eth_requestAccounts: 'eth_requestAccounts',
  // For chain id 
  eth_chainId: 'eth_chainId',
  // Gets the current wallet address
  eth_accounts: 'eth_accounts',
  // TODO Subscribe to news
  eth_subscription: 'eth_subscription',
  // Estimated gas cost
  eth_estimateGas: 'eth_estimateGas',
  // Obtain transaction information through transaction hash
  eth_getTransactionByHash: 'eth_getTransactionByHash',
  eth_getTransactionReceipt:'eth_getTransactionReceipt',
  eth_getTransactionCount: "eth_getTransactionCount",
  // Remove listening events
  removeAllListeners: 'removeAllListeners',
  // Get account balance
  eth_getBalance: 'eth_getBalance',
  net_version: 'net_version',
  logout:"logout",
  login:"login",
  handleReject:'handleReject'
}

async function getLocalParams(method){
  const data = await chrome.storage.local.get([method])
  return data[method] ? data[method] : {}
}
// //  Distributed event
const params = {
  [handleType.handleReject]: {
    sendResponse:async(data,sendResponse,sender) => {
      const {method} =data
      const senderParams = await getLocalParams(method)
      const errMsg = { ...errorCode['4001'], data: null }
      const sendMsg = createMsg(errMsg, method)
      await sendMessage(sendMsg, {},  senderParams.sender)
      closeTabs()
    }
  },

  [handleType.logout]:{
    sendResponse:async() => {
      await chrome.storage.local.set({ password: "" })
      await clearConnectList()
    }
  },
  [handleType.login]:{
    sendResponse:async(data, sendResponse, sender) => {
      const { password }= data
      if (password) {
        await chrome.storage.local.set({ password })
        chrome.alarms.create(eventTypes.pwdExpired, { delayInMinutes: 720 });
        chrome.alarms.onAlarm.addListener(async(e) => {
          const { name } = e
          if (name == eventTypes.pwdExpired) {
            // 12 h password expired clear data
            await clearConnectList()
            await clearPwd()
          }
        })
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
    sendResponse: async(data) => {
      const errMsg = data
      const method = handleType.personal_sign
      const senderParams = await getLocalParams(method)
      const sendMsg = createMsg(errMsg, method)
      await sendMessage(sendMsg, {}, senderParams.sender)
      closeTabs()
    },
  },
  [handleType.eth_sign]: {
    // Three states  close/open/pendding
    status: 'close',
    // Signature callback function - sent to Content-script
    sendResponse: async(v) => {
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
    sendResponse: async(v) => {
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
    sendResponse: async(v) => {
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
      console.warn('changeNetWork', v)
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
      console.warn('accountsChanged', v)
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
    sendResponse:async (v) => {
      const { data } = v;
      console.log('eth_sendTransaction', data)
      const errMsg = { ...errorCode['200'], data: data.hash }
      const method = handleType.eth_sendTransaction
      const senderParams = await getLocalParams(method)
      const sendMsg = createMsg(errMsg, method)
      await sendMessage(sendMsg, {}, senderParams.sender)
      closeTabs()

    },
  },
};

// call function
const handlers = {
  // Connect website
  async [handleType.wallet_requestPermissions](data, sendResponse, sender) {
    const method = handleType.wallet_requestPermissions
    const senderParams = await getLocalParams(method)
    const { status } =  senderParams
    const local = await localforage.getItem("vuex") || null

    const accountList = await getSenderAccounts(sender)
    const newurl = `${globalPath}#/connect?sender=${encodeURIComponent(JSON.stringify(sender))}&accountList=${encodeURIComponent(JSON.stringify(accountList))}`
    try {
      await openPopup(method, newurl, sendResponse, sender, 'popup')
    } catch (err) {
      console.error('err-', err || 'error...')
    }

    if (local && !local.account.accountInfo.address) {
      let time = setTimeout(async() => {
        try {
          await closeTabs()
          const errMsg = { code: "-32002", reason: "Resource unavailable", message: "The wallet has not been initialized. Please initialize the wallet first" }
          const sendMsg = createMsg(errMsg, method)
          await sendMessage(sendMsg, {}, sender)
          const url = `chrome-extension://${chrome.runtime.id}/popup.html#/guide/step1`
          await openTabPopup(method, url, sendResponse, sender, 'tab')
          clearTimeout(time)
        } catch (err) {
          console.error('err-2', err)
        }
      },600)

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
    } catch(err){
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
    console.warn('balance', balance)
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
    console.log('eth_getTransactionReceipt', data)
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
  async [handleType.eth_getTransactionCount](data,sendResponse,sender) {
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
    await chrome.storage.local.set({connectList:list})
    const errMsg = { ...errorCode['200'], data: null }
    const sendMsg = createMsg(errMsg, handleType.removeAllListeners)
    sendMessage(sendMsg, {}, sender)
  }
};



function getHostName(url = ''){
  const protocol = url.split('://')[0]
  const regex = /.*\:\/\/([^\/]*).*/;
  const match = url.match(regex);
  let host = ''
  if(typeof match != "undefined" && null != match){
    host = match[1];
  }
  return `${protocol}://${host}`;
}

// Send data to Content-script
/**
 *
 * @param msg
 * @param opt
 * TODO Note The OPT configuration is important
// currentWindow  Whether the TAB is in the current window.
// active  Whether the TAB is in the current window.  TAB Indicates whether the TAB is active in the window
 */
function sendMessage(msg = {}, opt = {}, sender) {
  return new Promise((resolve,reject) => {
    chrome.tabs.query(
      opt,
      async(tabs) => {
        if (tabs.length) {
          // send to sender
          for (const tab of tabs) {
            if(sender){
              if (tab.url.includes(sender.origin)) {
                const { origin } = sender
                chrome.tabs.sendMessage(tab.id, {...msg, origin});
                resolve()
              }
            } else {
              const connectList = await getConnectList()
              const originList = connectList.map(item => item.origin)
              const hostName = getHostName(tab.url)
              if (originList.includes(hostName)) {
                chrome.tabs.sendMessage(tab.id, {...msg, hostName});
                resolve()
              }
            }
          }
        }
      }
    );
  })

}
// Encapsulate returned data
function createMsg(response = null, method = 'unknow') {
  return {
    type: 'wormholes-callback',
    data: {
      method,
      response
    }
  }
}


function closeTabs() {
  return new Promise(resolve => {
    chrome.tabs.query(
      {
      }, async (tabs) => {
          for await (const win of tabs) {
            if (win.url.includes(globalPath) || win.url.includes(globalHomePath)) {
              await chrome.tabs.remove(win.id)
            }
          }
          resolve()
      })
  })

}


// Open the popup window
export async function openPopup(
  method,
  url,
  handleResponse,
  sender,
  type = 'popup'
) {
  await closeTabs()
  const senderParams = await getLocalParams(method)
  const { status } =  senderParams
  if (status && status != 'close') {
    return
  }

  senderParams.status = 'pendding'
  await chrome.storage.local.set({[method]: params})
  return new Promise(async (resolve) => {
    chrome.windows.getCurrent(async function (e) {
      chrome.windows.create(
        {
          url,
          type: 'popup',
          left: e.width - 355,
          top: -10,
          width: 390,
          height: 700,
        }, async(e) => {
          await chrome.storage.local.set({[method]:{
            sender,
            window: e,
            handleResponse: handleResponse || null,
            pupupType: 'popup',
            method:"open"
          }})
          resolve(e)
        });
    });
  })
}

async function openTabPopup(
  method,
  url,
  handleResponse,
  sender,
  type = 'popup'
) {
  await closeTabs()
  return new Promise(resolve => {
    const currentWindow = chrome.tabs.create({url: url})
    // const currentWindow = window.open(url)
    chrome.windows.getCurrent(async function (e) {
      await chrome.storage.local.set({[method]:{
        sender,
        window: e,
        handleResponse: handleResponse || null,
        currentWindow,
        pupupType: 'tab'
      }})
      resolve(e)
    })
  })

}

async function resetParamsData(method) {
  try {
    const params =  await chrome.storage.local.get([method])
     params[method].window = null
     params[method].handleResponse = null
     params[method].status = 'close'
     params[method].pupupType = ''
     await chrome.storage.local.set({[method]: params[method] })
  } catch (err) {
    console.error(err)
  }

}

//  Listen window closed
chrome.tabs.onRemoved.addListener(function (tabid, { windowId }) {
  console.warn("tab closed", tabid, windowId)
  Object.keys(params).forEach(method => {
    if ( params[method] &&  params[method].window &&  params[method].window.id == windowId) {
      resetParamsData(method)
    }
  })
})

// Close a window
export function closePopup(method, callback = () => { }) {
  const win =  params[method].window
  if (win) {
    return new Promise((resolve, reject) => {
      if ( params[method].pupupType == 'popup') {
        try {
          chrome.windows.remove(win.id, (e) => {
            resetParamsData(method)
            console.warn('close----',  params[method].window)
            callback(e)
            resolve(e)
          });
        } catch (err) {
          console.error(err);
          reject(err)
        }
      }

      if ( params[method].pupupType == 'tab') {
        try {
           params[method].currentWindow.close()
          resetParamsData(method)
           params[method].currentWindow = null
          resolve()
        } catch (err) {
          reject(err)
        }
      }

    })
  }
}
