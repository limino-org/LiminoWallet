import { NetWorkData } from '@/popup/enum/network'
import eventBus from '@/popup/utils/bus'
import { useStore } from 'vuex'
import { useBroadCast } from '@/popup/utils/broadCost'
import { eventsEmitter } from '@/scripts/eventType';
import { web3 } from '@/popup/utils/web3'
import { sendBackground } from '../utils/sendBackground';
export enum eventHandler {
    changeNetwork = 'changeNetwork',
    changeAccount = 'changeAccount',
    connect = 'connect',
    disconnect = 'disconnect'
}
import { getProvider, getWallet } from '@/popup/store/modules/account'
// Global Event Management
export const useEvent = () => {

    const { dispatch, state } = useStore()
    const { handleUpdate } = useBroadCast()
    // network Change
    eventBus.on(eventHandler.changeNetwork, async (network: NetWorkData) => {
        const provider = await getProvider();
        const net = await provider.getNetwork()
        const chainId = web3.utils.toHex(net.chainId)
        switch (state.account.coinType.value) {
            case 0:
                sendBackground({ method: eventsEmitter.chainChanged, response: { code: "200", data: chainId } })
                dispatch("system/getEthAccountInfo");
                break;
            case 1:
                break;
        }
        handleUpdate()
    })
    // account Change
    eventBus.on(eventHandler.changeAccount, (address: string) => {
        sendBackground({ method: eventsEmitter.accountsChanged, response: { code: '200', data: [address] } })
        switch (state.account.coinType.value) {
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