import { NetWorkData } from '@/popup/enum/network'
import eventBus from '@/popup/utils/bus'
import { useStore } from 'vuex'
import { useBroadCast } from '@/popup/utils/broadCost'
import { eventsEmitter } from '@/scripts/eventType';
import  { web3 } from '@/popup/utils/web3'
import { sendBackground } from '../utils/sendBackground';
export enum eventHandler {
    changeNetwork = 'changeNetwork',
    changeAccount = 'changeAccount',
    connect = 'connect',
    disconnect = 'disconnect'
}
import {getWallet} from '@/popup/store/modules/account'
// Global Event Management
export const useEvent = () => {

    const { dispatch } = useStore()
    const { handleUpdate } = useBroadCast()
    // network Change
    eventBus.on(eventHandler.changeNetwork, async(network: NetWorkData) => {
        const wallet = await getWallet()
        const net = await wallet.provider.getNetwork()
        const chainId = web3.utils.toHex(net.chainId)
        sendBackground({method:eventsEmitter.chainChanged, response:{code:"200",data:chainId}})
        dispatch("account/getEthAccountInfo");
        handleUpdate()
    })
    // account Change
    eventBus.on(eventHandler.changeAccount, (address: string) => {
        sendBackground({method:eventsEmitter.accountsChanged, response:{code:'200',data:[address]}})
        dispatch("account/getEthAccountInfo");
        dispatch('account/getCreatorStatus', address)
        handleUpdate()
    })

}