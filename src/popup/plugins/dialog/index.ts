import { getCurrentInstance, ComponentInternalInstance } from 'vue'
import { ToastFuns } from "../toast/toast"
export const useDialog = () => {
    const { globalProperties } = (getCurrentInstance() as ComponentInternalInstance).appContext.config
    // @ts-ignore
    const $dialog: ToastFuns = globalProperties.$dialog
    return {
        $dialog
    }

}