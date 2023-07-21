import { Toast, Notify, GridItem } from "vant";
import { ethers, utils } from "ethers";
import storeObj from '@/popup/store/index'
import { useBroadCast } from '@/popup/utils/broadCost'
import { getConverAmount, getInput } from "./txList";
import { guid } from '@/popup/utils/utils';

const { handleUpdate } = useBroadCast()
import eventBus from "@/popup/utils/bus";

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
import { getRandomIcon } from "@/popup/utils/index";
import { toRaw } from "vue";
import { TransactionData, TransactionParams } from "./index";
import { ETH, Token } from "@/popup/utils/token";
import { getAccountAddr, getCreator, getPeriodById } from "@/popup/http/modules/common";
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
import Bignumber from 'bignumber.js'
import { sendBackground } from "@/popup/utils/sendBackground";
import localforage from "localforage";
import { Wallet } from "ethers";
export interface State {
  // Mnemonic words
  mnemonic: Mnemonic;
  ethNetwork: Object;

  // route
  path: string;
  wallet: any;
  accountList: Array<any>;
  currentNetwork: NetWorkData;
  netWorkList: Array<NetWorkData>;
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
  contractAddress: string
  firstTime: Boolean,
  exchangeGuidance: boolean
  exchangeServer: boolean;
  exchangeTotalProfit: number
  minerTotalProfit: number
  netStatus: NetStatus
  creatorStatus: Object | null,
  ethAccountInfo: Object,

}
export type ContactInfo = {
  address: string;
  memo?: string;
  name: string;
  id: string;
};
export type ExchangeStatus = {
  status: number;
  ExchangerFlag: boolean;
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
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
  type?: string


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
export const getWallet = () => {
  if (!wallet || !wallet.provider) {
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
    const gasFee = new Bignumber(limitStr).multipliedBy(priceStr).toFixed(9)
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
    recentList: [],
    // Status of opening an exchange status 2 the second successful exchange_ Flag true first success
    exchangeStatus: {
      status: 0,
      ExchangerFlag: false,
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
    creatorStatus: null,
    ethAccountInfo: {},
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
      if (!state.exchangeStatus) {
        return false
      }
      return state.exchangeStatus.ExchangerFlag == true ? true : false;
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
    // Update EthAccountInfo
    UPDATE_ETHACCOUNTINFO(state: State, info: any) {
      state.ethAccountInfo = info
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
      wallet = value;
      if (wallet.provider) {
        sendBackground({ method: 'update-wallet' })
      }
    },
    // New account
    ADD_ACCOUNT(state: State, value: Array<Object>) {
      state.accountList = value;
    },
    // Update URL of wormholes network
    // Update wormholes URL
    UPDATE_WORMHOLES_URL(state: State, { URL, browser, label }: any) {
      let flag = false
      if (state.currentNetwork.isMain) {
        if (state.currentNetwork.URL != URL || state.currentNetwork.browser != browser) {
          flag = true
        }
        state.currentNetwork.URL = URL;
        state.currentNetwork.browser = browser;
        state.currentNetwork.label = label;
      }
      state.netWorkList.forEach(item => {
        if (item.isMain) {
          item.URL = URL;
          item.browser = browser;
          item.label = label
        }
      })

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
    // Update network links
    UPDATE_NETWORK(state: State, value: NetWorkData) {
      state.currentNetwork = value;
      for (let i = 0; i < state.netWorkList.length; i++) {
        if (state.netWorkList[i].id == value.id) {
          state.netWorkList[i] = value;
        }
      }
    },
    // Modify network data according to ID
    MODIF_NETWORK(state: State, network: NetWorkData) {
      const { id } = network;
      for (let i = 0; i < state.netWorkList.length; i++) {
        if (state.netWorkList[i].id == id) {
          state.netWorkList[i] = network;
        }
      }
      handleUpdate()
    },
    // Delete network by ID
    DETETE_NETWORK(state: State, id: string) {
      const list = state.netWorkList.filter((item) => item.id != id);
      if (state.currentNetwork.id == id) {
        list.forEach(item => {
          if (item.isMain) {
            item.select = true
          } else {
            item.select = false
          }
        })
        state.currentNetwork = list[0]
      }
      state.netWorkList = list;
      handleUpdate()
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
    // Transaction list pushed to current account
    async PUSH_TRANSACTION(state: State, value: TransactionReceipt) {
      const { to, from, tokenAddress, network } = value;
      const txNetwork: NetWorkData = { ...network };
      const { id, currencySymbol } = txNetwork
      const formAdd = from.toUpperCase();
      const txListKey = `txlist-${id}`
      let txList: any = await localforage.getItem(txListKey)
      console.log('txList', txList)
      if (txList && typeof txList == 'object') {
        const receipt = { ...value, symbol: currencySymbol }
        delete receipt.network
        if (txList[formAdd] && txList[formAdd].length) {
          const hasHash = txList[formAdd].find((tx: any) => tx.hash.toUpperCase() == value.hash.toUpperCase())
          !hasHash ? txList[formAdd].unshift(clone(receipt)) : ''
        } else {
          txList[formAdd] = [clone(receipt)]
        }
      } else {
        const receipt = { ...value, symbol: currencySymbol }
        delete receipt.network
        txList = {
          [formAdd]: [clone(receipt)]
        }
      }
      store.commit('account/DEL_TXQUEUE', value)
      console.log('set txList', txList)
      // save txlist
      localforage.setItem(txListKey, clone(txList))
      handleUpdate()
    },
    // Update balance
    UPDATE_BALANCE(state: State, balance: string) {
      const address = wallet.address.toUpperCase();
      const accountList = toRaw(state.accountList);
      const accountInfo: any = state.accountInfo;
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
          const amount = ethers.utils.formatEther(allBalance[key]);
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
      state.netWorkList.push(network);
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
    // Add address book
    ADD_CONTACTS(state: State, opt: ContactInfo) {
      state.contacts.unshift(opt);
      handleUpdate()
    },
    // Delete Contact
    DELETE_CONTACT(state: State, index: number) {
      state.contacts.splice(index, 1);
      handleUpdate()
    },
    // Edit Contact
    MODIF_CONTACT(state: State, { targetIndex, opt }: any) {
      state.contacts[targetIndex] = opt;
      handleUpdate()
    },
    // Push to transaction queue
    ADD_TRANACTIONLIST(state: State, data: any) {
      const { hash } = data;
      const f = state.tranactionList.find((item) => item.hash == hash);
      const list = state.tranactionList
      if (!f) {
        list.unshift({ ...data, code: "pending" });
        const len = list.length;
        if (len > 10) {
          // The length of the control queue is 10
          state.tranactionList = list.slice(0, 10)
        } else {
          state.tranactionList = list
        }
        state.tranactionModel = true;
      }
      handleUpdate()
    },
    // Update transaction queue data
    UPDATE_TRANACTIONLIST(state: State, data: TransactionReceipt) {
      const { hash } = data;
      const list = state.tranactionList;
      const len = list.length;
      for (let i = 0; i < len; i++) {
        if (list[i].hash == hash) {
          // Update queue data
          list[i] = { ...data, code: "receive" };
        }
      }
      state.tranactionModel = true;
      handleUpdate()
    },
    // Remove a transaction from the transaction queue according to the hash
    DELETE_TRANACTIONLIST(state: State, hash: string) {
      const list = state.tranactionList;
      let idx = list.find((item) => item.hash == hash);
      list.splice(idx, 1);
      handleUpdate()
    },
    // Close the transaction queue pending pop-up window
    CLOSE_TRANACTIONMODAL(state: State) {
      state.tranactionModel = false;
    },
    // Update the most recent contacts, with a maximum of 10 reserved
    PUSH_RECENTLIST(state: State, address: string) {
      if (!address) {
        return;
      }
      // Find your own accounts and contacts
      const myAccount = state.accountList.find(
        (item) => item.address.toUpperCase() == address.toUpperCase()
      );
      const myContact = state.contacts.find(
        (item) => item.address.toUpperCase() == address.toUpperCase()
      );

      if (myAccount || myContact) {
        const theAccount = myAccount || myContact
        const idx = state.recentList.findIndex(
          (item) => item.address.toUpperCase() == address.toUpperCase()
        );
        if (idx > -1) {
          state.recentList.splice(idx, 1);
        }
        state.recentList.unshift(theAccount);
      } else {
        const idx = state.recentList.findIndex(
          (item) => item.address.toUpperCase() == address.toUpperCase()
        );
        if (idx > -1) {
          state.recentList.splice(idx, 1);
        }
        state.recentList.unshift({
          icon: getRandomIcon(),
          name: '-',
          address,
        });
      }
      const len = state.recentList.length;
      if (len > 10) {
        state.recentList.splice(len - 1, 1);
      }
      handleUpdate()
    },
    // Update contractAddress
    UPDATE_CONTRACTADDRESS(state: State, ERBPay: string) {
      state.contractAddress = ERBPay
    },
    UPDATE_FIRSTTIME(state: State, bool: Boolean) {
      state.firstTime = bool
    },
    // New trades are pushed to the trade queue
    async PUSH_TXQUEUE(state: State, tx: any) {
      const { network: { id } } = tx
      const queuekey = `txQueue-${id}`
      const list: any = await localforage.getItem(queuekey)
      const txQueue = list && list.length ? list : []
      txQueue.push(tx)
      await localforage.setItem(queuekey, txQueue)
    },
    // Delete data from a queue
    // Delete data from a queue
    async DEL_TXQUEUE(state: State, tx: any) {
      const { network: { id } } = tx
      const queueKey = `txQueue-${id}`
      const list: any = await localforage.getItem(queueKey)
      const txQueue = list && list.length ? list : []
      const newList = txQueue.filter((item: any) => item.hash.toUpperCase() != tx.hash.toUpperCase())
      await localforage.setItem(queueKey, newList)
    },
  },
  actions: {
    // get ethAccountInfo
    async getEthAccountInfo({ commit, state }: any) {
      const wall = await getWallet()
      return wall.provider.send(
        "eth_getAccountInfo",
        [state.accountInfo.address, "latest"]
      ).then((res: any) => {
        console.warn('eth_getAccountInfo', res)
        const data = { ...res, ...res.Worm, status: 0 }
        commit('UPDATE_ETHACCOUNTINFO', data)
        return data
      });
    },
    async getCreatorStatus({ commit, state }, address: string) {
      try {
        const data = await getCreator(address)
        const res = await getAccountAddr(address)
        const provider = ethers.getDefaultProvider(state.currentNetwork.URL)
        const block = await provider.getBlockNumber()
        const weight = new BigNumber(block - data.lastNumber).multipliedBy(utils.formatEther(res.snftValue)).toString()
        const rewardEth = utils.formatEther(data.reward)
        const profitStr = utils.formatEther(data.profit)
        const stateData = { ...data, account: res, weight, rewardEth, profitStr }
        console.warn('state', stateData)
        commit('UPDATE_CREATORSTATUS', stateData)
      } catch (err) {
        commit('UPDATE_CREATORSTATUS', null)
      }
    },
    // Judge whether there is an account with a certain address in the wallet
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
        console.warn('password', password)
        if (!password) {
          const query = getQuery();
          // @ts-ignore
          router.push({ name: "loginAccount-step1", query: { ...query, backUrl: getURLPath() } });
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
      { commit, dispatch }: any,
      params: CreateWalletByMnemonicParams
    ) {
      try {
        wallet = await dispatch("createWalletByMnemonic", params);
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
      // check repeat address
      const vuex = await localforage.getItem('vuex')
      // @ts-ignore
      const localAccountList = vuex.account.accountList
      if (localAccountList.find(item => address.toUpperCase() == item.address.toUpperCase())) {
        return Promise.reject('The address is exist!')
      }

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
      dispatch("getProviderWallet");
      commit("UPDATE_ACCOUNTINFO", account);
      commit("ADD_ACCOUNT", list);
      dispatch("updateAccount");
      dispatch('updateBalance')
      return Promise.resolve()
    },
    // Creating wallets with mnemonics
    async createWalletByMnemonic(
      { commit }: any,
      params: CreateWalletByMnemonicParams
    ) {
      try {
        const { phrase, pathIndex } = params;
        console.warn('000', params)
        wallet = await createWalletByMnemonic({ phrase, pathIndex });
        return Promise.resolve(wallet);
      } catch ({ reason }) {
        Toast(i18n.global.t("common.failedtoload"));
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
        const newwallet = await dispatch("getProviderWallet");
        const balance = await newwallet.getBalance();
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
      const newwallet = await dispatch("getProviderWallet");
      const balance = await newwallet.getBalance();
      const amount = ethers.utils.formatEther(balance);
      const address = newwallet.address;
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
      return Promise.resolve(newwallet);
    },
    //Create wallet instance through password keystore
    async createWalletByJson(
      { commit, dispatch, state }: any,
      params: CreateWalletByJsonParams
    ) {
      try {
        wallet = await createWalletByJson(params);
        const { currentNetwork } = state;
        dispatch("setNetWork", currentNetwork);
        return Promise.resolve(wallet);
      } catch (err) {
        return Promise.reject(err);
      }
    },
    // Import account via private key
    // Import the account using the private key
    async importPrivateKey({ commit, state }: any, privatekey: string) {
      try {
        const wa = await ImportPrivateKey({ privatekey });
        const { URL } = state.currentNetwork;
        // debugger
        let provider = ethers.getDefaultProvider(URL);
        const newWallet = wa.connect(provider)
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
        return Promise.reject(err);
      }
    },
    // Set up network
    async setNetWork({ commit, state, dispatch }: any, net: NetWorkData) {
      commit("UPDATE_NETWORK", net);
      // While setting up the network, update the linked network through the wallet instance
      // Link current wallet instance
      const wallet = await dispatch("getProviderWallet");
      const { chainId } = await wallet.provider.getNetwork();
      // Wallet link currently selected network
      return Promise.resolve();
    },
    // Update for all accounts balance
    async updateAllBalance({ commit, state, dispatch }: any) {
      const wallet = await getWallet()
      try {
        const accountList = state.accountList;
        const list: Array<string> = accountList.map(
          (item: AccountInfo) => item.address
        );
        const asyncList = list.map((address) => {
          return dispatch("getBalanceByAddress", { address, wallet });
        });
        const data = await Promise.all(asyncList);
        const banList: any = {};
        list.forEach((address, index) => {
          banList[address] = data[index];
        });
        commit('UPDATE_NETSTATUS', NetStatus.success)
        commit("UPDATE_ALLACCOUNT", banList);
        dispatch("updateTokensBalances");
        return Promise.resolve(banList);
      } catch (err) {
        commit('UPDATE_NETSTATUS', NetStatus.fail)
      }
      // return Promise.resolve([])
    },
    // Return the balance of the current address account
    async getBalanceByAddress({ commit, state }: any, { address, wallet }: any) {
      if (!address || !wallet) {
        return Promise.reject(i18n.global.t("common.cannotbeempty"));
      }
      return wallet.provider.getBalance(address);
    },
    // Update balance in current account currency
    async updateBalance({ commit, state, dispatch }: any, wall: any) {
      const newwallet = wall || wallet && wallet.provider && wallet.provider.connection.url === state.currentNetwork.URL ? wallet : await dispatch("getProviderWallet");
      try {
        if (newwallet) {
          const balance = await newwallet.getBalance();
          const amount = ethers.utils.formatEther(balance);
          commit("UPDATE_WALLET", newwallet);
          commit("UPDATE_BALANCE", amount);
          commit('UPDATE_NETSTATUS', NetStatus.success)
          return Promise.resolve(amount);
        }
      } catch (err) {
        commit('UPDATE_NETSTATUS', NetStatus.fail)
      }

    },
    // Link current network provider wallet instance
    async getProviderWallet({ commit, state, dispatch }: any) {
      let provider = null
      const { URL } = state.currentNetwork;
      if (wallet && wallet.provider && (wallet.provider.connection.url == URL)) {
        return wallet
      }
      if (!wallet || !wallet.provider || (wallet.provider.connection.url != URL)) {
        provider = ethers.getDefaultProvider(URL)
      }
      try {
        if (!wallet) {
          const { accountInfo } = state;
          const { keyStore } = accountInfo;
          const json = toRaw(keyStore)
          const password: string = await getCookies("password") || "";
          const wall = await dispatch("createWalletByJson", { password, json });
          const newWallet = wall.connect(provider)
          const res = await newWallet.provider.getNetwork()
          commit('UPDATE_ETHNETWORK', res)
          commit('UPDATE_NETSTATUS', NetStatus.success)
          commit("UPDATE_WALLET", newWallet);
          return newWallet
        }
        if (wallet && wallet.provider) {
          const { connection: { url } } = wallet.provider
          if (URL != url) {
            const newWallet = wallet.connect(provider)
            const res = await newWallet.provider.getNetwork()
            commit('UPDATE_NETSTATUS', NetStatus.success)
            commit("UPDATE_WALLET", newWallet);
            commit('UPDATE_ETHNETWORK', res)
            return newWallet
          } else {
            commit('UPDATE_NETSTATUS', NetStatus.success)
            commit("UPDATE_WALLET", wallet);

            return wallet
          }

        }
        if (wallet && !wallet.provider) {
          const newWallet = wallet.connect(provider)
          const res = await newWallet.provider.getNetwork()
          commit('UPDATE_ETHNETWORK', res)

          commit('UPDATE_NETSTATUS', NetStatus.success)
          commit("UPDATE_WALLET", newWallet);
          return newWallet
        }
      } catch (err: any) {
        console.warn('showNotify', Notify)
        console.error('err:----2', err)
        // if(JSON.stringify(err).indexOf('could not detect network') > -1) {
        //   Notify({ type: 'danger', message: i18n.global.t('error.netErr'),duration: 5000 })
        // }
        Notify({ type: 'danger', message: i18n.global.t('error.netErr'), duration: 5000, position: 'bottom' })
        commit('UPDATE_NETSTATUS', NetStatus.fail)
        return Promise.reject(err);
      }
    },
    // Whether there is card trading on the current exchange
    async hasPendingTransactions({ state, commit }: any) {
      const { id } = state.currentNetwork
      const from = state.accountInfo.address
      // @ts-ignore
      const txListKey = `txQueue-${id}-${state.ethNetwork.chainId}-${from.toUpperCase()}`
      // const txListKey = `txQueue-${id}-${from.toUpperCase()}`
      let txList: any = await localforage.getItem(txListKey)
      console.warn('txList', txList)
      return txList && txList.length ? true : false
    },
    async transaction(
      { state, commit, dispatch }: any,
      params: SendTransactionParams
    ) {
      const { to, value, gasPrice, gasLimit, data, transitionType, nft_address, checkTxQueue, nonce: sendNonce, type: newType, maxPriorityFeePerGas, maxFeePerGas } = { checkTxQueue: false, ...params };
      // Determine whether there are transactions in the current trading pool that have not returned transaction receipts, and if so, do not allow them to be sent
      if (checkTxQueue && await dispatch('hasPendingTransactions')) {
        return Promise.reject({ reason: i18n.global.t('common.sendTipPendding'), code: 500 })
      }
      console.warn('params', params)
      try {
        const newData = data || ''
        const { currentNetwork } = state
        let tx: any = {
          to,
          value: utils.parseEther(value && Number(value) ? value.toString() : '0')
        };
        if (Number(gasPrice)) {
          const bigPrice = new BigNumber(gasPrice)
          console.warn('bigPrice', bigPrice.toNumber())
          const gasp = Number(gasPrice) ? bigPrice.dividedBy(1000000000).toFixed(12) : '0.0000000012';
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
        if (maxPriorityFeePerGas) {
          tx.maxPriorityFeePerGas = maxPriorityFeePerGas
        }
        if (maxFeePerGas) {
          tx.maxFeePerGas = maxFeePerGas
        }
        // Update recent contacts
        commit("PUSH_RECENTLIST", to);
        const newwallet = await getWallet();
        let sendData = await newwallet.sendTransaction(tx);

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

        console.log("i18n", i18n);
        sendData.wallet = newwallet
        return sendData
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
        const { currentNetwork, accountInfo } = state
        // Update recent contacts
        commit("PUSH_RECENTLIST", to);
        debugger
        // Get contract token instance object
        const { contractWithSigner, contract } = await dispatch(
          "connectConstract",
          tokenAddress
        );
        const { precision } = state.currentNetwork.tokens[accountInfo.address.toUpperCase()].find(item => item.tokenContractAddress.toUpperCase() == tokenAddress.toUpperCase())
        const amountWei = utils.parseUnits(amount.toString(), precision).toString()
        console.warn('amountWei', amountWei)
        console.log(" contract.estimate", contract, contractWithSigner);
        const gasp = Number(gasPrice) ? new BigNumber(gasPrice).dividedBy(1000000000).toFixed(12) : '0.0000000012';
        const transferParams: any = {
          gasLimit: gasLimit,
          gasPrice: ethers.utils.parseEther(gasp),
        };
        if (typeof sendNonce != undefined) {
          transferParams['nonce'] = sendNonce
        }
        console.log("transferParams", transferParams);
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
          toAddress: to
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
        try {
          const wallet = await getWallet();
          console.log('newtx', tx)
          const { to } = tx
          // Update recent contacts
          commit("PUSH_RECENTLIST", to);
          const symbol = state.currentNetwork.currencySymbol
          const data = await wallet.sendTransaction(tx);
          const { from, gasLimit, gasPrice, hash, nonce, type, value } = data;
          commit("PUSH_TXQUEUE", {
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

          });
          // const penddingRep = handleGetPenddingTranactionReceipt(TransactionTypes.default,data, symbol)
          // commit("PUSH_TRANSACTION", penddingRep);
          const receipt = await wallet.provider.waitForTransaction(data.hash)
          const { currentNetwork } = state
          const rep: TransactionReceipt = handleGetTranactionReceipt(
            TransactionTypes.default,
            receipt,
            data,
            currentNetwork
          );
          // Update transaction queue
          commit("UPDATE_TRANACTIONLIST", rep);
          // Add to transaction
          commit("UPDATE_TRANSACTION", rep);
          resolve(data)
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
          Toast(i18n.global.t("currencyList.addressalreadyexists"));
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
          const ban = await contractWithSigner.balanceOf(wallet.address)
          console.warn('获取合约资产', utils.formatUnits(ban.toString(), decimal))
          balance = utils.formatUnits(ban.toString(), decimal);
        } catch (err: any) {
          // Toast(i18n.global.t("currencyList.importerror"));
          return Promise.reject(i18n.global.t("currencyList.importerror"))
        }
        console.log("connectConstract", contractWithSigner, contract);
        // Link contract
        if (hasAddress) {
          console.log("balance.toString()", balance.toString(), balance);
          // Add if not
          network.tokens[key].push({
            symbol,
            logoUrl,
            name,
            precision: decimal,
            tokenContractAddress,
            balance: balance.toString(),
          });
          commit("UPDATE_NETWORK", network);
          return Promise.resolve();
        } else {
          // Current network current address has no token
          network.tokens[key] = [];
          network.tokens[key].push({
            symbol,
            logoUrl,
            name,
            precision: decimal,
            tokenContractAddress,
            balance: balance.toString(),
          });
          commit("UPDATE_NETWORK", network);
          return Promise.resolve();
        }
      } catch (err) {
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
      const res = await wallet.provider.send('eth_getAccountInfo', [address, 'latest'])
      const data = { ...res, ...res.Worm, status: 0 }
      commit("UPDATE_EXCHANGERSTATUS", data);
      call(data);
      return data
    },
    // Update current network, current address, current token list balance
    async updateTokensBalances({ commit, state, dispatch }: any) {
      const wallet = await getWallet();
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
        const addr = state.accountInfo.address.toUpperCase()
        const { precision } = state.currentNetwork.tokens[addr].find(item => item.tokenContractAddress.toUpperCase() == tokenAddress.toUpperCase())
        const wallet = await getWallet();
        const contract = new ethers.Contract(
          tokenAddress,
          erc20Abi,
          wallet.provider
        );
        const contractWithSigner = contract.connect(wallet);
        console.warn("contractWithSigner--------------", contractWithSigner);
        const amount = await contractWithSigner.balanceOf(wallet.address)
        const newban = utils.formatUnits(amount.toString(), precision)
        console.log('amount 合约', utils.formatUnits(amount.toString(), precision))
        return Promise.resolve(newban);
      } catch (err) {
        return Promise.reject(err);
      }
    },
    // Add address book
    async addContacts({ commit, state }: any, opt: ContactInfo) {
      // Determine whether there is a duplicate address in the address book
      const { contacts } = state;
      const { address } = opt;
      const flag = contacts.find(
        (item: any) => item.address.toUpperCase() == address.toUpperCase()
      );
      if (flag) {
        return Promise.reject(i18n.global.t("contacts.alreadyexists"));
      } else {
        commit("ADD_CONTACTS", opt);
        return Promise.resolve();
      }
    },
    // Delete address book contact
    deleteContact({ commit, state }: any, id: any) {
      const { contacts } = state;
      const targetIdx = contacts.findIndex((item: any) => item.id == id);
      if (targetIdx == -1) {
        return Promise.reject("Contact not found");
      }
      commit("DELETE_CONTACT", targetIdx);
      return Promise.resolve();
    },
    // Edit Contact
    modifContact({ commit, state }: any, opt: ContactInfo) {
      const { address, id } = opt;
      const targetIndex = state.contacts.findIndex(
        (item: any) => item.id == id
      );
      if (targetIndex == -1) {
        return Promise.reject("Contact not found");
      }
      commit("MODIF_CONTACT", { targetIndex, opt });
    },
    // Encrypt the new keystore according to all new passwords
    async updateKeyStoreByPwd({ commit, state }: any, password: string) {
      if (!password) {
        Toast(i18n.global.t('createAccountpage.pwdRequired'));
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
      const { id } = state.currentNetwork
      const from = state.accountInfo.address
      // @ts-ignore
      const queuekey = `txQueue-${id}-${state.ethNetwork.chainId}-${from.toUpperCase()}`
      const list: Array<any> = await localforage.getItem(queuekey)
      let hasExits = false
      if (list && list.length) {
        hasExits = list.find((item) => item.hash.toUpperCase() === hash.toUpperCase())
      }
      return Promise.resolve(hasExits)
    },
    // The result of polling the transaction queue
    // async waitTxQueueResponse({ commit, state }: any) {
    //   // // The service worker performs
    //   return sendBackground({ method: 'waitTxQueueResponse' })
    // }
    //  Stop polling
    //  Stop polling
    clearWaitTime() {
      clearTimeout(waitTime)
      waitTime = null
      if (wallet && wallet.provider) {
        wallet.provider.removeAllListeners()
      }
    },
    // The result of polling the transaction queue
    // The result of polling the transaction queue
    async waitTxQueueResponse({ commit, state }: any, opt?: Object) {
      console.warn('waitTxQueueResponse---')
      const _opt = {
        time: 60000,
        callback: (e: any) => { },
        ...opt
      }
      const { id } = state.currentNetwork
      const from = state.accountInfo.address
      // @ts-ignore
      const queuekey = `txQueue-${id}-${state.ethNetwork.chainId}-${from.toUpperCase()}`
      let txkey = ''
      if (id === 'wormholes-network-1') {
        txkey = `async-${id}-${state.ethNetwork.chainId}-${from.toUpperCase()}`
      } else {
        txkey = `txlist-${id}-${state.ethNetwork.chainId}-${from.toUpperCase()}`
      }
      let data1 = null
      return new Promise((resolve, reject) => {
        waitTime = setTimeout(async () => {
          const list: any = await localforage.getItem(queuekey)
          const txQueue = list && list.length ? list : []
          if (!txQueue.length) {
            resolve(true)
          }
          const receiptList = []
          //  const newWallet = await getWallet()
          try {
            for await (const iterator of txQueue) {
              let { hash, transitionType, nft_address, blockNumber, network, txType, txId, amount, isCancel, sendData, date, value, nonce } = iterator
              const txInfo: any = await localforage.getItem(txkey)
              let txList: any = []
              if (id === 'wormholes-network-1') {
                txList = txInfo && txInfo.list ? txInfo.list : []
              } else {
                txList = txInfo || []
              }
              const sameNonceTx = txList.find((item: any) => item.nonce === nonce)
              const hashArr = !sameNonceTx ? [hash] : [hash, sameNonceTx.hash]
              if (_opt.time != null) {
                data1 = await waitForTransactions(hashArr, _opt.time)
                // data1 = await wallet.provider.waitForTransaction(hash, null, _opt.time);
              } else {
                data1 = await waitForTransactions(hashArr)
                // data1 = await wallet.provider.waitForTransaction(hash);

              }
              receiptList.push(data1)
              let convertAmount: any = ''
              if (transitionType && transitionType == '6') {
                const len = nft_address.length
                switch (len) {
                  case 42:
                    break;
                  case 41:
                    nft_address += '0'
                    break;
                  case 40:
                    nft_address += '00'
                    break;
                  case 39:
                    nft_address += '000'
                    break;
                }
                const nftAccountInfo = await wallet.provider.send(
                  "eth_getAccountInfo",
                  [nft_address, web3.utils.toHex((data1.blockNumber - 1).toString())]
                );
                const { MergeLevel, MergeNumber } = nftAccountInfo.Nft

                //  @ts-ignore
                const { t0, t1, t2, t3 } = store.state.configuration.setting.conversion

                if (MergeLevel === 0) {
                  convertAmount = new BigNumber(MergeNumber).multipliedBy(t0).toNumber()
                } else if (MergeLevel === 1) {
                  convertAmount = new BigNumber(MergeNumber).multipliedBy(t1).toNumber()
                } else if (MergeLevel === 2) {
                  convertAmount = new BigNumber(MergeNumber).multipliedBy(t2).toNumber()
                } else if (MergeLevel === 3) {
                  convertAmount = new BigNumber(MergeNumber).multipliedBy(t3).toNumber()
                }
              }


              await DEL_TXQUEUE({ ...iterator, txId, txType })
              const newtx = {
                receipt: data1,
                network,
                sendData,
                txId,
                date,
                value
              }
              if (id === 'wormholes-network-1') {
                await UPDATE_TRANSACTION(newtx)
              } else {
                await PUSH_TRANSACTION({ ...newtx, txId: guid() })
              }

            }
            eventBus.emit('waitTxEnd')
            resolve(receiptList)
          } catch (err) {
            reject(err)
          } finally {
            clearTimeout(waitTime)
          }
        }, 1000)

        _opt.callback(waitTime)
      })
    },
    // Indicates that the current transaction exists in the transaction queue
    async checkIsTxHash({ commit, state }: any, hash: string) {
      const { id } = state.currentNetwork
      const from = state.accountInfo.address
      const queuekey = `txQueue-${id}-${state.ethNetwork.chainId}-${from.toUpperCase()}`
      const list: any = await localforage.getItem(queuekey)
      if (!list || !list.length) {
        return false
      }
      return list.some((item: any) => item.hash.toUpperCase() == hash.toUpperCase())
    }
  },
  namespaced: true,
};

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
  const { network: { id, chainId }, from } = tx
  // @ts-ignore
  const queuekey = `txQueue-${id}-${chainId}-${from.toUpperCase()}`
  const list: any = await localforage.getItem(queuekey)
  const txQueue = list && list.length ? list : []
  tx.txId = guid()
  tx.date = new Date()
  txQueue.unshift(clone(tx))
  await localforage.setItem(queuekey, txQueue)
  eventBus.emit('txQueuePush', tx)
  return tx
}

export const DEL_TXQUEUE = async (tx: any) => {
  const { network: { id, chainId }, txId, from } = tx
  if (id && chainId && txId && from) {
    // @ts-ignore
    let queueKey = `txQueue-${id}-${chainId}-${from.toUpperCase()}`
    const list: any = await localforage.getItem(queueKey)
    const txQueue = list && list.length ? list : []
    debugger
    const newList = txQueue.filter((item: any) => item.txId.toUpperCase() != txId.toUpperCase())
    await localforage.setItem(queueKey, newList)
    eventBus.emit('delTxQueue', tx)
  }
  return tx
}

export const PUSH_TRANSACTION = async (da: any) => {
  const state = store.state.account
  console.warn('push', da)
  const { receipt, sendData, network, txId, value, date, sendType, txType } = da
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
  console.warn('newReceipt', newReceipt)
  if (data) {
    const convertAmount = await getConverAmount(wallet, { input: data, blockNumber })
    newReceipt['convertAmount'] = convertAmount
  }
  const formAdd = from.toUpperCase();
  // @ts-ignore
  const chainId = state.ethNetwork.chainId
  let txListKey = ''
  if (state.currentNetwork.id == 'wormholes-network-1') {
    txListKey = `async-${state.currentNetwork.id}-${chainId}-${formAdd}`
  } else {
    txListKey = `txlist-${state.currentNetwork.id}-${chainId}-${formAdd}`
  }
  let txList: any = await localforage.getItem(txListKey)
  console.log('txList', txList)

  if (state.currentNetwork.id == 'wormholes-network-1') {
    if (txList && txList.list.length) {
      const tx = txList.list.find((item: any) => item.txId.toUpperCase() == newReceipt.txId.toUpperCase())
      if (!tx) {
        txList.list.unshift(clone(newReceipt))
      }
    } else {
      txList.list = [clone(newReceipt)]
    }
  } else {
    if (txList && txList.length) {
      const tx = txList.find((item: any) => item.txId.toUpperCase() == newReceipt.txId.toUpperCase())
      if (!tx) {
        txList.unshift(clone(newReceipt))
      }
    } else {
      txList = [clone(newReceipt)]
    }
  }

  // store.commit('account/DEL_TXQUEUE', value)
  console.log('set txList', txList)
  // save txlist
  await localforage.setItem(txListKey, clone(txList))
  eventBus.emit('txPush', clone(newReceipt))
  return newReceipt
}


export const UPDATE_TRANSACTION = async (da: any) => {
  const state = store.state.account
  const { receipt, sendData, network, txId, value, date } = da
  const { id, currencySymbol } = network
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
  const formAdd = from.toUpperCase();
  // @ts-ignore
  const chainId = state.ethNetwork.chainId
  let txListKey = ''
  if (state.currentNetwork.id == 'wormholes-network-1') {
    txListKey = `async-${id}-${chainId}-${formAdd}`
  } else {
    txListKey = `txlist-${id}-${chainId}-${formAdd}`
  }
  let txList: any = await localforage.getItem(txListKey)
  console.warn('has txID', txList)
  if (state.currentNetwork.id == 'wormholes-network-1') {
    if (txList && txList.list.length) {
      for (let i = 0; i < txList.list.length; i++) {
        const item = txList.list[i]
        if (item.txId.toUpperCase() === txId.toUpperCase()) {
          txList.list[i] = newReceipt
        }
      }

    }
  } else {
    if (txList && txList.length) {
      if (txList && txList.length) {
        for (let i = 0; i < txList.length; i++) {
          const item = txList[i]
          if (item.txId.toUpperCase() === txId.toUpperCase()) {
            txList[i] = newReceipt
          }
        }

      }
    }
  }
  await localforage.setItem(txListKey, txList)
  if (newReceipt.status) {
    await DEL_TXQUEUE(da)
  }
  eventBus.emit('txUpdate', newReceipt)
  return newReceipt
}

export function waitForTransactions(hashs: Array<any>, time: number | null = null): Promise<TransactionReceipt> {
  return new Promise((resolve, reject) => {
    if (hashs.length) {
      hashs.forEach((hash) => {
        if (time != null) {
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