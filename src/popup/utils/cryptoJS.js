// @ts-nocheck
const CryptoJS = require("crypto-js");

const key = CryptoJS.enc.Utf8.parse("1234123412ABCDEF");  //Sixteen hexadecimal numbers are used as keys

//Decryption method
export function decrypt(word,ivKey) {
    const iv = CryptoJS.enc.Utf8.parse(ivKey.toString());   //Sixteen hexadecimal numbers are used as key offsets
    let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
    let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    let decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
}
window.Decrypt = decrypt
//encryption method
export function encrypt(word,ivKey) {
    const iv = CryptoJS.enc.Utf8.parse(ivKey.toString());   //Sixteen hexadecimal numbers are used as key offsets
    let srcs = CryptoJS.enc.Utf8.parse(word);
    let encrypted = CryptoJS.AES.encrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.ciphertext.toString().toUpperCase();
}
window.Encrypt = encrypt
