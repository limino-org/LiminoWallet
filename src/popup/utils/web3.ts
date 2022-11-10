import { Toast } from "vant";
import Web3 from "web3";
export const web3 = new Web3(Web3.givenProvider);
console.log('web3', web3)
import { BlockHeader, Block } from "web3-eth"; // ex. package types
import i18n from "@/popup/language/index";
import localforage from 'localforage';
import store from "../store";


export const connectWeb3Wallet = (privateKey: string) => {};
console.warn(Web3.givenProvider);

export interface DecryptPrivateKeyPraams {
  json: any;
  password: string;
}
export interface EncryptPrivateKeyParams {
  //  The private key to encrypt
  privateKey: string;
  // The password used for encryption
  password: string;
}
//Encrypt the private key to the keystore V3 standard format.
export const encryptPrivateKey = (params: EncryptPrivateKeyParams) => {
  const { privateKey, password } = params;
  return web3.eth.accounts.encrypt(privateKey, password);
};

// Unlock the private key according to the PWD keyStore
export const decryptPrivateKey = (params: DecryptPrivateKeyPraams) => {
  const { json, password } = params;
  const s: any = web3.eth.accounts.decrypt(json, password);
  return s.privateKey;
};
export interface EncryptMnemonicParams {
  //  The mnemonic to encrypt
  mnemonic: string;
  //The password used for encryption
  password: string;
}
// Encrypt the mnemonic into keyStore and store it
export const encryptMnemonic = (params: EncryptMnemonicParams) => {
  try {
    const { mnemonic, password } = params;
    const mnemonicData = encryptPrivateKey({
      privateKey: web3.utils.toHex(mnemonic),
      password,
    });
    // localforage.setItem("mnemonic", mnemonicData);
    store.commit('mnemonic/UPDATE_MNEMONIC', mnemonicData)
  } catch (err) {
    console.error(err);
  }
};

// Unlock the mnemonic and return
// export const parseMnemonic = async (password: string): Promise<string> => {
//   try {
//     const json: any =await localforage.getItem("mnemonic") || "";
//     const s: any = web3.eth.accounts.decrypt(json, password);
//     const str = web3.utils.toUtf8(s.privateKey);
//     return Promise.resolve(str);
//   } catch (err) {
//     console.error(err);
//     Toast(i18n.global.t("wallet.wrongpassword"));
//     return Promise.reject(err);
//   }
// };
export const parseMnemonic = async (password: string, json: any): Promise<string> => {
  let cloneJson = JSON.parse(JSON.stringify(json), json)
  try {
    // @ts-ignore
    const s: any = web3.eth.accounts.decrypt(cloneJson, password);
    const str = web3.utils.toUtf8(s.privateKey);
    return str;
  } catch (err) {
    Toast(i18n.global.t("wallet.wrongpassword"));
    return Promise.reject(err);
  }
};

