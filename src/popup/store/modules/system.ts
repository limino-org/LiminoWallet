import { version } from "@/popup/enum/version";
import router from "@/popup/router";
import { useStore } from "vuex";
import { addressMask, decimal } from "@/popup/utils/filters";
import { erb_price } from '@/popup/http/modules/price'
import { getWallet } from '@/popup/store/modules/account'
import { useBroadCast } from '@/popup/utils/broadCost'
import localforage from 'localforage';
import store from '../index'

const { handleUpdate } = useBroadCast()
type WalletToken = {
  seconds: number
  time: number
  value: string | null
}
interface State {
  language: string;
  // List arrangement
  layoutType: string;
  amountType: string;
  exchangeBtnStatus: boolean;
  finishedGuide: boolean;
  // Last time the display of backup mnemonics was postponed
  lastDelayTime: null | number;
  // Value to guide user Popup
  show0: boolean,
  show1: boolean;
  show2: boolean;
  show3: boolean;
  show4: boolean;
  show5: boolean;
  show6: boolean;
  show7: boolean;
  show8: boolean;
  show9: boolean;
  show10: boolean;
  show11: boolean;
  show12: boolean;
  show13: boolean;
  show14: boolean;
  show15: boolean;
  show16: boolean;
  hasBackUpMnemonic: boolean
  ethAccountInfo: any
  transferUSDRate: number
  transferCNYRate: number
  conversationId: string
  wallet_token: WalletToken;
  chainVersion: string;
}
export default {
  state: {
    language: "",
    // Homepage NFT, list display method card list
    layoutType: "card",
    chainVersion:'',
    layoutList: [
      // Arrangement method list: list, card
      { value: "list", name: "list" },
      { value: "card", name: "card" },
    ],
    // Homepage wallet balance display method default: display mask: mask
    amountType: "mask",
    // One click exchange button to expand closing status
    exchangeBtnStatus: false,
    // Last login time
    lastDelayTime: null,
    // Whether mnemonic words have been backed up
    hasBackUpMnemonic: false,
    // Whether the guidance pop-up window ends
    finishedGuide: false,
    // Guide the user to use the pop-up window
    show0: true,
    show1: false,
    show2: false,
    show3: false,
    show4: false,
    show5: false,
    show6: false,
    show7: false,
    show8: false,
    show9: false,
    show10: false,
    show11: false,
    show12: false,
    show13: false,
    show14: false,
    show15: false,
    show16: false,
    // account details
    ethAccountInfo: null,
    // Exchange rate to USD
    transferUSDRate: 1,
    // RMB exchange rate
    transferCNYRate: 0.6,
    // Password encryption iv
    iv:'',
    conversationId:'',
    wallet_token:{
      seconds: 0,
      time: 0,
      value: null
    },
  },
  mutations: {
    UPDATE_CHAINVERSION(state: State, value: string) {
      state.chainVersion = value
    },
    UPDATE_LANGUAGE(state: State, value: string) {
      state.language = value;
    },
    UPDATE_LAYOUTTYPE(state: State, type: string) {
      state.layoutType = type;
    },
    UPDATE_AMOUNTTYPE(state: State, value: string) {
      state.amountType = value;
    },
    UPDATE_EXCHANGEBTNSTATUS(state: State, value: boolean) {
      state.exchangeBtnStatus = value;
    },
    UPDATA_SHOW(state: State, idx: number) {
      state[`show${idx}`] = true;
      handleUpdate()
    },
    UPDATA_HIDE(state: State, idx: number) {
      state[`show${idx}`] ? (state[`show${idx}`] = false) : "";
      handleUpdate()
    },
    UPDATE_GUIDEFLAG(state: State, val: boolean){
      state.finishedGuide = val
      handleUpdate()
    },
    UPDATE_HASBACKUPMNEMONIC(state: State, val: boolean){
      state.hasBackUpMnemonic = val
      handleUpdate()
    },
    UPDATE_LASTDELAYTIME(state:State, time: number){
      state.lastDelayTime = time
      handleUpdate()
    },
    UPDATA_ACCOUNTINFO(state: State, info: any) {
      state.ethAccountInfo = info
    },
    UPDATE_TRANSFERUSDRATE(state:State, val: number){
      state.transferUSDRate = val
    },
    UPDATE_TRANSFERCNYRATE(state:State, val: number){
      state.transferCNYRate = val
    },
    UPDATA_CONVERSATIONID(state: State, id: string) {
      state.conversationId = id
    },
    UPDATE_WALLET_TOKEN(state: State, token: WalletToken) {
      const {seconds,time,value} = token
      state.wallet_token = {
        seconds,
        time,
        value:''
      }
      handleUpdate()
    },
  },
  getters: {
    // Current account balance
    getAmount(state: State) {
      const store = useStore();
      const amount = store.state.account.accountInfo.amount;
      if (state.amountType == "mask") {
        return "********";
      } else {
        return decimal(amount);
      }
    },
    // Whether the pop-up window guides the pop-up window
    getGuideModal(state: State){
      const { finishedGuide } = state
      if(finishedGuide){
        return false
      } else {
        return true
      }
    }
  },
  actions: {
    // Set language
    setLanguage({ commit, state, dispatch }: any, lang: string) {
      commit("UPDATE_LANGUAGE", lang);
      return Promise.resolve(lang);
    },
    // Set NFT collection list arrangement
    setListLayout({ commit }: any, type: string) {
      commit("UPDATE_LAYOUTTYPE", type);
      return Promise.resolve(type);
    },
    // Switch balance display method
    toggleAmountType({ commit, state }: any) {
      const { amountType } = state;
      commit("UPDATE_AMOUNTTYPE", amountType == "mask" ? "default" : "mask");
    },
    // Switch the status of one touch exchange button
    toggleExchangeBtnStatus(
      { commit, state }: any,
      val: Boolean | null = null
    ) {
      const { exchangeBtnStatus } = state;
      if (val != null) {
        commit("UPDATE_EXCHANGEBTNSTATUS", val);
      } else {
        commit("UPDATE_EXCHANGEBTNSTATUS", exchangeBtnStatus ? false : true);
      }
      return Promise.resolve();
    },
    // Open pop-up window
    showDialog({ commit, state }: any, idx: number) {
      commit("UPDATA_HIDE", idx);
      if(idx === 6) {
        commit("UPDATA_SHOW", idx+2);
      }else {
        commit("UPDATA_SHOW", idx+1);
      }
    },
    // Turn off boot
    closeGuide({commit,state}:any){
      commit('UPDATE_GUIDEFLAG', true)
      for(let i = 1;i<14;i++){
        commit('UPDATA_HIDE', i)
      }
    },
    // Update login time
    setLoginTime({commit, state}: any, time: string) {
      commit('UPDATE_LASTLOGINTIME', time)
    },
    // Get account details
    async getEthAccountInfo({commit, state}: any){
      const wall = await getWallet()
      const { address } = wall
      wall.provider.send('eth_getAccountInfo',[address, "latest"]).then((res:any)=>{
        const data = {...res, ...res.Worm, status: 0}
        commit('UPDATA_ACCOUNTINFO', data)
      })
    },
    setConversationid({commit, state}: any, id: string) {
      commit('UPDATA_CONVERSATIONID',id)
    },
    async getChainVersion({commit, state}: any, wallet: any){
      const version =  await wallet.provider.send('eth_version')
      const { chainId } =  await wallet.provider.getNetwork()
      const { id } = store.state.account.currentNetwork
      const queryList = [
        `async-${id}-${chainId}`,
        `txQueue-${id}-${chainId}`,
        `txlist-${id}-${chainId}`
      ]
      
      const oldVersion = state.chainVersion
      if(oldVersion && version != oldVersion) {
        localforage.iterate((value, key, iterationNumber) => {
          console.log('clear cancel', key)
          if (key !== "vuex") {
            const flag = queryList.some(str => key.indexOf(str) > -1)
            console.log('clear cancel', key)
            if(flag){
              localforage.removeItem(key);
            }
          } else {
            [key, value]
          }
        });
      }
      commit('UPDATE_CHAINVERSION', version)
    },
  },
  namespaced: true,
};
