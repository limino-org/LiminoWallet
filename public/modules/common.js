import { ethers } from './ethers.js';
import { localforage } from './localforage.js'
import { encrypt, decrypt } from './cryptojs.js'



export const handleGetPwd = (str, time) => {
  return decrypt(str, time)
}

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
  "-32700": {
    code: "-32700",
    reason: "Parse error",
    message: "Invalid JSON"
  },
  // Invalid request
  "-32600": {
    code: "-32600",
    reason: "Invalid request",
    message: "JSON is not a valid request object"
  },
  // No invalid request method was found
  "-32601": {
    code: "-32601",
    reason: "Method not found",
    message: "Method does not exist"
  },
  // Invalid parameter
  "-32602": {
    code: "-32602",
    reason: "Invalid params",
    message: "Invalid method parameters"
  },
  "-32603": {
    code: "-32603",
    reason: "Internal error",
    message: "Internal JSON-RPC error"
  },
  // The input is invalid
  "-32000": {
    code: "-32000",
    reason: "Invalid input",
    message: "Missing or invalid parameters"
  },
  // Internal resources not found
  "-32001": {
    code: "-32001",
    reason: "Resource not found",
    message: "Requested resource not found"
  },
  // Resource unavailable
  "-32002": {
    code: "-32002",
    reason: "Resource unavailable",
    message: "Requested resource not available"
  },
  // The requested resource was denied
  "-32003": {
    code: "-32003",
    reason: "Transaction rejected",
    message: "Transaction creation failed"
  },
}


export const globalPath = `chrome-extension://${chrome.runtime.id}/popup.html`
export const globalHomePath = `chrome-extension://${chrome.runtime.id}/home.html`




export async function setSenderAccounts(sender, accountList = []) {
  const connectList = await getConnectList()
  const se = connectList.find(item => item.origin == sender.origin)
  if (!se) {
    connectList.unshift({ ...sender, accountList })
  } else {
    const idx = connectList.findIndex(item => item.origin == sender.origin)
    connectList[idx].accountList = accountList
  }
  return chrome.storage.local.set({ connectList: connectList })
}

export async function addSenderByAddr(sender, addr) {
  const connectList = await getConnectList()
  const idx = connectList.findIndex(item => item.origin == sender.origin)
  const se = connectList.find(item => item.origin == sender.origin)
  if(!se) {
    connectList.unshift({ ...sender, accountList:[addr] })
  } else {
    const addrs = connectList[idx].accountList
    const i = addrs.findIndex(add => add == addr)
    if(i === -1) {
      addrs.unshift(addr)
    }
    connectList[idx].accountList = addrs
  }
  return chrome.storage.local.set({ connectList: connectList })
}

export async function delSenderByAddr(sender, addr) {
  const connectList = await getConnectList()
  const se = connectList.find(item => item.origin == sender.origin)
  if(se) {
    const idx = connectList.findIndex(item => item.origin == sender.origin)
    const addrs = connectList[idx].accountList
    const i = addrs.findIndex(add => add == addr)
    if(i > -1) {
      addrs.splice(i,1)
    }
    connectList[idx].accountList = addrs
  }
  return chrome.storage.local.set({ connectList: connectList })
}

// Sender Connected website Query Sender connected account Queries whether the current website is connected to the wallet
export async function isConnected(sender) {
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
  const { address } = local.account.accountInfo
  // Check whether the sender is connected with an authorized address and whether the authorized address is the current wallet address 
  if (!accountList.includes(address)) {
    return false
  }
  return true
}
export function guid() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

//  get connectList
export async function getConnectList() {
  const list = await chrome.storage.local.get(['connectList'])
  return list && list.connectList ? list.connectList : []
}

// Connect to site query sender connected account
export async function getSenderAccounts(sender) {
  const connectList = await getConnectList()
  const se = connectList.find(item => item.origin == sender.origin)
  if (!se) {
    return []
  }
  return se.accountList || []
}


// clear connectList
export function clearConnectList() {
  return chrome.storage.local.set({ connectList: [] })
}

// clear password
export function clearPwd() {
  return chrome.storage.local.set({ password: '' })
}

export async function getPwd() {
  const local = await localforage.getItem("vuex") || null
  let localPwd = await chrome.storage.local.get(['password'])
  if (local && localPwd.password) {
    return handleGetPwd(localPwd.password, local.system.wallet_token.time)
  }
  return ''
}

// Determine whether the two addresses are the same, return
export async function handleDiffAddrAndLocalAddr(addr = '', localAddr = ''){
  return new Promise((resolve, reject) => {
    if(!addr || !localAddr) {
      const errMsg = { code: "-32002", reason: "Resource unavailable", message: "Address capacity null" }
      reject(errMsg)
    }
    if(addr && localAddr) {
      if(addr.toUpperCase() != localAddr.toUpperCase()) {
        const errMsg = { code: "-32002", reason: "Resource unavailable", message: "The current RPC request address is different from the account address" }
        reject(errMsg)
      } else {
        resolve()
      }
    }
  })

}

//  get local account of addr
export async function getLocalAddr() {
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
  const { accountInfo } = local.account;
  if(accountInfo && accountInfo.address){
    return accountInfo.address
  } else {
    throw errMsg
  }
}

export const eventTypes = {
  // Password failure event
  pwdExpired: "password-expired-event",
  initWallet: "init-wallet",
  openTabPopup: "open-tabPopup"
}

let newwallet = null
let provider = null
export async function getProvider() {
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
  const { currentNetwork } = local.account;
  const { URL } = currentNetwork
  if(!provider) {
    provider = ethers.getDefaultProvider(URL);
    return provider
  }
  if(provider){
    if(provider.connection.url != URL) {
      provider = ethers.getDefaultProvider(URL);
    }
    return provider
  }
  return provider
} 

export async function initWallet() {
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
    const { accountInfo, currentNetwork } = local.account;
    const { keyStore } = accountInfo;
    const { URL } = currentNetwork
    const params = { json: keyStore, password: pwdVal };
    if(!newwallet) {
      const wallet = await createWalletByJson(params);
      provider = ethers.getDefaultProvider(URL);
      newwallet = wallet.connect(provider);
      return newwallet
    }
    if(!newwallet.provider) {
      provider = ethers.getDefaultProvider(URL);
      newwallet = wallet.connect(provider);
      return newwallet
    }
    if(newwallet.provider &&(newwallet.provider.connection.url != URL)) {
      provider = ethers.getDefaultProvider(URL);
      newwallet.connect(provider);
      return newwallet
    }
    if(accountInfo.address.toUpperCase() != newwallet.address.toUpperCase()) {
      const newLocal = await localforage.getItem("vuex") || null
      const { accountInfo: newAccountInfo, currentNetwork: newCurrentNetwork } = newLocal.account;
      const { keyStore } = newAccountInfo;
      const { URL } = newCurrentNetwork
      const params = { json: keyStore, password: pwdVal };
      const wallet = await createWalletByJson(params);
      provider = ethers.getDefaultProvider(URL);
      newwallet = wallet.connect(provider);
    }
    return newwallet
  } catch (err) {
    clearConnectList()
    return Promise.reject(err);
  }
}

// The wallet is connect to the node
export async function getConnectWallet() {
  try {
    const local = await localforage.getItem("vuex") || {}
    const { accountInfo, currentNetwork } = local.account;
    const { URL } = currentNetwork
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
  disconnect: 'disconnect',
  message: 'message',
  pwdExpired: 'pwdExpired'
}


// // The type of API that is open to the public
export const handleType = {
  eth_getCode:'eth_getCode',
  // Signature 
  eth_sign: "eth_sign",
  // Get block height
  eth_blockNumber: "eth_blockNumber",
  eth_getBlockByNumber: "eth_getBlockByNumber",
  // trade
  eth_sendTransaction: "eth_sendTransaction",
  eth_signTransaction:"eth_signTransaction",
  eth_sendRawTransaction:"eth_sendRawTransaction",
  eth_send:"eth_send",
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
  eth_signTypedData:"eth_signTypedData",
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
  eth_getTransactionReceipt: 'eth_getTransactionReceipt',
  eth_getTransactionCount: "eth_getTransactionCount",
  eth_getBlockNumber: "eth_getBlockNumber",
  eth_subscribe: "eth_subscribe",
  eth_getBlockByHash:'eth_getBlockByHash',
  // Remove listening events
  removeAllListeners: 'removeAllListeners',
  // Get account balance
  eth_getBalance: 'eth_getBalance',
  net_version: 'net_version',
  eth_gasPrice: 'eth_gasPrice',
  logout: "logout",
  login: "login",
  handleReject: 'handleReject',
  eth_call:'eth_call',
  // Obtain the transaction receipt
  waitTxQueueResponse: "waitTxQueueResponse"
}

// A method that requires the user to actively trigger through the wallet button
export const wallet_methods = [
  handleType.eth_requestAccounts,
  handleType.eth_sendTransaction,
  handleType.eth_sign,
  handleType.personal_sign,
  handleType.multiple_sign,
  handleType.handleReject,
  handleType.eth_accounts,
  eventsEmitter.message,
  eventsEmitter.accountsChanged,
  eventsEmitter.chainChanged
]

export async function getLocalParams(method) {
  const data = await chrome.storage.local.get([method])
  return data[method] ? data[method] : {}
}


export function getHostName(url = '') {
  const protocol = url.split('://')[0]
  const regex = /.*\:\/\/([^\/]*).*/;
  const match = url.match(regex);
  let host = ''
  if (typeof match != "undefined" && null != match) {
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
export function sendMessage(msg = {}, opt = {}, sender) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query(
      opt,
      async (tabs) => {
        if (tabs.length) {
          // send to sender
          for (const tab of tabs) {
            if (sender) {
              if (tab.url && tab.url.includes(sender.origin)) {
                const { origin } = sender
                chrome.tabs.sendMessage(tab.id, { ...msg, origin });
                resolve()
              }
            } else {
              const connectList = await getConnectList()
              const originList = connectList.map(item => item.origin)
              const hostName = getHostName(tab.url)
              if (originList.includes(hostName)) {
                chrome.tabs.sendMessage(tab.id, { ...msg, origin: hostName });
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
export function createMsg(response = null, method = 'unknow', type = 'wormholes-callback') {
  return {
    type,
    data: {
      method,
      response: {...response, method}
    }
  }
}

//   service worker response data
export function createBgMsg(response = null, method = 'unknow', type = 'serviceWorker-callback') {
  return {
    type,
    data: {
      method,
      response
    }
  }
}

export function closeTabs() {
  return new Promise(resolve => {
    chrome.tabs.query(
      {
      }, async (tabs) => {
        for await (const win of tabs) {
          if (win.url && (win.url.includes(globalPath) || win.url.includes(globalHomePath))) {
            await chrome.tabs.remove(win.id)
          }
        }
        resolve()
      })
  })

}

export function hasOpenConnectPopup() {
  return new Promise((resolve,reject) => {
    chrome.tabs.query(
      {
      }, async (tabs) => {
        let flag = false
        for await (const win of tabs) {
          if (win.url && (win.url.includes(globalPath)) && (win.url.includes('/loginAccount/step1') > -1 || win.url.includes('/connect') > -1) ) {
            flag = true
          }
        }
        console.warn('flag', flag)
       if(!flag){
        resolve(true)
       } else {
        const errMsg = { code: "-32002", reason: "Resource unavailable", message: "The window is already open" }
        const sendMsg = createMsg(errMsg, 'connect')
        reject()
       }
      })
  })
}


// Open the popup window
export async function openPopup(
  method,
  url,
  handleResponse,
  sender,
) {
  await closeTabs()
  const senderParams = await getLocalParams(method)
  // console.log('openPopup 2', senderParams)
  // const { status } = senderParams
  // if (status && status != 'close') {
  //   return
  // }
  senderParams.status = 'pendding'
  await chrome.storage.local.set({ [method]: senderParams })
  return new Promise(async (resolve) => {
    chrome.windows.getCurrent(async function (e) {
      chrome.windows.create(
        {
          url,
          type: 'popup',
          left: e.width - 355,
          top: -10,
          width: 390,
          height: 610,
        }, async (e) => {
          // await chrome.storage.local.set({ ['tab-params' +e.id]: {...senderParams,method} })
          await chrome.storage.local.set({
            [method]: {
              sender,
              window: e,
              handleResponse: handleResponse || null,
              pupupType: 'popup',
              method: "open"
            }
          })
          resolve(e)
        });
    });
  })
}

export async function openTabPopup(
  method,
  url,
  handleResponse,
  sender,
) {
  await closeTabs()
  return new Promise(resolve => {
    chrome.tabs.create({ url: url }, async(e) => {
      await chrome.storage.local.set({
        [method]: {
          sender,
          window: e,
          handleResponse: handleResponse || null,
          pupupType: 'tab'
        }
      })
      resolve(e)
    })
    // const currentWindow = window.open(url)
    // chrome.windows.getCurrent(async function (e) {
    //   await chrome.storage.local.set({
    //     [method]: {
    //       sender,
    //       window: e,
    //       handleResponse: handleResponse || null,
    //       currentWindow,
    //       pupupType: 'tab'
    //     }
    //   })
    //   resolve(e)
    // })
  })

}

export async function resetParamsData(method) {
  try {
    const params = await chrome.storage.local.get([method])
    params[method].window = null
    params[method].handleResponse = null
    params[method].status = 'close'
    params[method].pupupType = ''
    await chrome.storage.local.set({ [method]: params[method] })
  } catch (err) {
    console.error(err)
  }

}



// Close a window
export function closePopup(method, callback = () => { }) {
  const win = params[method].window
  if (win) {
    return new Promise((resolve, reject) => {
      if (params[method].pupupType == 'popup') {
        try {
          chrome.windows.remove(win.id, (e) => {
            resetParamsData(method)
            callback(e)
            resolve(e)
          });
        } catch (err) {
          console.error(err);
          reject(err)
        }
      }

      if (params[method].pupupType == 'tab') {
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


export function toHex(str) {
  if (str === '') return ''
  var hexCharCode = []
  for (var i = 0; i < str.length; i++) {
    hexCharCode.push(str.charCodeAt(i).toString(16))
  }
  return hexCharCode.join('')
}

