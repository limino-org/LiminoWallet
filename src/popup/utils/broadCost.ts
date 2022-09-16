

import store from '@/popup/store/index'

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
    // 广播
    const postMessage = (params: any) => {
        broad.postMessage(params)
    }
    // 钱包更新事件
    const handleUpdate = () => {
        // @ts-ignore
        postMessage({action:'wromHoles-update',id: store.state.system.conversationId})
    }
    return {
        postMessage,
        handleUpdate,
        broad
    }
}