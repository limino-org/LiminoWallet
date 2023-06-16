// @ts-nocheck
var filterEvent = ['accountsChanged', 'chainChanged']


function injectScript(file) {
  try {
    var th = document.head || document.documentElement;
    var scriptTag = document.createElement('script');
    scriptTag.setAttribute('async', 'false');
    scriptTag.setAttribute('type', 'text/javascript');
    scriptTag.setAttribute('src', file);
    th.appendChild(scriptTag);
    let time = setTimeout(() => {
      th.removeChild(scriptTag)
      clearTimeout(time)
    })
  } catch (err) {
    console.error('LiminoWallet:  Provider injection failed.', error)
  }

}
injectScript(chrome.runtime.getURL('js/inject-script.js'), 'body');

// The received information is sent to the background
window.addEventListener("message", function (ev) {
  if (ev.data && ev.data.target && ev.data.target == 'wormholes-inpage') {
    sendMessageToBackground(ev.data);
  }
});

// Receive messages Sent to the background Receive messages from the background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (sender.id == chrome.runtime.id) {
    // The callback event
    const { type, data, origin } = request
    // The callback event that invokes the function
    if (type && type == 'wormholes-callback') {
      // if case accountsChanged | chainChanged | connect | disconnect Check the permission. If no permission is granted, no response is received
      if (origin != location.origin) {
        return
      }
      var { method } = data
      // if (filterEvent.includes(method)) {
      //   const { connectList, address } = data
      //   const authAccount = connectList.find(item => item.origin == window.origin)
      //   if (!authAccount) {
      //     return false
      //   }
      //   const { accountList } = authAccount
      //   if (accountList && accountList.length) {
      //     const hasAuth = accountList.find(add => add.toUpperCase() == address.toUpperCase())
      //     if (!hasAuth) {
      //       return false
      //     }
      //   }
      // }
      // Custom events
      var cEvt = new CustomEvent("wormHoles-callback-event", {
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
  port.onMessage.addListener(function (msg) {
    console.log("receive：", msg);
  });
});
