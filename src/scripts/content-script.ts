// @ts-nocheck
console.log("Hello from the content-script", window.origin);

injectScript()


// The received information is sent to the background
window.addEventListener("message", function (ev) {
  if (ev.data && ev.data.target && ev.data.target == 'wormholes-inpage') {
    console.log('content-script data:', ev.data, ev)
    sendMessageToBackground(ev.data);
  }
});

const filterEvent = ['accountsChanged','chainChanged']
// Receive messages Sent to the background Receive messages from the background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (sender.id == chrome.runtime.id) {
    // The callback event
    const { type, data, origin } = request
    // The callback event that invokes the function
    if (type && type == 'wormholes-callback') {
      // if case accountsChanged | chainChanged | connect | disconnect Check the permission. If no permission is granted, no response is received
      if(origin != location.origin) {
        return
      }
      const { method } = data
      if(filterEvent.includes(method)){
        const { connectList, address } = data
        const authAccount = connectList.find(item => item.origin == window.origin)
        if(!authAccount){
          return false
        }
        const {accountList} = authAccount
        if(accountList && accountList.length){
          const hasAuth = accountList.find(add => add.toUpperCase() == address.toUpperCase())
          if(!hasAuth){
            return false
          }
        }
      }
      // Custom events
      const cEvt = new CustomEvent("wormHoles-callback-event", {
        detail: request,
      });
      // Sends events to the page
      document.dispatchEvent(cEvt);
    }

    return true;
  }
});

// Actively send messages to the background
// To demonstrate this functionality, open the console and actively execute sendMessageToBackground() 
function sendMessageToBackground(message) {
  chrome.runtime.sendMessage(chrome.runtime.id, message);
}

// Monitor long connection
chrome.runtime.onConnect.addListener(function (port) {
  console.log(port);
  port.onMessage.addListener(function (msg) {
    console.log("receive：", msg);
  });
});


function injectScript() {
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement('script');
    scriptTag.setAttribute('async', 'false');
    // Inline scripts do not work in MV3 due to more strict security policy
    // EInline scripts do not work in MV3 due to stricter security policies enforced in the current document  

    scriptTag.innerHTML = `
    console.log("Hello Wormholes...")
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
      console.log('event----', res.detail)
      let { type, data } = res.detail;
      if (type == "wormholes-callback") {
          const { method, response } = data
          if (method && window['wormholes-' + method + '-callback']) {
              window['wormholes-' + method + '-callback'](response)
          }
      }
  });
    `
    container.appendChild(scriptTag);
    var time = setTimeout(() => {
      container.removeChild(scriptTag)
      clearTimeout(time)
    },10)
  } catch (error) {
    console.error('Wormholes: Provider injection failed.', error);
  }
}


/**
 * TODO 
 * window.etherum.on('accountsChanged', (accounts) => {});
window.etherum.on('chainChanged', (accounts) => {});
window.etherum.on('connect', (accounts) => {});
provider = new ethers.providers.Web3Provider(window.etherum)
signer =  provider.getSigner()
signer.getAddress()
signer.signMessage()
siger.sendTransaction()
provider.getBlockNumber()
 */

function initWormholesScript() {
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
 
}