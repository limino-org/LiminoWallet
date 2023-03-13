import { getCurrentInstance, ComponentInternalInstance } from 'vue'
export type TradeConfirmType = {
    open: Function
    update: Function
    hide: Function
}
export const useTradeConfirm = () => {
    const { globalProperties } = (getCurrentInstance() as ComponentInternalInstance).appContext.config

    // @ts-ignore
    const $tradeConfirm: TradeConfirmType = globalProperties.$tradeConfirm
    return {
        $tradeConfirm
    }

}