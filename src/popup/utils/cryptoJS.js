// @ts-nocheck
const CryptoJS = require("crypto-js");

// console.log('CryptoJS', CryptoJS)
// const aseKey = 'eer12kl0495jfk02'

// const pwd = {
//     time: 1657851462722,
//     pwd: '123456'
// }


// //encryption
// export const encrypt = (message) => {
//     return CryptoJS.AES.encrypt(message, aseKey).toString()
// };
// window.encrypt = encrypt
// //decrypt
// export const decrypt = (str) => {
//     return CryptoJS.AES.decrypt(str, aseKey).toString(CryptoJS.enc.Utf8);
// }
// window.decrypt = decrypt


const key = CryptoJS.enc.Utf8.parse("1234123412ABCDEF");  //十六位十六进制数作为密钥

//解密方法
export function decrypt(word,ivKey) {
    const iv = CryptoJS.enc.Utf8.parse(ivKey.toString());   //十六位十六进制数作为密钥偏移量
    let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
    let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    let decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
}
window.Decrypt = decrypt
//加密方法
export function encrypt(word,ivKey) {
    const iv = CryptoJS.enc.Utf8.parse(ivKey.toString());   //十六位十六进制数作为密钥偏移量
    let srcs = CryptoJS.enc.Utf8.parse(word);
    let encrypted = CryptoJS.AES.encrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.ciphertext.toString().toUpperCase();
}
window.Encrypt = encrypt
