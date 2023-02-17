

function Provider() {
    this._state = {
      accounts:[],
      isConnected: false,
      isUnlocked: true,
      initialized: false
    }
    this.isLiminoWallet = true
    this.chainId = null
    this.networkVersion = null
    this.selectedAddress = ''

    this.enable = function () {
        console.log('request wallet connect')
        return this.connect()
    }
  this.postMsg = function(data, callback = function(){}) {
      const target = 'wormholes-inpage';
      const { method } = data
      if (method) {
        window['wormholes-' + method + '-callback'] = callback
      }
      window.postMessage({ target, data }, '*');
  }
  this.handlerPostMessage = function(data, callback = function(){}) {
    const target = 'wormholes-inpage';
    const { method } = data
    if (method) {
      window['wormholes-' + method + '-callback'] = callback
    }
    window.postMessage({ target, data }, '*');
}
// const JSONMethods = ['eth_getBlockByNumber','eth_getTransactionReceipt','eth_getTransactionByHash','eth_getBlockByHash']
    // issue a request
    this.request = function(params) {
      var _this = this
      const { method } = params
      if(method === 'wallet_requestPermissions' || method == 'eth_requestAccounts' && this._state.isConnected){
        return
      }
      console.warn(method,params)
      return new Promise(function(resolve,reject){
        _this.postMsg({ ...params },(res)=>{
          const { code,message,response} = res
          _this.handleUpdateState(res, params)
            if(code && code == 200){
              resolve(res.data)
            } else {
              console.error('Limino Err:', res)
              reject(res)
            }
        })
      })
    }

    this.handleUpdateState = function(res, params){
      const {code, data } = res
      if(code == 200) {
        const { method } = params
        switch(method){
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
        console.warn('handleUpdateState', res, params)
      }

      if(code == 4100){
        this._state.accounts = []
        this._state.isConnected = false
        this.selectedAddress = ''
      }

    }

     // connect
     this.connect =function() {
      console.log('wallet connected')
       return this.request({
          method: "wallet_requestPermissions",
          params: null
      })
  }
  // connect
  this.eth_requestAccounts = function() {

  }
  // 
  this.eth_accounts = function() {
    this.connect()
  }
  this.eth_call = function(res) {
      return new Promise((resolve, reject) => {
          const { code } = res
          if (code != 200) {
              reject(res)
          } else {
              resolve(res)
          }
      })
  }
  // signature
  this.eth_sign = function() {

  }
  // send
  this.send = function(method, params){
    return this.request({method, params}).then(res => res.data)
  }
  this.isConnected = function(){
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
    on(params, callback = () => { }) {
      const { type, data } = params
      const events = [
        'connect',
        'chainChanged',
        'accountsChanged',
        'disconnect',
        'message'
      ]
      if(type && events.includes(type)) {
        window[`wormholes-${type}-callback`] = callback()
      }
    },
    // information
    message(params) {
       
    },
    // logout
    removeAllListeners(){
      return this.request({method:'removeAllListeners', params:{}})
    },
    getBlockNumber(){
      return this.request({method:'eth_blockNumber', params:{}})
    }
   
}



// network switcher
window["wormholes-chainChanged-callback"] = function(){

}
// Account switching
window["wormholes-accountsChanged-callback"] = function(){
  
}
// Message
window["wormholes-message-callback"] = function(){

}

window["wormholes-connect-callback"] = function(){

}
window["wormholes-disconnect-callback"] = function(){

}

window.ethereum =  new Provider()



// Registers a custom signature callback event
const event = document.createEvent('Event');
event.initEvent('wormHoles-callback-event', true, true);

// Listen for callback events
document.addEventListener('wormHoles-callback-event', (res) => {
    // accepting of data
    let { type, data } = res.detail;
    if (type == "wormholes-callback") {
        const { method, response } = data
        if (method && window['wormholes-' + method + '-callback']) {
            window['wormholes-' + method + '-callback'](response)
        }
    }
});

