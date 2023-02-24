function guid() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
const events = [
  // 'connect',
  // 'disconnect',
  'chainChanged',
  'accountsChanged',
  'message',
  // 'error',
  // 'data'
]
function Provider() {
  this._state = {
    accounts: [],
    isConnected: false,
    isUnlocked: true,
    initialized: false
  }
  this.isLiminoWallet = true
  this.chainId = null
  this.networkVersion = null
  this.selectedAddress = ''
  this.subscriptions = []

  this.enable = function () {
    return this.connect()
  }
  this._rpcSendCallbacks = {

  }
  this.postMsg = function (data, callback = function () { }) {
    const target = 'wormholes-inpage';
    const { method, params } = data
    if (method && method !== 'message') {
      const id = guid()
      this.addSendCallBackById(method, id, callback)
      window.postMessage({ target, data: { ...data, sendId: id } }, '*');
    }

  }
  // issue a request
  this.request = function (params) {
    var _this = this
    const { method } = params
    if (method === 'wallet_requestPermissions' || method == 'eth_requestAccounts' && this._state.isConnected) {
      return
    }
    return new Promise(function (resolve, reject) {
      _this.postMsg({ ...params }, (res) => {
        if (res) {
          const { code, message, response, sendId } = res
          try {
            _this.handleUpdateState(res, params)
            if (code && code == 200) {
              resolve(res.data)
            } else {
              console.error('Limino Err:', res)
              reject(res)
            }
          } catch (errData) {
            reject(errData)
          }
          _this.handleSendCallBackById(method, sendId)
        } else {
          reject()
        }
      })
    })
  }

  this.handleUpdateState = function (res, params) {
    const { code, data } = res
    if (code == 200) {
      const { method } = params
      switch (method) {
        case 'wallet_requestPermissions':
        case 'eth_requestAccounts':
          this._state.accounts = data.data
          this._state.isConnected = true
          this._state.isUnlocked = false
          this.selectedAddress = data[0]
          break;
        case 'removeAllListeners':
          this._state.accounts = []
          this._state.isConnected = false
          this.selectedAddress = ''
          break;
        case 'net_version':
          this.chainId = data
          this.networkVersion = data
          break;
        case 'accountsChanged':
          this.selectedAddress = data
          break;
        default:
          this._state.isConnected = true
          break;
      }
    }

    if (code == 4100) {
      this._state.accounts = []
      this._state.isConnected = false
      this.selectedAddress = ''
      this._rpcSendCallbacks = {}
    }

  }

  // connect
  this.connect = function () {
    return this.request({
      method: "eth_requestAccounts",
      params: null
    })
  }

  this.isConnected = function () {
    return this._state.isConnected
  }

};

Provider.prototype = {
  // monitor
  /**
   * @param {} data
   * @param {*} type message connect error disconnect
   * @param {*} callback 
   */
  on(type, callback = () => { }) {
    if (type && events.includes(type)) {
      window['wormholes-' + type + '-on-callback'] = callback
    }
    return this
  },
  // off(type, callback = () => { }) {
  //   if(type && events.includes(type)) {
  //     window['wormholes-' + type + '-off-callback'] = callback
  //   }
  // },
  // logout
  removeAllListeners() {
    return this.request({ method: 'removeAllListeners', params: {} })
  },
  getBlockNumber() {
    return this.request({ method: 'eth_blockNumber', params: {} })
  },
  getTransactionReceipt(params) {
    return this.request({ method: 'eth_getTransactionReceipt', params })
  },
  handleSendCallBackById(method, sendId) {
    if (sendId && method) {
      if (this._rpcSendCallbacks[method] && this._rpcSendCallbacks[method][sendId]) {
        delete this._rpcSendCallbacks[method][sendId]
      }
    }
  },
  addSendCallBackById(method, sendId, call) {
    if (sendId && method) {
      if (!this._rpcSendCallbacks[method]) {
        this._rpcSendCallbacks[method] = {
          [sendId]: call
        }
      } else {
        this._rpcSendCallbacks[method][sendId] = call
      }
    }
  },
  runCallBackByIdWithMethod(method, sendId, response = {}) {
    if (sendId && method) {
      if (this._rpcSendCallbacks[method] && this._rpcSendCallbacks[method][sendId]) {
        this._rpcSendCallbacks[method][sendId](response)
      }
    }
  }

}

const ethereum = new Provider()
window.ethereum = ethereum



// Registers a custom signature callback event
const event = document.createEvent('Event');
event.initEvent('wormHoles-callback-event', true, true);

// Listen for callback events
document.addEventListener('wormHoles-callback-event', (res) => {
  // accepting of data
  let { type, data, sendId } = res.detail;
  if (type == "wormholes-callback") {
    const { method, response } = data
    if (!events.includes(method)) {
      if (method && sendId && response) {
        ethereum.runCallBackByIdWithMethod(method, sendId, { ...response, sendId })
      }
    } else {
      let { method, eventType } = data
      !eventType ? eventType = 'on' : 'off'
      const handleMethodName = 'wormholes-' + method + '-' + eventType + '-callback'
      if (eventType == 'on' && window[handleMethodName]) {
        window[handleMethodName](response.data)
      }
    }
  }

});

