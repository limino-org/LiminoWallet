import { NetWorkData } from '@/popup/enum/network'
import eventBus from '@/popup/utils/bus'
import { useStore } from 'vuex'
import { eventsEmitter } from '@/scripts/eventType';
import { web3 } from '@/popup/utils/web3'
import { sendBackground } from '../utils/sendBackground';
import { useBroadCast } from '@/popup/utils/broadCost'
const { broad } = useBroadCast();

export enum eventHandler {
    changeNetwork = 'changeNetwork',
    changeAccount = 'changeAccount',
    connect = 'connect',
    disconnect = 'disconnect'
}
import { getProvider, getWallet } from '@/popup/store/modules/account'
import store, {vuexLocal} from '../store';
import localforage from 'localforage';
import { getCookies } from '../utils/jsCookie';
import router from '../router';
import { useRoute } from 'vue-router';
// Global Event Management
export const useEvent = () => {

    const { dispatch, commit } = useStore()
    const { handleUpdate } = useBroadCast()
    // network Change
    eventBus.on(eventHandler.changeNetwork, async (network: NetWorkData) => {
        switch (store.state.account.coinType.value) {
            case 0:
                const provider = await getProvider();
                const net = await provider.getNetwork()
                const chainId = web3.utils.toHex(net.chainId)
                sendBackground({ method: eventsEmitter.chainChanged, response: { code: "200", data: chainId } })
                dispatch("system/getEthAccountInfo");
                break;
            case 1:
                dispatch("account/switchBTCNet", store.state.account.coinType);
                break;
        }
        handleUpdate()
    })
    // account Change
    eventBus.on(eventHandler.changeAccount, (address: string) => {
        console.warn('account change', store.state.account.coinType.value)
        switch (store.state.account.coinType.value) {
            case 0:
                dispatch("system/getEthAccountInfo");
                dispatch('account/getCreatorStatus', address)
                break;
            case 1:
                break;
        }
        sendBackground({method:eventsEmitter.accountsChanged, response:{code:'200',data:[address]}})
        handleUpdate()
    })



    
}


//  vuex hot update
broad.onmessage = async (e) => {
    const { data }: any = e;
    console.warn('onmessage', data,store.state.system.conversationId)
    const { action, id, states } = data;

    if (data && action) {
      // If the same-origin window updates the account
      if (
        action == "wromHoles-update" &&
        id != store.state.system.conversationId
      ) {
        console.warn('receipt states', states)
        const pwd = await getCookies()
        // Logon but route stay in login Page
        if(router.currentRoute.value.name == 'loginAccount-step1' && pwd){
            router.replace({name:'wallet'})
        }
        // pwd invalid
        if(!pwd) {
            router.replace({name:'loginAccount-step1'})
        }

        // store update
        const localStore = await localforage.getItem('vuex') || {}
        const newStore = states || localStore
        newStore.system.conversationId = store.state.system.conversationId
        store.replaceState(newStore)
        let time = setTimeout(() => {
            eventBus.emit('storeUpdate')
            clearTimeout(time)
        },1000)
      }
    }
  };