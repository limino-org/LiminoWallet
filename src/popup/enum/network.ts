// Enumeration of network data

import { TransactionData } from '@/popup/store/modules/index'
import { Token } from '@/popup/utils/token'
import { guid } from '@/popup/utils/index'
import i18n from "@/popup/language/index";
import { TransactionReceipt } from '@/popup/store/modules/account';
import { VUE_APP_NODE_WORM_URL } from './env';
const URL =  VUE_APP_NODE_WORM_URL
export const netWorklist: Array<NetWorkData> = [
    { color:'rgb(14, 126, 33)', label: "Wormholes", select: false ,URL, chainId: 51888, currencySymbol: 'ERB', browser:'https://www.wormholesscan.com',tokens:{},id: 'wormholes-network-1', isMain: true  },
    // {color:'rgb(3, 125, 214)', label: 'homestead', select: false,URL:'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', chainId: 1, currencySymbol: 'ETH', browser:'https://etherscan.io',transactionList: {},tokens:{} },
    // {color:'rgb(80, 120, 8)', label: 'rinkeby', select: false,URL:'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', chainId: 4, currencySymbol: 'ETH', browser:'https://rinkeby.etherscan.io',transactionList:{},tokens:{},id:guid()   },
    // { color:'rgb(123, 72, 41)', label: 'Ropsten', select: false,URL:'https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', chainId: 3, currencySymbol: 'ETH', browser:'https://ropsten.etherscan.io',transactionList:{},tokens:{},id: guid()   },
    // {color:'rgb(54, 236, 173)', label: 'goerli', select: false ,URL:'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', chainId: 5, currencySymbol: 'ETH', browser:'https://goerli.etherscan.io',transactionList:{} ,tokens:{} },
]

export interface NetWorkData {
    value?: string
    // Network name
    label: string
    select: boolean
    // RPC URL
    URL: string
    // chainId
    chainId: number
    // currencySymbol
    currencySymbol: String
    // browser
    browser: string
    color: string
    // List of tokens
    tokens: TokenList
    // unique identifier
    id: string,
    isMain?: boolean
}

export type TokenList = {
    [key:string]: Array<Token>
}
export type TransactionList = {
    [key:string]: Array<TransactionReceipt>
}

export interface TransactionRecord {
    address: Array<TransactionData>
}