
import { VUE_APP_NODE_ENV } from "@/popup/enum/env";
import { guid } from "../utils";
import { getRandomColor } from "..";
import store from "@/popup/store";
import localforage from "localforage";
const bitcore = require("bitcore-lib");
const { Networks } = bitcore;
export const isProduct = VUE_APP_NODE_ENV === 'production' ? true : false;
console.log('Networks', Networks)
const { regtest, testnet, mainnet } = Networks

// for(let i=0;i<10;i++){
//     console.log('id', guid())
// }

const networks = [
    {
        label: 'Mainnet',
        color: '#b15fab',
        isMain: true,
        select: true,
        value: 'mainnet',
        id: '96cd856d65ecdee9976ba5bb42465509',
        URL:'https://api.bitcore.io/api/BTC/mainnet',
        browser:'https://api.bitcore.io/api/BTC/mainnet',
        type: 'BTC',
        tokens:{}
    },
    {
        label: 'Testnet',
        color:'#80689e',
        isMain: false,
        value: 'testnet',
        id: 'dd3d3eccb63f8dcb27e2b51f0cfe1db5',
        URL:'https://api.bitcore.io/api/BTC/testnet',
        browser:'https://api.bitcore.io/api/BTC/testnet',
        type: 'BTC',
        tokens:{},
        select: false,


    },
    {
        label: 'Regtest',
        color:'#87c89d',
        isMain: false,
        value: 'regtest',
        id: '88f8b8116d422dd425b0166b0a3dcdd4',
        URL:'http://192.168.1.237:8888/api/BTC/regtest',
        browser:'http://192.168.1.237:8888/api/BTC/regtest',
        type: 'BTC',
        tokens:{},
        select: false,


    },
]

export const btcNetworks = isProduct ? networks.filter(item => item.value != 'regtest') : networks


export const getBTCNetwork = async() => {
   const local: any = localforage.createInstance({
       name: 'localforage',
       storeName: 'keyvaluepairs'
   })
   const vuex = await local.getItem('vuex')
   const currentNetwork = vuex.account.currentNetwork
   const name =  currentNetwork.value || 'mainnet'
   return Networks[name || 'mainnet']
}

// Get fee url
export const gasFeeUrl = 'https://bitcoinfees.earn.com/api/v1/fees/recommended'