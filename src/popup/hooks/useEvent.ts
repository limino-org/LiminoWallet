import { NetWorkData } from '@/popup/enum/network'
import eventBus from '@/popup/utils/bus'
import { useStore } from 'vuex'
import { useBroadCast } from '@/popup/utils/broadCost'
import { eventsEmitter, getWallet } from '@/scripts/background';
import  { web3 } from '@/popup/utils/web3'
export enum eventHandler {
    changeNetwork = 'changeNetwork',
    changeAccount = 'changeAccount'
}

// Global Event Management
export const useEvent = () => {
    const { dispatch } = useStore()
    const { handleUpdate } = useBroadCast()
    // network Change
    eventBus.on(eventHandler.changeNetwork, async(network: NetWorkData) => {
        const wallet = await getWallet()
        const net = await wallet.provider.getNetwork()
        const chainId = web3.utils.toHex(net.chainId)
        // @ts-ignore Send to page
        const bg = chrome.extension.getBackgroundPage();
        bg.params[eventsEmitter.chainChanged].sendResponse({response: chainId})
        dispatch("system/getEthAccountInfo");
        handleUpdate()
    })
    // account Change
    eventBus.on(eventHandler.changeAccount, (address: string) => {
        // @ts-ignore Send to page
        const bg = chrome.extension.getBackgroundPage();
        bg.params[eventsEmitter.accountsChanged].sendResponse({response:address})
        dispatch("system/getEthAccountInfo");
        handleUpdate()
    })
}