// @ts-nocheck
function provider() {
    this.enable = function () {
        console.log('request wallet connect')
        return this.connect()
    }
  this.postMsg = function(data, callback = function(){}) {
      const target = 'wormholes-inpage';
      console.warn('data postmsg---', data)
      const { method } = data
      if (method) {
        window['wormholes-' + method + '-callback'] = callback
      }
      window.postMessage({ target, data }, '*');
  }
  this.handlerPostMessage = function(data, callback = function(){}) {
    const target = 'wormholes-inpage';
    console.warn('data postmsg---', data)
    const { method } = data
    if (method) {
      window['wormholes-' + method + '-callback'] = callback
    }
    window.postMessage({ target, data }, '*');
}
    // issue a request
    this.request = function(params) {
      var _this = this
      return new Promise(function(resolve,reject){
        _this.postMsg({ ...params },(res)=>{
          const { code,message,response} = res
            if(code && code == 200){
              resolve(res.data)
            } else {
              console.error(res)
              reject(res)
            }
        })
      })
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
};


provider.prototype = {
    // monitor
    on(type = 'connect', callback = () => { }) {

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
window["wormholes-changeNetWork-callback"] = function(){

}
// Account switching
window["wormholes-changeAccount-callback"] = function(){
  
}

window.wormholes = new provider()


// Registers a custom signature callback event
const event = document.createEvent('Event');
event.initEvent('wormHoles-callback-event', true, true);

// Listen for callback events
document.addEventListener('wormHoles-callback-event', (res) => {
    // accepting of data
    console.log('event----', res.detail,window.location.origin)
    let { type, data } = res.detail;
    if (type == "wormholes-callback") {
        const { method, response } = data
        if (method && window['wormholes-' + method + '-callback']) {
            window['wormholes-' + method + '-callback'](response)
        }
    }
});

