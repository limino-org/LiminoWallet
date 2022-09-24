
import { ethers as Ethers } from 'ethers';
import Localforage from 'localforage';
import Cookie from 'js-cookie'

export const Cookies = Cookie
export const ethers = Ethers

import Web3 from "web3";
export const web3 = new Web3(Web3.givenProvider);

export function createWalletByJson(params){
    const { password, json } = params
    if(!password || !json){
        return Promise.reject()
    }
    return ethers.Wallet.fromEncryptedJson(JSON.stringify(json), password)
}

export const localforage = Localforage