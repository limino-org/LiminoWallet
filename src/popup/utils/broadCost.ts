

import store from '@/popup/store/index'
import localforage from 'localforage';
import { clone } from '../store/modules/account';

export const useBroadCast = () => {
    let broad: any =  {
        onmessage:(e: any) =>{},
        postMessage:(params: any) =>{},
    };
    try {
        broad = new BroadcastChannel('WormHoles-Wallet')
    }catch(err){
        console.error(err)
    }
    // broadcast
    const postMessage = (params: any) => {
        broad.postMessage(params)
    }
    
    // Wallet update event
    const handleUpdate = () => {
        postMessage({action:'wromHoles-update',id: store.state.system.conversationId, states: clone(store.state)})
 
    }
    return {
        postMessage,
        handleUpdate,
        broad
    }
}