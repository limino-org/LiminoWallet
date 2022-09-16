// @ts-nocheck
import localforage from 'localforage';
window.localforage = localforage
console.warn('localforage', localforage)
import { clone } from 'pouchdb-utils';
import { createStore } from 'vuex'
import common from './modules/common'
import account from './modules/account'
import price from './modules/price'
import system from './modules/system'
import transfer from './modules/transfer'
import nft from './modules/nft'
import VuexPersistence from 'vuex-persist';

const vuexLocal = new VuexPersistence({
  storage: localforage,
  asyncStorage: true,
  reducer: (store) => {
    // console.warn('-----------------------',store)
    const {
      account,
      common,
      nft,
      price,
      system,
      transfer
    } = store
    const {
      amountType,
      ethAccountInfo,
      exchangeBtnStatus,
      finishedGuide,
      hasBackUpMnemonic,
      language,
      lastDelayTime,
      layoutType,
      show0,
      show1,
      show2,
      show3,
      show4,
      show5,
      show6,
      show7,
      show8,
      show9,
      show10,
      show11,
      show12,
      show13,
      show14,
      show15,
      show16
    } = system
    return clone(({
      account,
      common,
      nft,
      price,
      transfer,
      system: {
        amountType,
        ethAccountInfo,
        exchangeBtnStatus,
        finishedGuide,
        hasBackUpMnemonic,
        language,
        lastDelayTime,
        layoutType,
        show0,
        show1,
        show2,
        show3,
        show4,
        show5,
        show6,
        show7,
        show8,
        show9,
        show10,
        show11,
        show12,
        show13,
        show14,
        show15,
        show16
      }
    }))
  },
});

const store = createStore({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    account,
    price,
    system,
    common,
    transfer,
    nft
  },
  plugins: [
    vuexLocal.plugin
  ]
})


window.store = store
export default store
export interface StoreReturns {
  [key: string]: any
}