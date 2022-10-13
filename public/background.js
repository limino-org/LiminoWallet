


import { handleRpcRequest } from './modules/handleRpcRequest.js'
import { handleRpcResponse } from './modules/handleRpcResponse.js'

import {
  getPwd,
  clearConnectList,
  clearPwd,
  sendMessage,
  createMsg,
  initWallet,
  resetParamsData,
  errorCode,
  isConnected,
  getSenderAccounts,
  handleType
} from './modules/common.js'
// Listening for Browser events
// Return true for asynchronous messages
chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  const walletPwd = await getPwd()
  if (!walletPwd) {
    clearConnectList()
  }
  const { data, target } = request;
  if (!target) {
    return false
  }
  console.log('request', request)
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
    if (!handleRpcRequest[method]) {
      // Return error messages are not supported
      const errMsg = errorCode['4200']
      sendMessage(createMsg(errMsg, method || 'unknow'), {}, sender)
      return false
    }
    // RPC calls
    handleRpcRequest[method](newParams, sendResponse, sender)
    return true;
  }


  // form popup message
  if (target == 'wormholes-popup') {
    const { method, response } = data
    if (method == 'update-wallet') {
      initWallet()
      return false
    }
    if (!handleRpcResponse[method] || !handleRpcResponse[method].sendResponse) {
      const errMsg = errorCode['4200']
      sendMessage(createMsg(errMsg, method || 'unknow'), {}, sender)
      return false
    }
    handleRpcResponse[method].sendResponse(response || {}, sendResponse, sender)
    return true
  }
});



chrome.runtime.onInstalled.addListener(async () => {
  await clearConnectList()
  await clearPwd()
  console.log('Background.js onInstalled.')
})

//  Listen window closed
chrome.tabs.onRemoved.addListener(function (tabid, { windowId }) {
  Object.keys(handleRpcResponse).forEach(method => {
    if (handleRpcResponse[method] && handleRpcResponse[method].window && handleRpcResponse[method].window.id == windowId) {
      resetParamsData(method)
    }
  })
})