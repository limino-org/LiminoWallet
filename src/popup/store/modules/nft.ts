import { getWallet, handleGetTranactionReceipt, TransactionReceipt } from "./account";
import { toHex } from "@/popup/utils/utils";
import { Toast } from "vant";
import { utils } from "ethers";
import { web3 } from "@/popup/utils/web3";
import { clone } from 'pouchdb-utils';

import {
  getSnftOwner,
  collectionList,
  snftCollectionById,
} from "@/popup/http/modules/nft";
import { TransactionTypes } from "./account";
import { encode, decode } from 'js-base64';
import store from '@/popup/store/index'
interface GetNftPageIdxs {
  [key: string]: { total: string, page: string }
}
interface State {
  nftPageParams: GetNftPageIdxs
}
export default {
  state: {
    // Record NFT list loading of each account
    nftPageParams: {}
  },
  mutations: {
    // Page of current address+1
    addNftPage(state: State, opt) {
      const { page, address, total } = opt
      Object.keys(state.nftPageParams).forEach(key => {
        if (key == address) {
          state.nftPageParams[key].total = total
          state.nftPageParams[key].page = page + 1
        }
      })
    }
  },
  actions: {
    //   NFT to Erb
    async nftConver({ commit, state }: any, nft_address: string) {
      const wallet = await getWallet();
      const blockNumber = await wallet.provider.getBlockNumber()
      const { address } = wallet;
      const str = `wormholes:{"version": "0.0.1","type":6,"nft_address":"${nft_address}"}`;
      const data3 = toHex(str);
      const tx1 = {
        from: address,
        to: address,
        data: `0x${data3}`,
        value: '0',
      };
      sessionStorage.setItem('nft_address', nft_address)
      sessionStorage.setItem("blockNumber", blockNumber)
      const data = await store.dispatch('account/transaction', tx1)
      const receipt = await wallet.provider.waitForTransaction(data.hash)
      store.dispatch('account/waitTxQueueResponse')
      return receipt
    },
   // Personal casting NFT
   async nftCreate({ commit, state }: any, nft_data: any) {
    const wallet = await getWallet();
    const { address } = wallet
    const { royalty, meta_url, name, desc, category } = nft_data;
    const par = {
      version: '0.0.1',
      type: 0,
      royalty: royalty,
      exchanger: "",
      meta_url: web3.utils.fromUtf8(JSON.stringify(nft_data))
    }
    const parstr = `wormholes:${JSON.stringify(par)}`
    const newdata = web3.utils.fromUtf8(parstr)
    const tx = {
      from: address,
      to: address,
      data: newdata,
      value: "0",
    };
    const data = await store.dispatch('account/transaction', tx)
    store.dispatch('account/waitTxQueueResponse')
    return data
  },
  // Transfer NFT
  async send({ commit, state }: any, params: TransferData) {
    const wallet = await getWallet();
    const { address } = wallet
    const { nft_address, to, checkTxQueue } = params
    // Update recent contacts
    store.commit("account/PUSH_RECENTLIST", to);
    const str = `wormholes:{"version": "v0.0.1","type": 1,"nft_address":"${nft_address}"}`;
    console.warn('str----', str)
    const data3 =  web3.utils.fromUtf8(str);
    const tx = {
      from: address,
      to,
      data: data3,
    };
    console.warn('tx', tx)
    const data = await store.dispatch('account/transaction', tx)
    return data
  },

    // Get asset list according to owner
    async getSnftOwner({ commit, state }: any, page: string) {
      let opt = {
        owner: '',
        page,
        page_size: '256',
      };
      try {
        const { nfts, total } = await getSnftOwner(opt)
      } catch (err) {
        Toast(err)
      }
    }
  },
  namespaced: true,
};


export type TransferData = {
  nft_address: string,
  to: string,
  checkTxQueue: boolean
}