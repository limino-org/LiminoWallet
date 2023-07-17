function generateRandom() {
  function randomHex(){
    return Math.random().toString(16).slice(2)
  }
  return randomHex() + randomHex();
}

var events = [
  'connect',
  // 'disconnect',
  'chainChanged',
  'accountsChanged',
  'message',
  'pwdExpired',
  'loginIn',
  'logout'
  // 'error',
  // 'data'
]
function Provider() {
  var _this = this
  this._state = {
    accounts: [],
    isConnected: false,
    isUnlocked: false,
    initialized: false,


  }
  this.isLiminoWallet = true
  this.chainId = null
  this.networkVersion = null
  this.selectedAddress = ''
  this.subscriptions = []
  this.onEventMainCallId = 'OnMainEvent'
  this.init = () => {
    // Registers a custom signature callback event
    var event = document.createEvent('Event');
    event.initEvent('wormHoles-callback-event', true, true);

    // Listen for callback events
    document.addEventListener('wormHoles-callback-event', (res) => {
      // accepting of data
      let { type, data, sendId } = res.detail;
      if (type == "wormholes-callback") {
        var { method, response } = data
        if (!events.includes(method)) {
          if (method && sendId && response) {
            // ethereum.runCallBackByIdWithMethod(method, sendId, { ...response, sendId })
            wormholes.runCallBackByIdWithMethod(method, sendId, { ...response, sendId })
          }
        } else {
          let { method } = data
          if (method) {
            // ethereum.runCallBackEventByMethod(method, response.data)
            wormholes.runCallBackEventByMethod(method, response.data)
          }
        }
      }
    });
    var callId = this.onEventMainCallId
    this.on('chainChanged', (chainId) => {
      this._state.chainId = chainId
    }, callId)
    this.on('accountsChanged', ([addr]) => {
      this.selectedAddress = addr
    }, callId)
    this.on('pwdExpired', () => {
      this.state.isUnlocked = false
    }, callId)
    this.on('loginIn', () => {
      this._state.isUnlocked = true
    }, callId)
    this.on('logout', () => {
      this._state.isUnlocked = false
    }, callId)
  }
  this.enable = function () {
    return this.connect()
  }
  this._rpcSendCallbacks = {

  }
  this._eventCallbacks = {

  }
  this.postMsg = function (data, callback = function () { }) {
    var target = 'wormholes-inpage';
    var { method, params } = data
    if (method && method !== 'message') {
      var id = generateRandom()
      this.addSendCallBackById(method, id, callback)
      window.postMessage({ target, data: { ...data, sendId: id } }, '*');
    }

  }
  // issue a request
  this.request = function (params) {
    var _this = this
    var { method } = params
    // if(!this._state.isConnected && (method !== 'wallet_requestPermissions' || method !== 'eth_requestAccounts')){
    //   return Promise.reject('Request denied')
    // }
    if (((method === 'wallet_requestPermissions' || method == 'eth_requestAccounts') && this._state.isConnected)) {
      return new Promise((resolve, reject) => {
        var newParams = { ...params, method: 'eth_accounts' }
        _this.postMsg(newParams, res => {
          var { code, message, response, sendId } = res
          try {
            _this.handleUpdateState(res, newParams)
            if (code == 200) {
              resolve(res.data)
            } else {
              reject(res)
            }
          } catch (errData) {
            reject(errData)
          }
          _this.handleSendCallBackById(method, sendId)
        })
      })
    }
    return new Promise(function (resolve, reject) {
      _this.postMsg({ ...params }, (res) => {
        if (res) {
          var { code, message, response, sendId } = res
          try {
            _this.handleUpdateState(res, params)
            if (code && code == 200) {
              resolve(res.data)
            } else {
              console.error('Limino Err:', res.reason ? res.reason : '' + ' ' + res.method)
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
    var { code, data } = res
    if (code == 200) {
      var { method } = params
      switch (method) {
        case 'wallet_requestPermissions':
        case 'eth_requestAccounts':
        case 'eth_accounts':
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
        case 'pwdExpired':
          this._state.isUnlocked = false
          break;
        case 'loginIn':
          this._state.isUnlocked = true
          break;
        case 'logout':
          this._state.isUnlocked = false
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
      this.handleDelEventCall('accountsChanged')
      this.handleDelEventCall('chainChanged')
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
  handleUpdateState(res, params) {
    var { code, data } = res
    if (code == 200) {
      var { method } = params
      switch (method) {
        case 'wallet_requestPermissions':
        case 'eth_requestAccounts':
        case 'eth_accounts':
          this._state.accounts = data
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
          this.selectedAddress = data[0]
          this._state.accounts = data
          break;
        case 'loginIn':
          this._state.isUnlocked = true
          break;
        case 'logout':
          this._state.isUnlocked = false
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
      this.handleDelEventCall('accountsChanged')
      this.handleDelEventCall('chainChanged')
    }

  },
  // monitor
  /**
   * @param {} data
   * @param {*} type message connect error disconnect
   * @param {*} callback 
   */
  on(type, callback = () => { }, callId = null) {
    if (type && events.includes(type)) {
      var childCallId = generateRandom()
      this.handleAddEventCall(type, callId || childCallId, callback)
    }
    return this
  },
  off(type) {
    if (type && events.includes(type)) {
      this.handleDelEventCall(type)
    }

  },
  removeAllListeners() {
    return this.request({ method: 'removeAllListeners', params: {} })
  },
  async removeListener(method, call) {
    await this.handleDelEventCall(method);
    typeof call == 'function' ? call() : '';
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
  },
  handleUpdateSelectAddress(addr) {
    this.selectedAddress = addr
  },
  handleAddEventCall(method, callId, call) {
    if (method && callId && call) {
      if (!this._eventCallbacks[method]) {
        this._eventCallbacks[method] = {
          [callId]: call
        }
      } else {
        this._eventCallbacks[method][callId] = call
      }
    }
  },
  runCallBackEventByMethod(method, response = {}) {
    if (method) {
      if (this._eventCallbacks[method]) {
        Object.keys(this._eventCallbacks[method]).forEach(callId => {
          if (this._eventCallbacks[method][callId]) {
            this._eventCallbacks[method][callId](response)
          }
        })
      }
    }
  },
  handleDelEventCall(method) {
    return new Promise((resolve, reject) => {
      if (this._eventCallbacks[method]) {
        Object.keys(this._eventCallbacks[method]).forEach(callId => {
          if (callId != this.onEventMainCallId) {
            delete this._eventCallbacks[method][callId]
          }
        })
      }
      resolve()
    })

  }

}

// const ethereum = new Provider()
var wormholes = new Provider()
// window.ethereum = ethereum
window.wormholes = wormholes
// ethereum.init()
wormholes.init()


// Listen for callback events
document.addEventListener('wormHoles-callback-event', (res) => {
  // accepting of data
  let { type, data, sendId } = res.detail;

  if (type == "wormholes-callback") {
    var { method, response } = data
    if (!events.includes(method)) {
      if (method && sendId && response) {
        // ethereum.runCallBackByIdWithMethod(method, sendId, { ...response, sendId })
        wormholes.runCallBackByIdWithMethod(method, sendId, { ...response, sendId })
      }
    } else {
      let { method } = data
      if (method) {
        // ethereum.runCallBackEventByMethod(method, response.data)
        wormholes.runCallBackEventByMethod(method, response.data)
      }
    }
  }

});

