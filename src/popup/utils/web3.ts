import { Toast } from "vant";
import Web3 from "web3";
export const web3 = new Web3(Web3.givenProvider);
import { BlockHeader, Block } from "web3-eth"; // ex. package types
import i18n from "@/popup/language/index";
import localforage from 'localforage';


export const connectWeb3Wallet = (privateKey: string) => {};
console.warn(Web3.givenProvider);
// web3.eth.getAccounts((err, res) => {
//     if(!res.length) {
//         Toast('请先创建账户')
//     }
// });

// 通过私钥创建账户
// const acc = web3.eth.accounts.privateKeyToAccount('2a829e79a99575f5025404e558b30c3119012c0eca71c7b2764426cb8779bf5e');
// // debugger
// console.log('wallet', web3.eth.accounts.wallet)

export interface DecryptPrivateKeyPraams {
  json: any;
  password: string;
}
export interface EncryptPrivateKeyParams {
  //  要加密的私钥
  privateKey: string;
  // 用于加密的密码
  password: string;
}
// 将私钥加密变换为 keystore v3 标准格式。
export const encryptPrivateKey = (params: EncryptPrivateKeyParams) => {
  const { privateKey, password } = params;
  return web3.eth.accounts.encrypt(privateKey, password);
};

// 根据pwd keyStore 解锁 私钥
export const decryptPrivateKey = (params: DecryptPrivateKeyPraams) => {
  const { json, password } = params;
  const s: any = web3.eth.accounts.decrypt(json, password);
  return s.privateKey;
};
export interface EncryptMnemonicParams {
  //  要加密的助记词
  mnemonic: string;
  // 用于加密的密码
  password: string;
}
// 加密助记词成keyStore并存储
export const encryptMnemonic = (params: EncryptMnemonicParams) => {
  try {
    const { mnemonic, password } = params;
    const mnemonicData = encryptPrivateKey({
      privateKey: web3.utils.toHex(mnemonic),
      password,
    });
    localforage.setItem("mnemonic", mnemonicData);
  } catch (err) {
    console.error(err);
  }
};

// 解锁助记词并返回
export const parseMnemonic = async (password: string): Promise<string> => {
  try {
    const json: any =await localforage.getItem("mnemonic") || "";
    const s: any = web3.eth.accounts.decrypt(json, password);
    const str = web3.utils.toUtf8(s.privateKey);
    return Promise.resolve(str);
  } catch (err) {
    console.error(err);
    Toast(i18n.global.t("wallet.wrongpassword"));
    return Promise.reject(err);
  }
};
