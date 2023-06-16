
import { ethers } from 'ethers';
import { useStore } from 'vuex';
import i18n from "@/popup/language/index";
console.warn('ethers', ethers)
// @ts-ignore
window.ethers = ethers
/**
 * BIP44 Path
 * m / purpose' / coin' / account' / change / address_index
 * m Is fixed, and the purpose is also fixed. The value is 44 (or 0x8000002c)
 * This represents currency, 0 represents bitcoin, 1 represents bitcoin test chain, and 60 represents the complete currency list address of Ethereum：https://github.com/satoshilabs/slips/blob/master/slip-0044.md
 * Account Represents the account index of this currency, starting from 0
 * change Constant 0 is used externally (collection address) and constant 1 is used internally (also known as change address). External addresses used to be visible outside the wallet (for example, to receive payments). The internal chain is used for addresses that are not visible outside the wallet and for returning transaction changes. (so 0 is generally used)
 * address_index This is the address index. Starting from 0, it represents the number of addresses generated. The official suggestion is the address under each account_ Index no more than 20
 */
export function getPath(n: string = '0'): string {
    return `m/44'/60'/0'/0/${n}`
}
// Generate random Wallet
export function createRandomWallet() {
    return ethers.Wallet.createRandom()
}

export interface ParsekeystoreParams {
    // Wallet instance
    wallet: any
    // password
    password: string
    // Callback for deriving progress
    callback?: Function
}
// Generate keystore JSON file by password
export function parsekeystore(opt: ParsekeystoreParams): Promise<Object> {
    const { callback, password, wallet } = opt
    return new Promise((resolve, reject) => {
        function call(progress: number) {
            const p: number = progress * 100
            callback ? callback(p) : ''
        }
        let encryptPromise = wallet.encrypt(password, call);
        encryptPromise.then((json: string) => {
            const data: Object = json || ''
            resolve(data)
        }).catch((err: any) => reject(err));
    })
}


export interface CreateWalletByJsonParams {
    json: string
    password: string
}
// Create a wallet instance through the JSON file of the password keystore
export function createWalletByJson(params: CreateWalletByJsonParams): Promise<Object> {
    const { password, json }: any = params
    if(!password || !json){
        return Promise.reject()
    }
    return ethers.Wallet.fromEncryptedJson(JSON.stringify(json), password)
}



export interface CreateWalletByMnemonicParams {
    phrase: string
    pathIndex: string
    path?: string
}
// Create wallet by mnemonic
export function createWalletByMnemonic(params: CreateWalletByMnemonicParams) {
    const { phrase, pathIndex } = params
    let path: string = ''
    if (pathIndex != '-1') {
        path = getPath(pathIndex);
    }
    console.warn('phrase', phrase, pathIndex)

    // Creating wallets with mnemonics
    try {
        return Promise.resolve(ethers.Wallet.fromMnemonic(phrase, path))
    } catch (err) {
        console.error(err)
        return Promise.reject(err)
    }
}
// export function createWalletByMnemonic(params: CreateWalletByMnemonicParams) {
//     const { phrase, pathIndex } = params
//     let path: string = ''
//     if (pathIndex != '-1') {
//         path = getPath(pathIndex);
//     }
//     // Create a wallet with mnemonics
//     try {
//         return Promise.resolve(ethers.Wallet.fromMnemonic(phrase, path))
//     } catch (err) {
//         console.error(err)
//         return Promise.reject(err)
//     }
// }

export interface PrivateKeyParams {
    privatekey: string
}
// Import account via private key
export function ImportPrivateKey(params: PrivateKeyParams) {
    const { privatekey } = params
    // Judge whether it is a 66 bit hash string
    if(!privatekey){
        return Promise.reject({reason:i18n.global.t("import.empty")})
    }
    if(privatekey && privatekey.length < 64){
        return Promise.reject({reason:i18n.global.t("import.wronglength")})
    }
    const startWord = privatekey.substring(0,2)
    let newPrivadteKey = ''
    if(privatekey && startWord == '0x'){
        newPrivadteKey = privatekey
    } else {
        newPrivadteKey = `0x${privatekey}`
    }
    try {
        const provider = ethers.getDefaultProvider();
        const wallet = new ethers.Wallet(newPrivadteKey, provider)
        return wallet;
    } catch (err) {
        return Promise.reject(err)
    }
}



/**
 * Convert the string to be signed into hash data
 * @param {string} message
 * @returns
 */
 export function hashMessage(message: any) {
    const messagePrefix = '\x19Ethereum Signed Message:\n'
    if (typeof message === 'string') {
      message = ethers.utils.toUtf8Bytes(message)
    }
    return ethers.utils.keccak256(
      ethers.utils.concat([ethers.utils.toUtf8Bytes(messagePrefix), ethers.utils.toUtf8Bytes(String(message.length)), message])
    )
  }