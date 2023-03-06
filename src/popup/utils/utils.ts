
import useClipboard from 'vue-clipboard3'
import { VUE_APP_SCAN_URL } from "@/popup/enum/env";
import store from '@/popup/store';

const { toClipboard } = useClipboard()

export const copy = async (v: string) => {
  try {
    await toClipboard(v)
    return Promise.resolve(v)
  } catch (err) {
    return Promise.reject(err)
  }
}

// get URL path
export const getURLPath = () => {
  const hash = location.hash
  const strarr = hash.split('?')
  const path = strarr[0].substring(1)
  return path || null
}

// get URL query
export const getQuery = () => {
  const hash = location.hash
  const strarr = hash.split('?')
  const str = strarr.length ? strarr[1] : null
  if (!str) {
    return {}
  }
  let arr = str.split("&");
  let obj: any = {};
  for (let i of arr) {
    obj[i.split("=")[0]] = i.split("=")[1];
  }
  return obj
}


// The string is converted to hexadecimal
export function toHex(str: string) {
  if (str === '') return ''
  var hexCharCode = []
  for (var i = 0; i < str.length; i++) {
    hexCharCode.push(str.charCodeAt(i).toString(16))
  }
  return hexCharCode.join('')
}

// Hexadecimal to UTF-8
export function hexToUtf8Str(hex: string, encoding = 'utf-8') {
  var trimedStr = hex.trim();
  var rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
  var len = rawStr.length;
  if (len % 2 !== 0) {
    alert("Illegal Format ASCII Code!");
    return "";
  }
  var curCharCode;
  var resultStr = [];
  for (var i = 0; i < len; i = i + 2) {
    curCharCode = parseInt(rawStr.substr(i, 2), 16);
    resultStr.push(curCharCode);
  }
  // Defaults to UTF-8 if Encoding is null
  var bytesView = new Uint8Array(resultStr);
  var str = new TextDecoder(encoding).decode(bytesView);
  return str;
}

// An array of random sequence
export const randArr = (arr: Array<any>) => {
  var res = [];
  var len = arr.length;
  for (var i = 0; i < len; ++i) {
    var index = Math.floor(Math.random() * arr.length);
    res.push(arr[index]);
    arr.splice(index, 1);
  }
  return res;
}




//Turn base64 blob                                                                                                                                                                                     
export const base64ToBlob = (code: string) => {
  let parts = code.split(';base64,')
  let contentType = parts[0].split(':')[1]
  let raw = window.atob(parts[1])
  let rawLength = raw.length
  let uInt8Array = new Uint8Array(rawLength)
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i)
  }
  return new Blob([uInt8Array], { type: contentType })
}

//Download the Base64 image
export const downloadBase64Img = (fileName: string = 'qrcode') => {
  let aLink = document.createElement('a')
  const canvasData = document.getElementsByTagName('canvas')
  let evt = document.createEvent("HTMLEvents")
  evt.initEvent("click", true, true) //InitEvent If FF is not added to the last two parameters, it will report the error event type, whether to bubble, whether to block the default behavior of the browser
  aLink.download = fileName + new Date().getTime()
  aLink.href = canvasData[0].toDataURL("image/png");
  aLink.dispatchEvent(evt);
  aLink.click()
}

/**
 * @param url Image path
 */
export function getUrlBase64(url: string) {
  return new Promise((resolve, reject) => {
    let canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    let img = new Image();
     //Enable IMG Cross - domain mode
    img.crossOrigin = "Anonymous";
    img.src = url;
    img.onload = function () {
      canvas.height = img.height;
      canvas.width = img.width;
      // @ts-ignore
      ctx.drawImage(img, 0, 0, img.width, img.height); //Parameters can be customized
      const dataURL = canvas.toDataURL("image/jpeg", 1); //Get Base64 encoding
      resolve(dataURL);
      // @ts-ignore
      canvas = null; //Clear Canvas elements
      // @ts-ignore 
      img = null; //Clear img elements
    };
    img.onerror = function () {
      reject(new Error("Could not load image at " + url));
    };
  });
}


//Generate a globally unique identifier
export function guid() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

export const viewTransactionByHash = (hash:string | null) => {
  if(hash) {
    if(store.state.account.currentNetwork.id === 'wormholes-network-1') {
      window.open(`${VUE_APP_SCAN_URL}TradeDetail/${hash}`);
    } else {
      const defaultUrl = store.state.account.currentNetwork.browser
      if(defaultUrl) {
        window.open(`${defaultUrl}`);
      } else {
        window.open(`${VUE_APP_SCAN_URL}TradeDetail/${hash}`);
      }
    }
  } else {
    throw Error('The hash cannot be empty')
  }
}

export const viewAccountByAddress = (address:string ) => {
  if(address) {
    if(store.state.account.currentNetwork.id === 'wormholes-network-1') {
      window.open(`${VUE_APP_SCAN_URL}AccountDetail/${address}`);
    } else {
      const defaultUrl = store.state.account.currentNetwork.browser
      if(defaultUrl) {
        window.open(`${defaultUrl}`);
      } else {
        window.open(`${VUE_APP_SCAN_URL}AccountDetail/${address}`);
      }
    }
  } else {
    throw Error('The address cannot be empty')
  }
}


export function throttle(fn: Function, delay = 200) {
  let timer: any = null
  return function () {
      if(timer) return
      timer = setTimeout(() => {
        // @ts-ignore
        fn.apply(this, arguments)
        timer = null
      })
  }
}


export function debounce(fn: Function, wait = 500) {
  let timeout: any = null;
  return function() {
      if(timeout !== null) clearTimeout(timeout);
      timeout = setTimeout(fn, wait);
  }
}