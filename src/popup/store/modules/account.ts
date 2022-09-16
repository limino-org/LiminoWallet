import { Toast, Notify, GridItem } from "vant";
import { ethers, utils } from "ethers";
import {clone} from 'pouchdb-utils';
import storeObj from '@/popup/store/index'
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
import { checkAuth } from "@/popup/http/modules/common";
import { useStore } from "vuex";
import {
  NetWorkData,
  netWorklist,
} from "@/popup/enum/network";
import { setCookies, getCookies } from "@/popup/utils/jsCookie";
import router from "@/popup/router";
import { getQuery, toHex ,getURLPath} from "@/popup/utils/utils";
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
import store from "@/store";
import { getContractAddress } from "@/popup/http/modules/common";
import Bignumber from 'bignumber.js'
export interface State {
  // Mnemonic words
  mnemonic: Mnemonic;
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

}
export type ContactInfo = {
  address: string;
  memo?: string;
  name: string;
  id: string;
};
export type ExchangeStatus = {
  status: number;
  exchanger_flag: boolean;
};
export interface AddressBalance {
  address: string;
  balance: string;
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
  // Callback of transaction confirmation
  call?: Function;
}

// Token transaction params

export interface SendTokenParams {
  address: string;
  amount: any;
  gasPrice: string;
  gasLimit: number;
  to: string;
}

export interface AddAccountParams {
  keyStore: {
    [key: string]: any;
  };
  mnemonic: Mnemonic;
  address: string;
  imported: boolean;
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
  // Transaction type is used for list / detail display
  txType: string;
  // Transaction type
  type: number;
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
  // symbol
  symbol: string
  tokenAddress?: string
};
export let wallet: any = null;
export const getWallet = () => {
  if (!wallet) {
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
    const priceStr = ethers.utils.formatUnits(gasPrice,'wei')
    debugger
    const gasFee = new Bignumber(limitStr).multipliedBy(priceStr).toFixed(9)
    return gasFee
  } catch (err) {
    console.error(err)
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
      if(!state.exchangeStatus){
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
    tranactionModel(state: State){
      return state.tranactionModel
    }
  },
  mutations: {
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
    },
    // Update Wallet
    UPDATE_WALLET(state: State, value: any) {
      console.log('wallet',value)
      wallet = value;
      if(wallet.provider) {
      // @ts-ignore
       const bg = chrome.extension.getBackgroundPage();
       bg.initWallet()
      }
      localStorage.setItem("wallet", JSON.stringify({ ...value }));
    },
    // New account
    ADD_ACCOUNT(state: State, value: Array<Object>) {
      state.accountList = value;
    },
    // Update URL of wormholes network
// Update wormholes URL
UPDATE_WORMHOLES_URL(state: State, { URL, browser,chainId }: any) {
  let flag = false
  if (state.currentNetwork.isMain) {
    if(state.currentNetwork.URL != URL || state.currentNetwork.browser != browser) {
      flag = true
    }
    state.currentNetwork.URL = URL;
    state.currentNetwork.browser = browser;
    state.currentNetwork.id = 'wormholes-network-1'
  }
  state.netWorkList.forEach(item => {
    if(item.isMain){
      if(item.URL != URL || item.browser != browser) {
        flag = true
      }
      item.URL = URL;
      item.browser = browser;
      item.id = 'wormholes-network-1'
    }
  })
  if(flag){
    Toast.loading({
      message: i18n.global.t('common.asyncData'),
      duration: 0
    })
    setTimeout(() => {
      if(flag) {
        location.reload()
      }
    },1000)
  }


},
    // Update wormholes ChainId
    UPDATE_WORMHOLES_CHAINID(state:State, chainId: number) {
      if (state.currentNetwork.isMain) {
        state.currentNetwork.chainId = chainId
      }
      state.netWorkList.forEach(item => {
        if(item.isMain){
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
    },
    // Delete network by ID
    DETETE_NETWORK(state: State, id: string) {
      const list = state.netWorkList.filter((item) => item.id != id);
      state.netWorkList = list;
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
    },
    // Update account information
    UPDATE_ACCOUNTINFO(state: State, value: AccountInfo) {
      state.accountInfo = value;
    },
    // Transaction list pushed to current account
    PUSH_TRANSACTION(state: State, value: TransactionReceipt) {
      const { to, from, tokenAddress } = value;
      const currentNetwork: NetWorkData = { ...toRaw(state.currentNetwork) };
      const netWorkList = toRaw(state.netWorkList);
      const tokenAdd = tokenAddress ? tokenAddress.toUpperCase() : '';
      const formAdd = from.toUpperCase();
      const len2 =
        typeof currentNetwork.transactionList[formAdd] != undefined &&
        currentNetwork.transactionList[formAdd]
          ? currentNetwork.transactionList[formAdd].length
          : 0;

      if (len2) {
        Object.keys(currentNetwork.transactionList).forEach((key) => {
          const keyVal = key.toUpperCase();
          if (keyVal == formAdd) {
            currentNetwork.transactionList[keyVal].unshift(value);
          }
        });
      } else {
        currentNetwork.transactionList[formAdd] = [value];
      }
      for (let i = 0; i < netWorkList.length; i++) {
        if (netWorkList[i].chainId == currentNetwork.chainId) {
          netWorkList[i] = currentNetwork;
        }
      }
      state.currentNetwork = currentNetwork;
      state.netWorkList = netWorkList;
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
    ADD_ADDRESS(state: State, VAL: Token) {},
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
      if(state.accountInfo.address.toUpperCase() == add && acc){
        state.accountInfo = {...acc}
      }
    },
    // Add address book
    ADD_CONTACTS(state: State, opt: ContactInfo) {
      state.contacts.unshift(opt);
    },
    // Delete Contact
    DELETE_CONTACT(state: State, index: number) {
      state.contacts.splice(index, 1);
    },
    // Edit Contact
    MODIF_CONTACT(state: State, { targetIndex, opt }: any) {
      state.contacts[targetIndex] = opt;
    },
    // Push to transaction queue
    ADD_TRANACTIONLIST(state: State, data: any) {
      const { hash } = data;
      const f = state.tranactionList.find((item) => item.hash == hash);
      const list = state.tranactionList
      if (!f) {
        list.unshift({...data, code: "pending" });
        const len = list.length;
        if (len > 10) {
          // The length of the control queue is 10
          state.tranactionList = list.slice(0, 10)
        } else {
          state.tranactionList = list
        }
        state.tranactionModel = true;
      }
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
    },
    // Remove a transaction from the transaction queue according to the hash
    DELETE_TRANACTIONLIST(state: State, hash: string) {
      const list = state.tranactionList;
      let idx = list.find((item) => item.hash == hash);
      list.splice(idx, 1);
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
    },
    // Update contractAddress
    UPDATE_CONTRACTADDRESS(state: State, ERBPay: string) {
      state.contractAddress = ERBPay
    },
    UPDATE_FIRSTTIME(state: State, bool: Boolean){
      state.firstTime = bool
    }
  },
  actions: {
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
      // @ts-ignore
      const bg = chrome.extension.getBackgroundPage();
      try {
        const { accountInfo } = state;
        const { keyStore } = accountInfo;
        const password: string = getCookies("password") || "";
        if (!password) {
          const query = getQuery();
          // @ts-ignore
          router.push({ name: "loginAccount-step1", query:{...query,backUrl: getURLPath()} });
          return Promise.reject(i18n.global.t("common.withpassword"));
        }
        // Load wallet via password and keystore
        await dispatch("createWalletByJson", { password, json: keyStore });
        // Link current network provider
        wallet = await dispatch("getProviderWallet");
        // @ts-ignore
        bg.wallet = wallet
        commit("UPDATE_WALLET", wallet);

        return Promise.resolve(wallet);
      } catch (err) {
        // @ts-ignore
        bg.wallet = null
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
      let list = state.accountList;
      const len = list.length;
      const icon = getRandomIcon();
      const balance = await dispatch("getBalance");
      const { path, pathIndex }: any = mnemonic;
      const account = {
        name: `Account ${len + 1}`,
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
        // 第一个账户默认选中
        // account.select = true
        list = [account];
      }
      dispatch("getProviderWallet");
      commit("UPDATE_ACCOUNTINFO", account);
      dispatch("updateAccount");
      commit("ADD_ACCOUNT", list);
      return Promise.resolve()
    },
    // Creating wallets with mnemonics
    async createWalletByMnemonic(
      { commit }: any,
      params: CreateWalletByMnemonicParams
    ) {
      try {
        const { phrase, pathIndex } = params;
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
    async importPrivateKey({ commit, state }: any, privatekey: string) {
      try {
        wallet = await ImportPrivateKey({ privatekey });
        // During import, judge whether the address exists in the current account list. If it does, an exception will be thrown and the import will not continue
        const { address } = wallet;
        const { accountList } = state;
        const a = accountList.find(
          (item: any) => item.address.toUpperCase() == address.toUpperCase()
        );
        if (a) {
          return Promise.reject({ reason: i18n.global.t("common.existed") });
        } else {
          commit("UPDATE_WALLET", wallet);
          return Promise.resolve(wallet);
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
      const accountList = state.accountList;
      const list: Array<string> = accountList.map(
        (item: AccountInfo) => item.address
      );
      const asyncList = list.map((address) => {
        return dispatch("getBalanceByAddress", address);
      });
      const data = await Promise.all(asyncList);
      const banList: any = {};
      list.forEach((address, index) => {
        banList[address] = data[index];
      });
      commit("UPDATE_ALLACCOUNT", banList);
      dispatch("updateTokensBalances");
      return Promise.resolve(banList);
    },
    // Return the balance of the current address account
    async getBalanceByAddress({ commit, state }: any, address: string) {
      // Verification address
      if (!address || !wallet) {
        return Promise.reject(i18n.global.t("common.cannotbeempty"));
      }
      // Return balance
      return wallet.provider.getBalance(address);
    },
    // Update balance in current account currency
    async updateBalance({ commit, state, dispatch }: any) {
      const newwallet = await dispatch("getProviderWallet");
      const balance = await newwallet.getBalance();
      const amount = ethers.utils.formatEther(balance);
      commit("UPDATE_WALLET", newwallet);
      commit("UPDATE_BALANCE", amount);
      return Promise.resolve(amount);
    },
    // Link current network provider wallet instance
    async getProviderWallet({ commit, state }: any) {
      try {
        const { URL } = state.currentNetwork;
        let provider = ethers.getDefaultProvider(URL);
        const newwallet = wallet.connect(provider);
        commit("UPDATE_WALLET", newwallet);
        return Promise.resolve(newwallet);
      } catch (err: any) {
        return Promise.reject(err);
      }
    },
    // Initiate ordinary transaction
    async transaction(
      { state, commit, dispatch }: any,
      params: SendTransactionParams
    ) {
      const { to, value, call, gasPrice, gasLimit } = params;
      const gasp = new BigNumber(gasPrice).dividedBy(1000000000).toFixed(12);
      let tx = {
        to,
        value: utils.parseEther(value),
        gasPrice: ethers.utils.parseEther(gasp),
        gasLimit,
      };

      // Update recent contacts
      commit("PUSH_RECENTLIST", to);
      const newwallet = await dispatch("getProviderWallet");
      let sendPromise = newwallet.sendTransaction(tx);
      console.log("i18n", i18n);
      return new Promise((resolve, reject) => {
        sendPromise
          .then((data: any) => {
            // Add to transaction queue
            commit("ADD_TRANACTIONLIST", JSON.parse(JSON.stringify(data)));
            resolve(data);
            newwallet.provider
              .waitForTransaction(data.hash)
              .then((receipt: any) => {
                const symbol = state.currentNetwork.currencySymbol
                const rep: TransactionReceipt = handleGetTranactionReceipt(
                  TransactionTypes.default,
                  receipt,
                  data,
                  symbol
                );
                call ? call(rep) : "";
                // Update transaction queue
                commit("UPDATE_TRANACTIONLIST", rep);
                // Add to transaction
                commit("PUSH_TRANSACTION", rep);
                dispatch("updateAllBalance");
              });
          })
          .catch((err: any) => {
            console.error(err);
            const { code, reason } = err;
            Toast(i18n.global.t("common.transactionfailed"));
            localStorage.setItem(
              i18n.global.t("common.transactionfailed"),
              JSON.stringify(err)
            );
            reject(err);
          });
      });
    },
    // Initiate token transaction
    async tokenTransaction(
      { state, commit, dispatch }: any,
      params: SendTokenParams
    ) {
      const { address, amount, to, gasPrice, gasLimit } = params;
      // Update recent contacts
      commit("PUSH_RECENTLIST", to);
      return new Promise(async (resolve, reject) => {
        try {
          // Get contract token instance object
          const { contractWithSigner, contract } = await dispatch(
            "connectConstract",
            address
          );
          console.log(" contract.estimate", contract, contractWithSigner);
          contractWithSigner.estimateGas
            .transfer(to, amount)
            .then((gas: any) => {
              const gasp = new BigNumber(gasPrice)
                .dividedBy(1000000000)
                .toFixed(12);
              console.log("gas-->", utils.formatEther(gas));
              const transferParams = {
                gasLimit: gasLimit,
                gasPrice: ethers.utils.parseEther(gasp),
              };
              console.log("transferParams", transferParams);
              contractWithSigner
                .transfer(to, amount, transferParams)
                .then((data: any) => {
                  // Add to transaction queue
                  commit("ADD_TRANACTIONLIST", JSON.parse(JSON.stringify(data)));
                  sessionStorage.setItem("token tx", JSON.stringify(data));
                  resolve(data);
                  // Monitor on chain confirmation
                  wallet.provider
                    .waitForTransaction(data.hash)
                    .then(async (receipt: any) => {
                      // Rewrite balance consistent with ordinary transaction bigNumber
                      data.value = utils.parseEther(amount);
                      sessionStorage.setItem(
                        "token receipt",
                        JSON.stringify(receipt)
                      );
   
                      const token = state.currentNetwork.tokens[wallet.address.toUpperCase()].find(item => item.tokenContractAddress.toUpperCase() == address.toUpperCase())
                      const symbol = token.symbol
                      const rep: TransactionReceipt =
                        handleGetTranactionReceipt(
                          TransactionTypes.default,
                          receipt,
                          data,
                          symbol,
                        );
                      // Update transaction queue
                      commit("UPDATE_TRANACTIONLIST", rep);
                      // Update account balance
                      dispatch("updateTokensBalances");
                      // Add to transaction
                      commit("PUSH_TRANSACTION", {...rep, tokenAddress:address});
                    });
                })
                .catch((err: any) => {
                  console.error(err);
                  reject(err);
                });
            })
            .catch((err: any) => {
              console.error(err);
              reject(err);
            });
        } catch (err) {
          reject(err);
        }
      });
    },
   // send data
   async sendTransaction({ commit, dispatch, state }: any, tx: any) {
    const wallet = await getWallet();
    console.log('newtx',tx)
    const {to} = tx
    // Update recent contacts
    commit("PUSH_RECENTLIST", to);
    return new Promise((resolve, reject) => {
      wallet
        .sendTransaction(tx)
        .then((data: any) => {
          resolve(data);
        })
        .catch((err: any) => {
          console.error(err)
          reject(err);
        });
    });
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
        console.log("contractWithSigner", contractWithSigner);
        const name = await contractWithSigner.name();
        const decimal = await contractWithSigner.decimals();
        const symbol = await contractWithSigner.symbol();
        const logoUrl = "eth.jpg";
        let balance = "0";
        try {
          balance = await contractWithSigner.balanceOf(wallet.address);
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
      }catch(err){
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
    async getExchangeStatus({ commit, state }: any, call: Function = () => {}) {
      const wallet = await getWallet();
      const { address } = wallet;
      return checkAuth(address).then((res: any) => {
        commit("UPDATE_EXCHANGERSTATUS", res.data);
        call(res.data);
        return res.data;
      });
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
            // @ts-ignore
            tokens[i].balance = result[i].toString();
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
        const wallet = await getWallet();
        const contract = new ethers.Contract(
          tokenAddress,
          erc20Abi,
          wallet.provider
        );
        const contractWithSigner = contract.connect(wallet);
        console.warn("contractWithSigner--------------", contractWithSigner);
        return Promise.resolve(
          await contractWithSigner.balanceOf(wallet.address)
        );
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
      const pwd = getCookies("password");
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
      const mnemonic = await parseMnemonic(pwd);
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
    async getContractAddress({commit, state}: any) {
      try {
        const { ERBPay } = await getContractAddress()
        commit('UPDATE_CONTRACTADDRESS',ERBPay)
        return Promise.resolve(ERBPay)
      }catch(err){
        return Promise.reject(err)
      }
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
  symbol: string
) {
  const { from, to, value, nonce, hash } = tx;
  const { gasUsed, status, effectiveGasPrice, type } = receipt;
  const date = new Date();
  sessionStorage.setItem("receipt", JSON.stringify(receipt));
  sessionStorage.setItem("tx", JSON.stringify(tx));
  let newType = txType;
  // If it is a contract transaction and to is 0xFFFFFF, rewrite to swap type
  if (
    txType == TransactionTypes.contract &&
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
    symbol
  };
  return rec;
}
