//@ts-nocheck
import { Toast, GridItem, showLoadingToast, showNotify, showToast } from "vant";
import { ethers, utils } from "ethers";
import storeObj from '@/popup/store/index'
import { useBroadCast } from '@/popup/utils/broadCost'
import { getConverAmount, getInput } from "./txList";
import { guid } from '@/popup/utils/utils';
import useBTC from '@/popup/utils/btc/index'
import { btcNetworks, getBTCNetwork } from "@/popup/utils/btc/config";
const { handleUpdate } = useBroadCast()
import eventBus from "@/popup/utils/bus";
import { BTCWallet } from '@/popup/utils/btc/BTCWallet'
import storeDBIns, { addRecentList, getDB, getNetworkList, getPenddingList, getTxList, updateNetWork } from '@/popup/store/db'
console.log('storeDBIns', storeDBIns)
console.log('BTCWallet', BTCWallet)
// @ts-ignore
window.utils = utils;
import {
  createWalletByMnemonic,
  createWalletByJson,
  CreateWalletByJsonParams,
  ImportPrivateKey,
  CreateWalletByMnemonicParams,
  createRandomWallet,
} from "@/popup/utils/ether";
import { IconData, getRandomIcon } from "@/popup/utils/index";
import { toRaw } from "vue";
import { TransactionData, TransactionParams } from "../index";
import { ETH, Token } from "@/popup/utils/token";
import { checkAuth, getAccountAddr, getCreator, getPeriodById } from "@/popup/http/modules/common";
import { useStore } from "vuex";
import {
  NetWorkData,
  netWorklist,
} from "@/popup/enum/network";
import { setCookies, getCookies } from "@/popup/utils/jsCookie";
import router from "@/popup/router";
import { getQuery, toHex, getURLPath } from "@/popup/utils/utils";
import i18n from "@/popup/language/index";
const erc20Abi: any = require("@/popup/assets/json/erc20Abi.json");
import {
  encryptPrivateKey,
  EncryptPrivateKeyParams,
  encryptMnemonic,
  parseMnemonic,
  decryptPrivateKey,
  web3,
} from "@/popup/utils/web3";
import { eventHandler } from "@/popup/hooks/useEvent";
import BigNumber from "bignumber.js";
import store from "@/popup/store";
import { getContractAddress } from "@/popup/http/modules/common";
import { sendBackground } from "@/popup/utils/sendBackground";
import localforage from "localforage";
import { Wallet, BaseProvider } from "ethers";
import { Networks, PrivateKey } from "bitcore-lib";
import { importAddress } from "@/popup/utils/btc/rpc";
import { coinTypes } from "@/popup/enum/coinType";
import { modifNetWork } from "@/popup/store/db";

type RecentData = {
  BTC: Array<any>
  ETH: Array<any>
}

type NetworkCointype = {
  BTC: Array<any>
  ETH: Array<NetWorkData>;
}
export interface State {
  coinType: CoinType
  // Mnemonic words
  mnemonic: Mnemonic;
  ethNetwork: Object;

  // route
  path: string;
  wallet: any;
  accountList: Array<any>;
  currentNetwork: NetWorkData;
  netWorkList: Array<NetWorkData>;
  networkListCoinType:NetworkCointype,
  keyStore: Object;
  accountInfo: AccountInfo;
  chainAccountInfo: any;
  // Status of opening an exchange
  exchangeStatus: ExchangeStatus;
  contacts: Array<ContactInfo>;
  tranactionModel: boolean;
  tranactionList: Array<any>;
  // recent contacts
  recentList: Array<any>;
  recentlistCoinType: RecentData
  contractAddress: string
  firstTime: Boolean,
  exchangeGuidance: boolean
  exchangeServer: boolean;
  exchangeTotalProfit: number
  minerTotalProfit: number
  netStatus: NetStatus
  creatorStatus: Object | null

}
export type ContactInfo = {
  address: string;
  memo?: string;
  name: string;
  id: string;
  date?: number
  icon?: IconData
};
export type ExchangeStatus = {
  status: number;
  exchanger_flag: boolean;
};
export interface AddressBalance {
  address: string;
  balance: string;
}
export enum TransactionSendStatus {
  pendding = "pendding",
  success = 'success',
}
export interface Mnemonic {
  path: string;
  phrase?: string;
  pathIndex?: string;
}

export interface AccountInfo {
  address: string;
  // Token balance
  amount: string;
  currency: string;
  // Converted to USD balance
  transformAmount: number;
  name: string;
  // Account Icon
  accountIcon: string;
  balance: string;
  // Transactions
  transactionRecord: Array<TransactionData>;
  token: Array<any>;
  keyStore: string;
  imported?: boolean;
}
// Ordinary transaction params

export interface SendTransactionParams {
  value: string;
  to: string;
  gasPrice: string;
  gasLimit: number;
  data?: string
  transitionType?: string
  nft_address?: string
  checkTxQueue?: boolean
  nonce?: number
  maxFeePerGas? :string
  maxPriorityFeePerGas? :string
  type? :string
  

}

// Token transaction params

export interface SendTokenParams {
  address: string;
  amount: any;
  gasPrice: string;
  gasLimit: number;
  to: string;
  call?: Function;
}

export interface SendTokenParams {
  address: string;
  amount: any;
  gasPrice: string;
  gasLimit: number;
  to: string;
  checkTxQueue?: boolean
  nonce?: number
}

export interface AddAccountParams {
  keyStore: {
    [key: string]: any;
  };
  mnemonic: Mnemonic;
  address: string;
  imported: boolean;
}
export enum NetStatus {
  pendding = "pendding",
  success = "success",
  fail = "fail"
}
export interface RandomWallet {
  password: string;
  mnemonic: CreateWalletByMnemonicParams;
}
type CurrentAccountParams = {
  address: string;
  amount: string;
};
export type ConnectWalletByPwdAddress = {
  address: string;
  password: string;
};

export type SetAccountNameParams = {
  address: string;
  name: string;
};

export type UpdateKeyStoreByAddressParams = {
  json: string;
  address: string;
};

export enum CoinTypeName {
  ETH = 'ETH',
  BTC = 'BTC',
}

export interface CoinType {
  name: CoinTypeName,
  color: string,
  value: number,
  networkList?: Array<[]>
}


// Transactions
export type TransactionReceipt = {
  network: NetWorkData,
  // Transaction type is used for list / detail display
  txType: string;
  // Transaction type
  type: number;
  blockNumber: any,
  // state
  status: number;
  // date
  date: Date;
  // sender
  from: string;
  // recipient
  to: string;
  // nonce
  nonce: number;
  // Transaction amount
  value: string;
  // gas 
  gasUsed: BigNumber;
  // hash
  hash: string;
  // gas price
  effectiveGasPrice: BigNumber;
  tokenAddress?: string,
  // transition type
  transitionType?: string
  // nft_address
  nft_address?: string
  //  convert amount
  convertAmount?: string
};

let waitTime = null;

export let wallet: any = null;
export let provider: any = null

export const  getProvider =async () => {
  const { dispatch } = storeObj;
  const pro = await dispatch('account/getProvider')
  return pro
}
export const getWallet = () => {
  if (!wallet || !wallet.provider || wallet.address.toUpperCase() != store.state.account.accountInfo.address.toUpperCase()) {
    const { dispatch } = storeObj;
    const w = dispatch("account/getWallet");
    return w;
  }
  return Promise.resolve(wallet);
};
// calc gasFee
export const getGasFee = async (tx: any) => {
  try {
    const wall = await getWallet()
    const gasPrice = await wall.provider.getGasPrice()
    const gasLimit = await wall.estimateGas(tx)
    const limitStr = ethers.utils.formatEther(gasLimit)
    const priceStr = ethers.utils.formatUnits(gasPrice, 'wei')
    //debugger
    const gasFee = new BigNumber(limitStr).multipliedBy(priceStr).toFixed(9)
    return gasFee
  } catch (err) {
    console.error(err)
    return Promise.reject(err)
  }
}
// Clear the current wallet instance
export const clearWallet = () => {
  wallet = null;
};

export default {
  state: {
    // Default currency
    coinType: {
      name: 'ETH',
      color:'#037CD6',
      value: 0,
      netWorklist: []
    },
    // Mnemonic words
    mnemonic: {
      path: "",
      phrase: "",
    },
    // Online account data
    chainAccountInfo: null,
    // Account list
    accountList: [],
    // Network list
    netWorkList: netWorklist.map((item) => item),
    netWorkCoinType:{
      BTC: btcNetworks.map((item) => item),
      ETH: netWorklist.map((item) => item)
    },
    // Instances of the currently selected network
    currentNetwork: { ...netWorklist[0] },
    ethNetwork: {
      chainId: 51888
    },
    // Of the current wallet instance keyStore
    keyStore: {},
    // Current account data
    accountInfo: {
      address: "",
      // Token balance
      amount: 0,
      currency: "USD",
      // Converted to USD balance
      transformAmount: 0,
      name: "",
      transactionRecord: [],
      token: [],
    },
    
    // recent contacts
    recentlistCoinType: {
      BTC:[],
      ETH:[]
    },
    recentList: [],
    // Status of opening an exchange status 2 the second successful exchange_ Flag true first success
    exchangeStatus: {
      status: 0,
      exchanger_flag: false,
    },
    // Address list
    contacts: [],
    // Transaction progress Popup
    tranactionModel: false,
    // Current transaction queue
    tranactionList: [],
    // The smart contract address
    contractAddress: '',
    // The first time an exchange was opened
    firstTime: true,
    exchangeGuidance: false,
    exchangeServer: false,
    // miner total profit
    minerTotalProfit: 4856544,
    // exchange total profit
    exchangeTotalProfit: 2522880,
    creatorStatus: null
  },
  getters: {
    // Token of current account
    accountTokens(state: State) {
      const account = state.accountInfo;
      const address = account.address.toUpperCase();
      return state.currentNetwork.tokens[address] || [];
    },
    // Whether to open the exchange
    hasExchange(state: State) {
      if(state.coinType.value != 0) {
        return false
      }
      if (!state.exchangeStatus) {
        return false
      }
      return state.exchangeStatus.exchanger_flag == true ? true : false;
    },
    // Top transaction of current transaction queue
    transactionPendingData(state: State) {
      const list = state.tranactionList;
      return list.length ? list[0] : {};
    },
    // Current transaction pop-up status
    tranactionModel(state: State) {
      return state.tranactionModel
    },
  },
  mutations: {
    CLEAR_NETWORKSCOINTYPE(state: State) {
      state.netWorkCoinType = {}
    },
    UPDATE_COINTYPE(state: State, type: CoinType) {
      state.coinType = type
    },
    UPDATE_CREATORSTATUS(state: State, val: any) {
      state.creatorStatus = val
    },
    UPDATE_ETHNETWORK(state: State, val: any) {
      state.ethNetwork = val
      if (val && val.chainId) {
        state.currentNetwork.chainId = val.chainId
        state.netWorkList.forEach(item => {
          if (item.id.toUpperCase() === state.currentNetwork.id.toUpperCase()) {
            item.chainId = val.chainId
          }
        })
      }
    },
    // Updating the Network Status
    UPDATE_NETSTATUS(state: State, status: NetStatus) {
      state.netStatus = status
    },
    UPDATE_EXCHANGEGUIDANCE(state: State, value: boolean) {
      state.exchangeGuidance = value
    },
    UPDATE_EXCHANGESERVER(state: State, value: boolean) {
      state.exchangeServer = value
    },
    // Update mnemonic
    UPDATE_MNEMONIC(state: State, value: Mnemonic) {
      const { path, pathIndex } = value;
      const data = { path, pathIndex };
      state.mnemonic = data;
      handleUpdate()
    },
    // Update Wallet
    UPDATE_WALLET(state: State, value: any) {
      console.warn('wallet', value)
      wallet = value;
      // if (wallet.provider) {
      //   sendBackground({ method: 'update-wallet' })
      // }
    },
    // New account
    ADD_ACCOUNT(state: State, value: Array<Object>) {
      state.accountList = value;
    },
    // Update URL of wormholes network
    // Update wormholes URL
    UPDATE_WORMHOLES_URL(state: State, { URL, browser, chainId }: any) {
      let flag = false
      if (state.currentNetwork.isMain) {
        if (state.currentNetwork.URL != URL || state.currentNetwork.browser != browser) {
          flag = true
        }
        state.currentNetwork.URL = URL;
        state.currentNetwork.browser = browser;
        state.currentNetwork.id = 'wormholes-network-1'
      }
      state.netWorkList.forEach(item => {
        if (item.isMain) {
          if (item.URL != URL || item.browser != browser) {
            flag = true
          }
          item.URL = URL;
          item.browser = browser;
          item.id = 'wormholes-network-1'
        }
      })
      if (flag) {
        showLoadingToast({
          message: i18n.global.t('common.asyncData'),
          duration: 0
        })
        setTimeout(() => {
          if (flag) {
            location.reload()
          }
        }, 1000)
      }


    },
    // Update wormholes ChainId
    UPDATE_WORMHOLES_CHAINID(state: State, chainId: number) {
      if (state.currentNetwork.isMain) {
        state.currentNetwork.chainId = chainId
      }
      state.netWorkList.forEach(item => {
        if (item.isMain) {
          item.chainId = chainId
        }
      })
    },

    CLEAR_NETWORK(state: State) {
      state.netWorkList = []
      state.networkListCoinType = {}
      handleUpdate()
    },
    // Update network links
    UPDATE_NETWORK(state: State, value: NetWorkData) {
      state.currentNetwork = value;
    },
    // Update network selection status
    UPDATE_NETWORKSTATUS(state: State, value: NetWorkData) {
      state.netWorkList = state.netWorkList.filter((item) => {
        if (item.id === value.id) {
          item.select = true;
        } else {
          item.select = false;
        }
        return item;
      });
    },
    // Update the keystore of the current Wallet
    UPDATE_KEYSTORE(state: State, value: Object) {
      state.keyStore = value;
      handleUpdate()
    },
    // Update the keystore of an address
    UPDATE_KEYSTORE_BYADDRESS(
      state: State,
      params: UpdateKeyStoreByAddressParams
    ) {
      const { json, address } = params;
      state.accountList.forEach((item: AccountInfo) => {
        if (item.address.toUpperCase() == address.toUpperCase()) {
          item.keyStore = json;
        }
      });

      if (state.accountInfo.address.toUpperCase() == address.toUpperCase()) {
        state.accountInfo.keyStore = json;
      }
      handleUpdate()
    },
    // Update account information
    UPDATE_ACCOUNTINFO(state: State, value: AccountInfo) {
      state.accountInfo = value;
      state.accountList.forEach(item => {
        if (item.address.toUpperCase() == value.address.toUpperCase()) {
          item = value
        }
      })
    },
    // Update balance
    UPDATE_BALANCE(state: State, balance: string) {
      const address = state.accountInfo.address.toUpperCase();
      const accountList = toRaw(state.accountList);
      const accountInfo: any = state.accountInfo;
      console.log('update1', accountInfo.address.toUpperCase(), balance)

      if (accountInfo.address.toUpperCase() == address) {
        accountInfo.amount = balance;
        accountInfo.token.forEach((item: any) => {
          item.balance = balance;
        });
      }
      accountList.forEach((item: AccountInfo) => {
        if (item.address.toUpperCase() == address) {
          item.amount = balance;
          item.token.forEach((item: any) => {
            item.balance = balance;
          });
        }
      });
      state.accountList = accountList;
      state.accountInfo = accountInfo;
    },
    // Update balance of all accounts
    UPDATE_ALLACCOUNT(state: State, allBalance: any) {
      const accountList = state.accountList;
      const accountInfo: AccountInfo = state.accountInfo;
      Object.keys(allBalance).forEach((key: string) => {
        accountList.forEach((item: any) => {
          let amount = '0'
          if(state.coinType.value == 0){
            amount = ethers.utils.formatEther(allBalance[key]);
          }
          if(state.coinType.value == 1) {
            amount = new BigNumber(allBalance[key]).div(100000000).toString()
          }
          if (item.address.toUpperCase() == key.toUpperCase()) {
            item.amount = amount;
            item.token.forEach((item: any) => {
              item.balance = amount;
            });
          }
          if (accountInfo.address.toUpperCase() == key.toUpperCase()) {
            accountInfo.amount = amount;
            accountInfo.token.forEach((child: any) => {
              child.balance = amount;
            });
          }
        });
      });
      state.accountList = accountList;
      state.accountInfo = accountInfo;
    },
    // Reset accountlist
    RESET_ACCOUNTLIST(state: State) {
      const accountList = state.accountList;
      accountList.forEach((item: any) => {
        item.select = false;
      });
      state.accountList = accountList;
    },
    // Add network to list
    PUSH_NETWORK(state: State, network: NetWorkData) {
      // state.netWorkList.push(network);
      state.networkListCoinType[state.coinType.name].push(network)
      handleUpdate()
    },
    // Update data on the chain
    UPDATE_CHAINACCOUNTINFO(state: State, val: any) {
      state.chainAccountInfo = val;
    },
    // Update whether to open an exchange
    UPDATE_EXCHANGERSTATUS(state: State, val: ExchangeStatus) {
      state.exchangeStatus = val;
    },
    // Add token for current account address
    ADD_ADDRESS(state: State, VAL: Token) { },
    // Update an account name
    UPDATE_ACCOUNTNAME(state: State, opt: SetAccountNameParams) {
      const add = opt.address.toUpperCase()
      const { name } = opt
      let acc = null
      state.accountList.forEach((item: any) => {
        if (item.address.toUpperCase() == add) {
          item.name = name;
          acc = item
        }
      });
      if (state.accountInfo.address.toUpperCase() == add && acc) {
        state.accountInfo = { ...acc }
      }
      handleUpdate()
    },

    CLEAR_CONTACT(state: State){
      state.contacts = []
    },
    // Close the transaction queue pending pop-up window
    CLOSE_TRANACTIONMODAL(state: State) {
      state.tranactionModel = false;
    },
    // Update contractAddress
    UPDATE_CONTRACTADDRESS(state: State, ERBPay: string) {
      state.contractAddress = ERBPay
    },
    UPDATE_FIRSTTIME(state: State, bool: Boolean) {
      state.firstTime = bool
    },
  },
  actions: {
    getProvider({ commit, dispatch, state }){
        const { URL } = state.currentNetwork;
      if(state.coinType.value == 0 && (!provider || !provider.connection || provider.connection.url.toUpperCase() != URL.toUpperCase())) {
        provider = ethers.getDefaultProvider(URL)
      }
      if(state.coinType.value == 1){
        provider = wallet ? wallet.provider : {}
      }
      return provider || {}
    },
    async getCreatorStatus({commit, state}, address: string) {
      if(state.coinType.value != 0){
        commit('UPDATE_CREATORSTATUS', null)
        return
      }
      try {
       const data = await getCreator(address)
       const res = await getAccountAddr(address)
       const provider = ethers.getDefaultProvider(state.currentNetwork.URL)
       const block = await provider.getBlockNumber()
       const weight = new BigNumber(block - data.lastNumber).multipliedBy(utils.formatEther(res.snftValue)).toString()
       const rewardEth = utils.formatEther(data.reward)
       const profitStr = utils.formatEther(data.profit)
       const stateData = {...data, account: res, weight, rewardEth, profitStr}
       commit('UPDATE_CREATORSTATUS', stateData)
      }catch(err) {
        commit('UPDATE_CREATORSTATUS', null)
      }
    },
    hasAccountByAddress({ commit, dispatch, state }: any, address: string) {
      const accountList = toRaw(state.accountList);
      const newAdd = address.toUpperCase();
      const acc = accountList.find(
        (item: any) => item.address.toUpperCase() == newAdd
      );
      return acc ? true : false;
    },
    // According to the current network status, the wallet status returns the wallet instance
    async getWallet({ commit, dispatch, state }: any) {
      try {
        const { accountInfo } = state;
        const { keyStore } = accountInfo;
        const password: string = await getCookies("password") || "";
        if (!password) {
          const query = getQuery();
   
          router.push({ name: "loginAccount-step1", query: { ...query, backUrl: getURLPath() } });
            // @ts-ignore
          return Promise.reject(i18n.global.t("common.withpassword"));
        }
        // Load wallet via password and keystore
        await dispatch("createWalletByJson", { password, json: keyStore });
        // Link current network provider
        wallet = await dispatch("getProviderWallet");
        commit("UPDATE_WALLET", wallet);
        sendBackground({ method: 'update-wallet' })
        return Promise.resolve(wallet);
      } catch (err) {
        // @ts-ignore
        // bg.wallet = null
        return Promise.reject(err);
      }
    },
    // Create random Wallet
    createRandomWallet({ commit, dispatch }: any, params: RandomWallet) {
      const wallet = createRandomWallet();
      commit("UPDATE_WALLET", wallet);
      return Promise.resolve(wallet);
    },
    // Create wallet from keystore mnemonic
    async createWallet(
      { commit, dispatch, state }: any,
      params: CreateWalletByMnemonicParams
    ) {
      try {
        wallet = await dispatch("createWalletByMnemonic", params);
        // if(state.coinType.value = 1) {
        //   wallet = new BTCWallet(wallet.privateKey, network)
        // }
        commit("UPDATE_MNEMONIC", params);
        return Promise.resolve(wallet);
      } catch (err) {
        return Promise.reject(err);
      }
    },
    // Create account
    async addAccount(
      { commit, state, dispatch }: any,
      { keyStore, mnemonic, address, imported }: AddAccountParams
    ) {
      let list = state.accountList;
      const len = list.length;
      const icon = getRandomIcon();
      let balance = '0.000000'
      const { path, pathIndex }: any = mnemonic;
      const account = {
        name: `Account${len + 1}`,
        keyStore,
        address,
        icon,
        transactionRecord: [],
        token: [{ ...ETH, balance }],
        mnemonic: { path, pathIndex },
        amount: balance,
        imported: imported ? true : false
      };
      if (len) {
        list.push(account);
      } else {
        // The first account is selected by default
        // account.select = true
        list = [account];
      }
      dispatch("getProviderWallet", keyStore);
      commit("UPDATE_ACCOUNTINFO", account);
      commit("ADD_ACCOUNT", list);
      dispatch("updateAccount");
      dispatch('updateBalance')
      return Promise.resolve()
    },
    // Creating wallets with mnemonics
    async createWalletByMnemonic(
      { commit, state }: any,
      params: CreateWalletByMnemonicParams
    ) {
      try {
        const { phrase, pathIndex } = params;
        wallet = await createWalletByMnemonic({ phrase, pathIndex });
        if(state.coinType.value == 1) {
          wallet = new BTCWallet(wallet.privateKey, await getBTCNetwork())
        }
        return Promise.resolve(wallet);
      } catch ({ reason }) {
        showToast(i18n.global.t("common.failedtoload"));
        return Promise.reject();
      }
    },
    // Modify the account name according to the account address
    setAccountName({ commit }: any, opt: SetAccountNameParams) {
      commit("UPDATE_ACCOUNTNAME", opt);
    },
    // Get the balance of the current Wallet
    async getBalance({ commit, state, dispatch }: any) {
      try {
        const provider = await getProvider()
        const balance = await provider.getBalance(state.accountInfo.address);
        const amount = ethers.utils.formatEther(balance);
        return Promise.resolve(amount);
      } catch (err) {
        return Promise.reject(err);
      }
    },
    // Delete account according to subscript
    deleteAccount({ commit, state }: any, idx: number) {
      state.accountList = state.accountList.filter(
        (item: any, i: number) => i != idx
      );
    },
    // Switch accounts
    async updateAccount({ commit, state, dispatch }: any) {
      const address = state.accountInfo.address;
      let provider = null
      let amount  = '0'
      if(state.coinType.value == 0) {
        provider = await getProvider()
      } 
      if(state.coinType.value == 1) {
        provider = wallet.provider
      }
      const balance = await provider.getBalance(address);
      if(state.coinType.value == 0) { 
        amount = ethers.utils.formatEther(balance);
      }
      if(state.coinType.value == 1) { 
        amount = new BigNumber(balance.balance).div(100000000).toString();
      }


      const accountList = toRaw(state.accountList);
      const {
        name,
        icon,
        transactionRecord,
        token,
        mnemonic: { path, pathIndex },
        keyStore,
      } = accountList.find(
        (item: any) => item.address.toUpperCase() == address.toUpperCase()
      );
      commit("UPDATE_ACCOUNTINFO", {
        amount,
        address,
        currency: "USD",
        transformAmount: 10200,
        name,
        icon,
        transactionRecord,
        token,
        mnemonic: { path, pathIndex },
        keyStore,
      });
      return Promise.resolve();
    },
    //Create wallet instance through password keystore
    async createWalletByJson(
      { commit, dispatch, state }: any,
      params: CreateWalletByJsonParams
    ) {
      try {
        let newwllet= null;
        console.warn('before init', params)
        newwllet = await createWalletByJson(params)
        console.warn('init ---', newwllet)
        const privateKey = newwllet.privateKey
        switch(state.coinType.value) {
          case 0:
            const { currentNetwork } = state;
            if(currentNetwork.type == 'ETH') {
              dispatch("setNetWork", currentNetwork);
            }
            console.warn('init ---0')

            break;
          case 1:
            newwllet = new BTCWallet(privateKey, await getBTCNetwork())
          break;
        }
        console.warn('init ---1', newwllet)
        return newwllet;
      } catch (err) {
        console.error('creat err', err)
        return Promise.reject(err);
      }
    },
    // Import account via private key
    // Import the account using the private key
    async importPrivateKey({ commit, state }: any, privatekey: string) {
      let newWallet = null
      try {
        if(state.coinType.value == 0) {
          const wa = await ImportPrivateKey({ privatekey });
          const { URL } = state.currentNetwork;
          // debugger
          let provider = ethers.getDefaultProvider(URL);
          newWallet = wa.connect(provider)
        }
        if(state.coinType.value == 1) {
         try {
          new PrivateKey(privatekey.startsWith('0x') ? privatekey.substr(2, privatekey.length) : privatekey, await getBTCNetwork())
          newWallet = new BTCWallet(privatekey, await getBTCNetwork())
          // importAddress(newWallet.publicKey, newWallet.address)
         }catch(err) {
          return Promise.reject({ reason: err.toString()});
         }
        }

        // During the import, check whether the address exists in the current account list. If the address exists, an exception is thrown and the import will not continue
        const { address } = newWallet;
        const { accountList } = state;
        const a = accountList.find(
          (item: any) => item.address.toUpperCase() == address.toUpperCase()
        );
        if (a) {
          return Promise.reject({ reason: i18n.global.t("common.existed"), address: a.address });
        } else {
          commit("UPDATE_WALLET", newWallet);
          return newWallet;
        }
      } catch (err) {
        console.error(err)
        return Promise.reject(err);
      }
    },
    // Set up network
    async setNetWork({ commit, state, dispatch }: any, net: NetWorkData) {
      console.warn('---aaa',net, state.currentNetwork)
      if(net.id == state.currentNetwork.id) {
        return Promise.resolve()
      }
      commit('UPDATE_NETWORK', net)
      const wallet = await dispatch("getProviderWallet");
      console.warn('setNetWork', wallet, state.coinType.value)
      // While setting up the network, update the linked network through the wallet instance
      if(state.coinType.value == 0) {
        const res =  wallet.provider ? await wallet.provider.getNetwork() : await dispatch('getProviderWallet').provider.getNetwork()
        commit('UPDATE_ETHNETWORK', res)
      } 
      if(state.coinType.value == 1) {
        // await dispatch('handleSwitchCoinType', state.coinType)
      }
      return Promise.resolve();
    },
    // Update for all accounts balance
    async updateAllBalance({ commit, state, dispatch }: any) {
      try {
        const accountList = state.accountList;
        const list: Array<string> = accountList.map(
          (item: AccountInfo) => item.address
        );
        console.warn('updateAllBalance')
        let delay = -100;
        const delayIncrement = 100
        const timeArr = []
        const asyncList = list.map((address) => {
          delay += delayIncrement
          return new Promise((resolve, reject) => {
            const t = setTimeout(resolve, delay)
            timeArr.push(t)
            return t
          })
          .then(() => {
           return dispatch("getBalanceByAddress", { address })
          })
        }
        );
        const data = await Promise.all(asyncList);
        timeArr.forEach(id => clearTimeout(id))
        const banList: any = {};
        list.forEach((address, index) => {
          banList[address] = data[index]

        });
        commit('UPDATE_NETSTATUS', NetStatus.success)
        commit("UPDATE_ALLACCOUNT", banList);
        if(state.coinType.value == 0) {
          dispatch("updateTokensBalances");
        }
        return Promise.resolve(banList);
      } catch (err) {
        commit('UPDATE_NETSTATUS', NetStatus.fail)
      }
      // return Promise.resolve([])
    },
    // Return the balance of the current address account
    async getBalanceByAddress({ commit, state, dispatch }: any, { address }: any) {
      if(state.coinType.value == 0){
        const provider = await getProvider()
        return provider.getBalance(address);
      }
      if(state.coinType.value == 1) {
        const newwallet = await getWallet()
        const balance = await newwallet.provider.getBalance(address)
        return balance.balance.toString();
      }
    },
    // Update balance in current account currency
    async updateBalance({ commit, state, dispatch }: any) {
      let provider = null
      switch(state.coinType.value){
        case 0:
          provider = await getProvider()
          break;
        case 1:
          wallet = await getWallet()
          provider = wallet.provider
          break;
      }

      try {
        if (provider) {
          const balance = await provider.getBalance(wallet.address || state.accountInfo.address);
          let amount = '0'
          if(state.coinType.value == 0) {
            amount = ethers.utils.formatEther(balance);
          }
          if(state.coinType.value == 1) {
            amount = new BigNumber(balance.balance).div(100000000).toString()
          }
          commit("UPDATE_BALANCE", amount);
          commit('UPDATE_NETSTATUS', NetStatus.success)
          return Promise.resolve(amount);
        }
      } catch (err) {
        commit('UPDATE_NETSTATUS', NetStatus.fail)
      }

    },
    // Link current network provider wallet instance
    async getProviderWallet({ commit, state, dispatch }: any, newJson: any) {
      const { URL } = state.currentNetwork;
      console.warn('----')

      if(state.coinType.value == 0 && wallet && wallet.provider && wallet.provider.connection && (wallet.provider.connection.url == URL) && wallet.address.toUpperCase() == state.accountInfo.address.toUpperCase()){
        return wallet
      }
      console.warn('----0')

      if(state.coinType.value == 1 && wallet && wallet.provider && wallet.address.toUpperCase() == state.accountInfo.address.toUpperCase() && state.currentNetwork.value == wallet.provider.network.name){
        return wallet
      }
      console.warn('----1')
      let newWallet = null
      const { accountInfo } = state;
      const { keyStore } = accountInfo;
      const json = newJson || toRaw(keyStore)
      const password: string = await getCookies("password") || "";
      try {
        switch(state.coinType.value){
          case 0:
            console.warn('----3')

            const provider = await getProvider()
            console.warn('----4')

            newWallet = await dispatch("createWalletByJson", { password, json });
            console.warn('----5', newWallet)

            newWallet = newWallet.connect(provider)
            const res = await newWallet.provider.getNetwork()
            console.warn('----6')

            commit('UPDATE_NETSTATUS', NetStatus.success)
            commit("UPDATE_WALLET", newWallet);
            break;
          case 1:
            // BTC
            const wall = await dispatch("createWalletByJson", { password, json });
            newWallet = new BTCWallet(wall.privateKey, await getBTCNetwork())
            console.warn('newWallet--- Btc', newWallet)
            const hei = await newWallet.provider.getHeight()
            commit("UPDATE_WALLET", newWallet);
            commit('UPDATE_NETSTATUS', NetStatus.success)
            break;
        }
        console.warn('newWallet ---', newWallet)
        return newWallet
      } catch (err: any) {
        console.error('init wallet err', err)
        showNotify({ type: 'danger', message: i18n.global.t('error.netErr'),duration: 5000, position: 'bottom' })
        commit('UPDATE_NETSTATUS', NetStatus.fail)
        return Promise.reject(err);
      }
    },
    // Whether there is card trading on the current exchange
    async hasPendingTransactions({ state, commit }: any) {
      const penddingList = await getPenddingList()
      return penddingList && penddingList.length ? true : false
    },
    async transaction(
      { state, commit, dispatch }: any,
      params: SendTransactionParams
    ) {
      const { to, value, gasPrice, gasLimit, data, transitionType, nft_address, checkTxQueue, nonce: sendNonce, type: newType, maxPriorityFeePerGas, maxFeePerGas, remarks } = { checkTxQueue: true, ...params };
      // Determine whether there are transactions in the current trading pool that have not returned transaction receipts, and if so, do not allow them to be sent
      console.warn('send...', params)
      if (checkTxQueue && await dispatch('hasPendingTransactions')) {
        return Promise.reject({ reason: i18n.global.t('common.sendTipPendding'), code: 500 })
      }
      try {
       
        // Update recent contacts
        addRecentList(to)
        // commit("PUSH_RECENTLIST", to);
        const newwallet = await getWallet();
        let sendData = null
        let btcTXHash = ''
        const { currentNetwork } = state
        if(state.coinType.value == 0) {
          const newData = data || ''
          let tx: any = {
            to,
            value: utils.parseEther(value && Number(value) ? value.toString() : '0')
          };
          if (Number(gasPrice)) {
            const bigPrice = new BigNumber(gasPrice)
            const gasp = Number(gasPrice) ? bigPrice.dividedBy(100000000).toFixed(12) : '0.0000000012';
            tx.gasPrice = ethers.utils.parseEther(gasp)
          }
          if (gasLimit) {
            tx.gasLimit = gasLimit
          }
          if (newData) {
            tx.data = newData
          }
          if (typeof sendNonce != undefined) {
            tx.nonce = sendNonce
          }
          // if(newType){
          //   tx.gasPrice = tx.gasPrice = ethers.utils.parseEther('0.000000053')
          // }
          if(maxPriorityFeePerGas){
            tx.maxPriorityFeePerGas = maxPriorityFeePerGas
          }
          if(maxFeePerGas){
            tx.maxFeePerGas = maxFeePerGas
          }
          sendData = await newwallet.sendTransaction(tx);
          const { from, gasLimit: newLimit, gasPrice: newPrice, hash, nonce, to: toAddr, type, value: newVal } = sendData;
          await PUSH_TXQUEUE({
            hash,
            from,
            gasLimit: gasLimit || utils.formatUnits(newLimit, 'wei'),
            gasPrice,
            nonce,
            to: toAddr,
            type,
            value: newVal,
            transitionType: transitionType || null,
            txType: TransactionTypes.default,
            network: clone(currentNetwork),
            data: newData,
            sendStatus: TransactionSendStatus.pendding,
            sendData: clone(sendData),
            nft_address: nft_address || ''
          })
        }
        if(state.coinType.value == 1){
          const sendVal = new BigNumber(value).multipliedBy(100000000).toNumber()
          const fee = Number(gasPrice)
          btcTXHash = await newwallet.sendTransaction(to, sendVal, fee, remarks);
          sendData = {
            hash: btcTXHash,
            to,
            from: state.accountInfo.address,
            fee,
            value: sendVal,
            network: clone(currentNetwork),
            sendStatus: 'pendding'
          }
          await PUSH_BTCTXQUEUE(sendData)
 
        }
        // dispatch('waitTxQueueResponse')
        if(sendData) {
          sendData.wallet = newwallet
          return Promise.resolve(sendData)
        }
        return Promise.reject(sendData)
      } catch (err) {
        console.error(err)
        return Promise.reject(err)
      }
    },
    // Initiate token transaction
    async tokenTransaction(
      { state, commit, dispatch }: any,
      params: SendTokenParams
    ) {
      const { address: tokenAddress, amount, to, gasPrice, gasLimit, checkTxQueue, nonce: sendNonce } = params;
      // Determine whether there are transactions in the current trading pool that have not returned transaction receipts, and if so, do not allow them to be sent
      if (checkTxQueue && await dispatch('hasPendingTransactions')) {
        return Promise.reject({ reason: i18n.global.t('common.sendTipPendding'), code: 500 })
      }
      try {
        const { currentNetwork } = state
        // Update recent contacts
        // commit("PUSH_RECENTLIST", to);
        addRecentList(to)
        debugger
        // Get contract token instance object
        const { contractWithSigner, contract } = await dispatch(
          "connectConstract",
          tokenAddress
        );
        const amountWei = web3.utils.toWei((amount || 0) + '', 'ether')
        const gasp = Number(gasPrice) ? new BigNumber(gasPrice).dividedBy(1000000000).toFixed(12) : '0.0000000012';
        const transferParams: any = {
          gasLimit: gasLimit,
          gasPrice: ethers.utils.parseEther(gasp),
        };
        if (typeof sendNonce != undefined) {
          transferParams['nonce'] = sendNonce
        }
        const data = await contractWithSigner.transfer(to, amountWei, transferParams)
        const { from, gasLimit: newLimit, gasPrice: newPrice, hash, nonce, type, value: newVal, to: toAddr } = data;
        await PUSH_TXQUEUE({
          hash,
          from,
          gasLimit: gasLimit || utils.formatUnits(data.gasLimit, 'wei'),
          gasPrice,
          nonce,
          to: toAddr,
          type,
          value: newVal,
          transitionType: null,
          txType: TransactionTypes.default,
          network: clone(currentNetwork),
          data: '',
          sendStatus: TransactionSendStatus.pendding,
          sendData: clone(data),
          tokenAddress,
          amount,
          toAddress: to,
          cointype: state.coinType
        })
        data.wallet = wallet
        return data
      } catch (err) {
        return Promise.reject(err)
      }
    },
    // send data
    async sendTransaction({ commit, dispatch, state }: any, tx: any) {
      return new Promise(async (resolve, reject) => {
        const wallet = await getWallet();
        try {
         if(state.coinType.value == 0) {

          console.log('newtx', tx)
          const { to } = tx
          // Update recent contacts
          // commit("PUSH_RECENTLIST", to);
          addRecentList(to)
          const symbol = state.currentNetwork.currencySymbol
          const data = await wallet.sendTransaction(tx);
          const { from, gasLimit, gasPrice, hash, nonce, type, value } = data;
          PUSH_TXQUEUE({
            date: new Date(),
            hash,
            from,
            gasLimit,
            gasPrice,
            nonce,
            to,
            type,
            value,
            transitionType: null,
            network: clone(state.currentNetwork),
            txType: TransactionTypes.default,

          })

    
          const receipt = await wallet.provider.waitForTransaction(data.hash)
          dispatch('waitTxQueueResponse')
          // Update transaction queue
          
          resolve(receipt)
         }
         if(state.coinType.value == 1) {
          const data = await wallet.sendTransaction(tx);
          resolve(data)
         }
   
        } catch (err) {
          console.error(err)
        }
      })
    },

    // Load wallet with address and password
    async connectWalletByPwdAddress(
      { state, commit, dispatch }: any,
      params: ConnectWalletByPwdAddress
    ) {
      const { address, password } = params;
      const accountList = state.accountList;
      let accountInfo = null;
      accountList.forEach((item: AccountInfo) => {
        if (item.address.toUpperCase() == address.toUpperCase()) {
          accountInfo = { ...item };
        }
      });
      if (!accountInfo) {
        return Promise.reject(i18n.global.t("common.addressnotfound"));
      }
      const { keyStore } = accountInfo;
      try {
        const newWallet = createWalletByJson({ password, json: keyStore });
        return Promise.resolve(newWallet);
      } catch (err) {
        return Promise.reject(err);
      }
    },
    // Add token
    async addToken({ state, commit, dispatch }: any, val: any) {
      const wallet = await getWallet();
      const network = state.currentNetwork;
      // First, judge whether the current token exists in the current network and current address. If it does not exist, add it. If it does exist, an error will be reported
      const { tokenContractAddress, address } = val;
      const key = address.toUpperCase();
      const hasAddress = network.tokens[key] ? network.tokens[key].length : 0;
      if (hasAddress) {
        // Address whether the token list of the current account already has a modified token
        const newv = network.tokens[key].find(
          (item: any) =>
            item.tokenContractAddress.toUpperCase() ==
            tokenContractAddress.toUpperCase()
        );
        if (newv) {
          showToast(i18n.global.t("currencyList.addressalreadyexists"));
          // Already exists
          return Promise.reject(i18n.global.t("currencyList.addressalreadyexists"));
        }
      }
      try {
        const { contractWithSigner, contract } = await dispatch(
          "connectConstract",
          tokenContractAddress
        );
        const name = await contractWithSigner.name();
        const decimal = await contractWithSigner.decimals();
        const symbol = await contractWithSigner.symbol();
        const logoUrl = "eth.jpg";
        let balance = "0";
        try {
          balance = utils.formatEther(await contractWithSigner.balanceOf(wallet.address));
        } catch (err: any) {
          // Toast(i18n.global.t("currencyList.importerror"));
          return Promise.reject(i18n.global.t("currencyList.importerror"))
        }
        // Link contract
        if (hasAddress) {
          // Add if not
          const net = {
            symbol,
            logoUrl,
            name,
            precision: decimal,
            tokenContractAddress,
            balance: balance.toString(),
          }
          network.tokens[key].push(net);
          commit('UPDATE_NETWORK', network)
          await modifNetWork(network)
          return Promise.resolve();
        } else {
          // Current network current address has no token
          network.tokens[key] = [];
          const net = {
            symbol,
            logoUrl,
            name,
            precision: decimal,
            tokenContractAddress,
            balance: balance.toString(),
          }
          network.tokens[key].push(net);
          commit('UPDATE_NETWORK', network)
          await modifNetWork(network)
          return Promise.resolve();
        }
      } catch (err) {
        console.error('import err', err)
        return Promise.reject(i18n.global.t("currencyList.error"))
      }
    },
    // Link token contract
    async connectConstract(
      { state, commit, dispatch }: any,
      tokenContractAddress: string
    ) {
      try {
        const wallet = await getWallet();
        const contract = new ethers.Contract(
          tokenContractAddress,
          erc20Abi,
          wallet.provider
        );
        const contractWithSigner = contract.connect(wallet);
        return Promise.resolve({ contractWithSigner, contract });
      } catch (err) {
        console.error(err);
        return Promise.reject(err);
      }
    },
    // Get the status of whether to open an exchange
    async getExchangeStatus({ commit, state }: any, call: Function = () => { }) {
      const wallet = await getWallet();
      const { address } = wallet;
      return checkAuth(address).then((res: any) => {
        commit("UPDATE_EXCHANGERSTATUS", clone(res.data));
        call(res.data);
        return res.data;
      });
    },
    // Update current network, current address, current token list balance
    async updateTokensBalances({ commit, state, dispatch }: any) {
      // const wallet = await getWallet();
      const address = state.accountInfo.address.toUpperCase();
      const currentNetwork = state.currentNetwork;
      const tokens = currentNetwork.tokens[address];
      if (tokens && tokens.length) {
        const plist = tokens.map((item: any) =>
          dispatch("updateTokenBalance", item.tokenContractAddress)
        );
        Promise.all(plist).then((result) => {
          for (let i = 0; i < tokens.length; i++) {
            console.log('result[i]', result[i])
            // @ts-ignore
            tokens[i].balance = result[i];
          }
        });
      }
    },
    // Get the balance of a token
    async updateTokenBalance(
      { commit, state, dispatch }: any,
      tokenAddress: string
    ) {

      // Verification address
      if (!tokenAddress || !wallet || !wallet.provider) {
        return Promise.reject("Address cannot be empty!");
      }
      try {
        // const wallet = await getWallet();
        const provider = await getProvider()
        const contract = new ethers.Contract(
          tokenAddress,
          erc20Abi,
          provider
        );
        // const contractWithSigner = contract.connect(wallet);
        const amount = await contract.balanceOf(state.accountInfo.address)
        return Promise.resolve(utils.formatEther(amount));
      } catch (err) {
        return Promise.reject(err);
      }
    },
    // Encrypt the new keystore according to all new passwords
    async updateKeyStoreByPwd({ commit, state }: any, password: string) {
      if (!password) {
        showToast(i18n.global.t('createAccountpage.pwdRequired'));
        return Promise.reject();
      }
      const pwd = await getCookies("password");
      state.accountList.forEach(async (item: any) => {
        const { keyStore, address } = item;
        const privateKey = decryptPrivateKey({
          password: pwd,
          json: JSON.stringify(keyStore),
        });
        // Re encrypt private key
        const newStore = encryptPrivateKey({ privateKey, password });
        // Update account keystore
        commit("UPDATE_KEYSTORE_BYADDRESS", { json: newStore, address });
      });
      // Unlock mnemonic and return
      const mnemonic = await parseMnemonic(pwd, storeObj.state.mnemonic.keyStore);
      // Re encrypt mnemonics
      encryptMnemonic({ mnemonic, password });
      return Promise.resolve();
    },
    // Obtain total pledge amount
    async eth_getStaker({ commit, state }: any) {
      const wallet = await getWallet();
      const { currentNetwork } = state;
      return new Promise((resolve, reject) => {
        wallet.provider
          .send("eth_getStaker", [utils.hexlify(currentNetwork.chainId)])
          .then(({ Stakers }: any) => {
            let totalAmount: any = new BigNumber("0");
            if (!Stakers) {
              resolve(0);
              return;
            }
            Stakers.forEach((item: any) => {
              const { Balance } = item;
              const ethb = new BigNumber(Balance).div("1000000000000000000");
              totalAmount = ethb.plus(totalAmount);
            });
            console.log("totalAmount", totalAmount.toNumber());
            resolve(totalAmount.toNumber());
          });
      });
    },
    // Get the smart contract address
    async getContractAddress({ commit, state }: any) {
      try {
        const { ERBPay } = await getContractAddress()
        commit('UPDATE_CONTRACTADDRESS', ERBPay)
        return Promise.resolve(ERBPay)
      } catch (err) {
        return Promise.reject(err)
      }
    },
    //Determines whether the current hash has a transaction queue
    async checkHashHasQueue({ commit, state }, hash: string) {
      const list = await getPenddingList()
      let hasExits = false
      if(list && list.length) {
        hasExits = list.find((item) => item.hash.toUpperCase() === hash.toUpperCase())
      }
      return Promise.resolve(hasExits)
    },
    clearWaitTime(){
      clearTimeout(waitTime)
      waitTime = null
      if(wallet && wallet.provider) {
         wallet.provider.removeAllListeners()
      }
    },
    // The result of polling the transaction queue
    // The result of polling the transaction queue
    async waitTxQueueResponse({ commit, state, dispatch }: any, opt?: Object) {
      const _opt = {
        time: 60000,
        callback: (e: any) => { },
        ...opt
      }
      return new Promise((resolve, reject) => {
        sendBackground({method: 'waitTxQueueResponse', response:{code:'200',data: {}}}).then(res => {
          console.warn('waitTxQueueResponse', res)
          eventBus.emit('waitTxEnd', res)
          resolve(res)
        }).catch(err => {
          reject(err)
        })

      })

      // const { id } = state.currentNetwork
      // const from = state.accountInfo.address
      // let data1 = null
      // return new Promise((resolve, reject) => {
      //   waitTime = setTimeout(async () => {
      //     sendBackground({method: 'waitTxQueueResponse', response:{code:'200',data: {}}})

      //     const receiptList = []
      //     //  const newWallet = await getWallet()
      //     try {
      //       if(state.coinType.value == 0) {
      //         const list: any = await getPenddingList(from) || []
      //         console.warn('list--', list)
      //         const txQueue = list && list.length ? list : []
      //         if (!txQueue.length) {
      //           resolve(true)
      //         }
      //       for await (const iterator of txQueue) {
      //         let { hash, transitionType, nft_address, blockNumber, network, txType, txId, amount, isCancel, sendData, date, value, nonce } = iterator
      //         const txList: any = await getTxList(from)
      //         let hashArr = []
      //           const sameNonceTx = txList.find((item: any) => item.nonce === nonce)
      //           hashArr = !sameNonceTx ? [hash] : [hash, sameNonceTx.hash]
   
      //         console.warn('222', hashArr)
      //         if (_opt.time != null) {
      //           data1 = await waitForTransactions(hashArr, _opt.time)
      //           // data1 = await wallet.provider.waitForTransaction(hash, null, _opt.time);
      //         } else {
      //           data1 = await waitForTransactions(hashArr)
      //           // data1 = await wallet.provider.waitForTransaction(hash);

      //         }
      //         receiptList.push(data1)
      //         let convertAmount: any = ''
      //         if (transitionType && transitionType == '6') {
      //           const len = nft_address.length
      //           switch (len) {
      //             case 42:
      //               break;
      //             case 41:
      //               nft_address += '0'
      //               break;
      //             case 40:
      //               nft_address += '00'
      //               break;
      //             case 39:
      //               nft_address += '000'
      //               break;
      //           }
      //           const nftAccountInfo = await wallet.provider.send(
      //             "eth_getAccountInfo",
      //             [nft_address, web3.utils.toHex((data1.blockNumber - 1).toString())]
      //           );
      //           const { MergeLevel, MergeNumber } = nftAccountInfo
      //           //  @ts-ignore
      //           const { t0, t1, t2, t3 } = store.state.configuration.setting.conversion

      //           if (MergeLevel === 0) {
      //             convertAmount = new BigNumber(MergeNumber).multipliedBy(t0).toNumber()
      //           } else if (MergeLevel === 1) {
      //             convertAmount = new BigNumber(MergeNumber).multipliedBy(t1).toNumber()
      //           } else if (MergeLevel === 2) {
      //             convertAmount = new BigNumber(MergeNumber).multipliedBy(t2).toNumber()
      //           } else if (MergeLevel === 3) {
      //             convertAmount = new BigNumber(MergeNumber).multipliedBy(t3).toNumber()
      //           }
      //         }

      //         await DEL_TXQUEUE({ ...iterator, txId, txType })
      //         const newtx = {
      //           receipt: data1,
      //           network,
      //           sendData,
      //           txId,
      //           date,
      //           cointype: state.coinType,
      //           value
      //         }
      //         await PUSH_TRANSACTION({...newtx, txId: guid()})
      //       }
      //       }
      //       if(state.coinType.value == 1) {
            
      //         const keys = await getDB(state.accountInfo.address).penddingTable.keys() || []
              
      //         for await (const iterator of keys) {
      //           const txId = iterator
      //           const txInfo = await getDB(state.accountInfo.address).penddingTable.getItem(txId)
      //           // @ts-ignore
      //           const {value} = txInfo
      //           // const sameIdTx = txList.find((item: any) => item.txId.toUpperCase() === txId.toUpperCase())
      //              // @ts-ignore
      //           const hashArr = [txInfo.hash]

      //           console.warn('wait btc', iterator)
   
      //           if (_opt.time != null) {
      //             data1 = await waitForTransactions(hashArr, _opt.time)
      //             // data1 = await wallet.provider.waitForTransaction(hash, null, _opt.time);
      //           } else {
      //             data1 = await waitForTransactions(hashArr)
      //             // data1 = await wallet.provider.waitForTransaction(hash);
      //           }
      //           await DELBTC_TXQUEUE({ ...txInfo, cointype: state.coinType})
      //           await PUSHBTC_TRANSACTION({...txInfo,...data1,value, sendStatus: 'success',cointype: state.coinType})
      //           receiptList.push(data1)
      //         }
      //       }
      //       sendBackground({method: 'waitTxQueueResponse', response:{code:'200',data: {}}})

      //       dispatch('updateBalance')
      //       eventBus.emit('waitTxEnd')
      //       resolve(receiptList)
      //     } catch (err) {
      //       reject(err)
      //     } finally {
      //       clearTimeout(waitTime)
      //     }
      //   }, 1000)

      //   _opt.callback(waitTime)
      // })
    },
    // Indicates that the current transaction exists in the transaction queue
    async checkIsTxHash({commit, state}: any, hash: string) {
      const list: any = await getPenddingList()
      if(!list || !list.length) {
        return false
      }
      return list.some((item: any) => item.hash.toUpperCase() == hash.toUpperCase())
    },
    async switchBTCNet({commit, state, dispatch}, coinType: CoinType){
      const {value} = coinType
      const password = await getCookies()
      const oldCoinType = {...state.coinType}
      const myStore = state.accountInfo.keyStore
      console.log('switch', coinType)
      switch(value){
        case 0:
          // ETH
          await dispatch("createWalletByJson", { password, json: myStore }).then(wall => {
            state.accountInfo.address = toAddrByPrivateKeyETH(wall.privateKey)
          })
          for await(const iterator of state.accountList) {
            await dispatch("createWalletByJson", { password, json: iterator.keyStore }).then(wall => {
              iterator.address = toAddrByPrivateKeyETH(wall.privateKey)
            })
          }
          break;
        case 1:
          // BTC
          await dispatch("createWalletByJson", { password, json: myStore }).then(async(wall) => {
            state.accountInfo.address = await toAddrByPrivateKeyBTC(wall.privateKey)
          })
          for await(const iterator of state.accountList) {
            await dispatch("createWalletByJson", { password, json: iterator.keyStore }).then(async(wall) => {
              iterator.address = await toAddrByPrivateKeyBTC(wall.privateKey)
            })
          }
          break;
      }
      eventBus.emit('switchBTCNet',{ coinType, oldCoinType })
      handleUpdate()
      return Promise.resolve()
    },
    // Switch cointype
    async handleSwitchCoinType({commit, state,dispatch}, coinType: CoinType) {
      const { value } = coinType
      const password = await getCookies()
      // Rederive the address and update it
      if(!password || !state.accountInfo.keyStore) {
        return Promise.reject()
      }
      const oldCoinType = {...state.coinType}
      commit('UPDATE_COINTYPE', coinType)
      return new Promise(async(resolve,reject) => {
        try {
          await dispatch('switchBTCNet', coinType)
          if(coinType.value == 0) {
            const ETHnetworks = await getNetworkList('ETH')
            commit('UPDATE_NETWORK', ETHnetworks.filter(item => item.isMain)[0])
          } 
          if(coinType.value == 1){
            const BTCnetworks = await getNetworkList('BTC')
            console.log('BTCnetworks', BTCnetworks)
            commit('UPDATE_NETWORK', BTCnetworks.filter(item => item.isMain)[0])
          }

          const newwallet = await dispatch('getProviderWallet')
          console.warn('newwallet---', newwallet)
          commit('UPDATE_WALLET', newwallet)
          eventBus.emit('changeCoinType', {coinType: clone(coinType), oldCoinType })
          handleUpdate()
          resolve(newwallet)
        }catch(err){
          reject(err)
          console.error(err)
        }
      })

    }
  },
  namespaced: true,
};


export function toAddrByPrivateKeyETH(privateKey: string){
  const newWallet = new ethers.Wallet(privateKey)
  return newWallet.address
}
export async function  toAddrByPrivateKeyBTC(privateKey: string){
  let pristr = ''
  if(privateKey.toString().startsWith('0x')) {
      pristr = privateKey.substr(2, privateKey.length)
  } else {
      pristr = privateKey
  }
  const network = await getBTCNetwork()
  const privateKeyInstance = new PrivateKey(pristr,network)
  return privateKeyInstance.toAddress().toString();
}

// Transaction type
export enum TransactionTypes {
  // Ordinary transaction
  default = "send",
  // Contract transaction
  contract = "contract",
  // swap
  swap = "swap",
  // Other transactions
  other = "other",
  // receive
  receive = "receive",
}

/**
 * Encapsulate transactions
 * @param txType Transaction type
 * @param receipt Data confirmed on the chain
 * @param tx Transaction return data
 * @returns
 */
export function handleGetTranactionReceipt(
  txType: string,
  receipt: any,
  tx: any,
  network: NetWorkData
) {
  const { from, to, value, nonce, hash, transitionType, nft_address, convertAmount } = tx;
  const { gasUsed, status, effectiveGasPrice, type, blockNumber } = receipt;
  const date = new Date();
  let newType = txType;
  // If it is a contract transaction and to is 0xFFFFFF, rewrite to swap type
  if (
    txType == TransactionTypes.contract && to &&
    to.toUpperCase() ==
    "0xffffffffffffffffffffffffffffffffffffffff".toUpperCase()
  ) {
    newType = TransactionTypes.swap;
  }
  const rec: TransactionReceipt = {
    txType: newType,
    type,
    status,
    from,
    to,
    value,
    date,
    nonce,
    gasUsed,
    hash,
    effectiveGasPrice,
    blockNumber,
    transitionType: transitionType || '',
    nft_address: nft_address || '',
    convertAmount: convertAmount || '',
    network
  };
  return rec;
}




export const clone = (params = {}) => {
  return JSON.parse(JSON.stringify(params))
}


export const getTxInfo = async (res: any) => {
  const { receipt, sendData, value } = res
  const { convertAmount, date, nonce, data } = sendData
  const {
    blockHash,
    blockNumber,
    cumulativeGasUsed,
    effectiveGasPrice,
    gasUsed,
    transactionHash,
    from,
    to,
    contractAddress,
    transactionIndex,
    status,
  } = receipt
  const newReceipt = {
    blockHash,
    blockNumber,
    contractAddress,
    cumulativeGasUsed: ethers.utils.formatUnits(cumulativeGasUsed, 'wei'),
    from,
    gasPrice: ethers.utils.formatUnits(effectiveGasPrice, 'wei'),
    gasUsed: Number(ethers.utils.formatUnits(gasUsed, 'wei')),
    hash: transactionHash,
    nonce,
    to,
    input: data,
    transactionIndex,
    convertAmount,
    timestamp: Math.floor(new Date(date).getTime() / 1000),
    status,
    value: value ? ethers.utils.formatUnits(value, 'wei') : '0'
  }
  if (data) {
    const convertAmount = await getConverAmount(wallet, { input: data, blockNumber })
    newReceipt['convertAmount'] = convertAmount
  }
  return Promise.resolve(newReceipt)
}



export const PUSH_TXQUEUE = async (tx: any) => {
  tx.txId = guid()
  tx.date = new Date()
  const { from ,txId} = tx
  const { id, type } = store.state.account.currentNetwork
  await getDB(from,id,type).penddingTable.setItem(txId, clone(tx))
  eventBus.emit('txQueuePush', tx)
  return tx
}


export const PUSH_BTCTXQUEUE =async (tx: any) => {
  const { from, network: { id, type }  } = tx
  tx.txId = guid()
  tx.date = new Date()
      await getDB(from,id,type).penddingTable.setItem(tx.txId, clone(tx))
      eventBus.emit('txQueuePush', tx)
      return tx
}

export const DEL_TXQUEUE = async (tx: any) => {
  const { network: { id,type }, txId, from } = tx
  if (txId && from) {
    await getDB(from,id,type).penddingTable.removeItem(txId)
    eventBus.emit('delTxQueue', tx)
  }
  return tx
}

export const DELBTC_TXQUEUE = async (tx: any) => {
  const { txId,from,network:{id,type}} = tx
  if (txId) {
    await getDB(from,id,type).penddingTable.removeItem(txId)
    eventBus.emit('delTxQueue', tx)
  }
  return tx
}

export const PUSHBTC_TRANSACTION = async (da: any) => {
    const {from,network:{id,type}} = da
    await getDB(from,id,type).listTable.setItem(da.txId, clone(da))
    eventBus.emit('txPush', clone(da))
}

export const PUSH_TRANSACTION = async (da: any) => {
  // const state = store.state.account
  const { receipt, sendData, network, txId, value, date, sendType, txType, network:{id,type} } = da
  const { convertAmount, nonce, data } = sendData
  const {
    blockHash,
    blockNumber,
    cumulativeGasUsed,
    effectiveGasPrice,
    gasUsed,
    transactionHash,
    from,
    to,
    contractAddress,
    transactionIndex,
    status,
  } = receipt
  /**
   * blockHash: "0x1482d2f2e879c9e02fe79469609d4e1c6ffed21c8b3cc09617df6b9228e81a08"
   * blockNumber:60454
   * contractAddress: null
      convertAmount: 0
      cumulativeGasUsed: 21000
      from: "0x612dfa56dca1f581ed34b9c60da86f1268ab6349"
      gas: 21000
      gasPrice: 1200000000
      gasUsed: 21000
      hash: "0xc3b29fb20ac5ff813a9371e7d6d2913e450d950759a06a1d71fd866a3960978a"
      input: "0x"
      nonce: 0
      status: 1
      timestamp: 1672376574
      to: "0x352deea28e6b15620c75acf0debe6aacbda965c9"
      transactionIndex: 0
      value: "230000000000000000"
   */
  const newReceipt = {
    blockHash,
    blockNumber,
    contractAddress,
    cumulativeGasUsed: ethers.utils.formatUnits(cumulativeGasUsed, 'wei'),
    from,
    gasPrice: ethers.utils.formatUnits(effectiveGasPrice, 'wei'),
    gasUsed: Number(ethers.utils.formatUnits(gasUsed, 'wei')),
    hash: transactionHash,
    nonce,
    to,
    input: data,
    transactionIndex,
    convertAmount,
    timestamp: Math.floor(new Date(date).getTime() / 1000),
    status,
    value: value ? ethers.utils.formatUnits(value, 'wei') : '0',
    txId,
    sendType,
    txType
  }
  if (data) {
    const convertAmount = await getConverAmount(wallet, { input: data, blockNumber })
    newReceipt['convertAmount'] = convertAmount
  }
  await getDB(from,id,type).listTable.setItem(txId, clone(newReceipt))
  // await localforage.setItem(txListKey, clone(txList))
  eventBus.emit('txPush', clone(newReceipt))
  return newReceipt
}


export const UPDATE_TRANSACTION = async (da: any) => {
  const state = store.state.account
  const { receipt, sendData, network, txId, value, date } = da
  const { id,type } = network
  const { convertAmount, nonce, data } = sendData
  const {
    blockHash,
    blockNumber,
    cumulativeGasUsed,
    effectiveGasPrice,
    gasUsed,
    transactionHash,
    from,
    to,
    contractAddress,
    transactionIndex,
    status,
  } = receipt
  /**
   * blockHash: "0x1482d2f2e879c9e02fe79469609d4e1c6ffed21c8b3cc09617df6b9228e81a08"
   * blockNumber:60454
   * contractAddress: null
      convertAmount: 0
      cumulativeGasUsed: 21000
      from: "0x612dfa56dca1f581ed34b9c60da86f1268ab6349"
      gas: 21000
      gasPrice: 1200000000
      gasUsed: 21000
      hash: "0xc3b29fb20ac5ff813a9371e7d6d2913e450d950759a06a1d71fd866a3960978a"
      input: "0x"
      nonce: 0
      status: 1
      timestamp: 1672376574
      to: "0x352deea28e6b15620c75acf0debe6aacbda965c9"
      transactionIndex: 0
      value: "230000000000000000"
   */
  const newReceipt = {
    blockHash,
    blockNumber,
    contractAddress,
    cumulativeGasUsed: ethers.utils.formatUnits(cumulativeGasUsed, 'wei'),
    from,
    gasPrice: ethers.utils.formatUnits(effectiveGasPrice, 'wei'),
    gasUsed: Number(ethers.utils.formatUnits(gasUsed, 'wei')),
    hash: transactionHash,
    nonce,
    to,
    input: data,
    transactionIndex,
    convertAmount,
    timestamp: Math.floor(new Date(date).getTime() / 1000),
    status,
    value: value ? ethers.utils.formatUnits(value, 'wei') : '0',
    txId
  }
  if (data) {
    const convertAmount = await getConverAmount(wallet, { input: data, blockNumber })
    newReceipt['convertAmount'] = convertAmount
  }
  await getDB(formAdd,id,type).listTable.setItem(txId, clone(newReceipt))
  if (newReceipt.status) {
    await DEL_TXQUEUE(da,id,type)
  }
  eventBus.emit('txUpdate', newReceipt)
  return newReceipt
}

export function waitForTransactions(hashs: Array<any>, time: number | null = null):Promise<TransactionReceipt>{
  return new Promise((resolve, reject) => {
    console.warn('provider', wallet.provider)
    if(hashs.length && wallet.provider) {
      hashs.forEach((hash) => {
        if(time != null) {
          wallet.provider.waitForTransaction(hash, null, time).then((res: TransactionReceipt) => {
            resolve(res)
            wallet.provider.removeAllListeners()
          }).catch((err: any) => {
            reject(err)
          })
        } else {
          wallet.provider.waitForTransaction(hash).then((res: TransactionReceipt) => {
            resolve(res)
            wallet.provider.removeAllListeners()
          }).catch((err: any) => {
            reject(err)
          })
        }

      })
    }
  })
}