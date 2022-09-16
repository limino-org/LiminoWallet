import { defaultAbiCoder } from 'ethers/lib/utils'
import useClipboard from 'vue-clipboard3'
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
  console.log('query-------', obj)
  return obj
}


// 字符串转16进制
export function toHex(str: string) {
  if (str === '') return ''
  var hexCharCode = []
  for (var i = 0; i < str.length; i++) {
    hexCharCode.push(str.charCodeAt(i).toString(16))
  }
  return hexCharCode.join('')
}

// 16进制转utf-8
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
  // encoding为空时默认为utf-8
  var bytesView = new Uint8Array(resultStr);
  var str = new TextDecoder(encoding).decode(bytesView);
  return str;
}

// 数组乱序
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




//base64转blob                                                                                                                                                                                        
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

// 下载base64图片
export const downloadBase64Img = (fileName: string = 'qrcode') => {
  let aLink = document.createElement('a')
  const canvasData = document.getElementsByTagName('canvas')
  let evt = document.createEvent("HTMLEvents")
  evt.initEvent("click", true, true) // initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
  aLink.download = fileName + new Date().getTime()
  aLink.href = canvasData[0].toDataURL("image/png");
  aLink.dispatchEvent(evt);
  aLink.click()
}

/**
 * @param url 图片路径
 */
export function getUrlBase64(url: string) {
  return new Promise((resolve, reject) => {
    let canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    let img = new Image();
    img.crossOrigin = "Anonymous"; //开启img的“跨域”模式
    img.src = url;
    img.onload = function () {
      canvas.height = img.height;
      canvas.width = img.width;
      // @ts-ignore
      ctx.drawImage(img, 0, 0, img.width, img.height); //参数可自定义
      const dataURL = canvas.toDataURL("image/jpeg", 1); //获取Base64编码
      resolve(dataURL);
      // @ts-ignore
      canvas = null; //清除canvas元素
      // @ts-ignore 
      img = null; //清除img元素
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