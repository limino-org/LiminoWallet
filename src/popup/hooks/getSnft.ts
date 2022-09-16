// @ts-ignore
import usedb from '@/popup/utils/db.js'
import store from '@/popup/store/index'
import {
    getSnftOwner,
    collectionList,
    snftCollectionById,
  } from "@/popup/http/modules/nft";
import { useStore } from 'vuex';
import { computed } from 'vue';
export const useGetSnft = () => {
    console.log('usedb', usedb)
    const accountInfo = computed(() => store.state.account.accountInfo)
    const params = {
        owner: accountInfo.value.address,
        page: "0",
        page_size: '256',
    }
    
}