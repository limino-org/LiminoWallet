
import { VUE_APP_NODE_ENV } from "@/popup/enum/env";
import { guid } from "../utils";
import { getRandomColor } from "..";
import store from "@/popup/store";
const bitcore = require("bitcore-lib");
const { Networks } = bitcore;
export const isProduct = VUE_APP_NODE_ENV === 'production' ? true : false;
console.log('Networks', Networks)
const { regtest, testnet, mainnet } = Networks

const networks = [
    {
        label: 'Mainnet',
        color: getRandomColor(),
        isMain: true,
        select: true,
        value: 'mainnet',
        id: guid(),
        URL:'https://api.bitcore.io/api/BTC/mainnet',
        browser:'https://api.bitcore.io/api/BTC/mainnet',
        type: 'BTC',
        tokens:{}
    },
    {
        label: 'Testnet',
        color:getRandomColor(),
        isMain: false,
        value: 'testnet',
        id: guid(),
        URL:'https://api.bitcore.io/api/BTC/testnet',
        browser:'https://api.bitcore.io/api/BTC/testnet',
        type: 'BTC',
        tokens:{},
        select: false,


    },
    {
        label: 'Regtest',
        color:getRandomColor(),
        isMain: false,
        value: 'regtest',
        id: guid(),
        URL:'http://192.168.1.237:8888/api/BTC/regtest',
        browser:'http://192.168.1.237:8888/api/BTC/regtest',
        type: 'BTC',
        tokens:{},
        select: false,


    },
]

export const btcNetworks = isProduct ? networks.filter(item => item.value != 'regtest') : networks


export const getBTCNetwork = () => {
   const name =  store.state.account.currentNetwork.value
   return Networks[name || 'mainnet']
}

// Get fee url
export const gasFeeUrl = 'https://bitcoinfees.earn.com/api/v1/fees/recommended'