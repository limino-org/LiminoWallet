import router from '@/popup/router'
import { getWallet, AccountInfo, wallet } from '@/popup/store/modules/account'
import eventBus from '@/popup/utils/bus'
import store from '@/popup/store/index'
import { useLogin } from '@/popup/components/navHeader/hooks/login'
import { getQuery } from '@/popup/utils/utils'
import { getCookies } from '../utils/jsCookie'
import { getURLPath } from '../utils/utils'
// Initialize wallet instance
export const useWallet = () => {
    const query = getQuery()
    const initWallet = async () => {
        const { dispatch } = store
        const { hasAccount } = useLogin()
        const hasAcc = await hasAccount()
        if(!hasAcc && !getCookies()){
            router.push({name:'loginAccount-step1', query:{...query,backUrl: getURLPath() } })
        }
        try {
            let newwallet = await getWallet()
            dispatch('account/updateAllBalance')
            eventBus.emit('walletReady', newwallet)
        } catch (err) {
            console.error(err)
            if (hasAcc) {
                router.replace({ name: "loginAccount-step1", query:{...query,backUrl: getURLPath()} })
            } else {
                router.replace({ name: 'guide-step1' })
            }
        }
    }
    return {
        initWallet
    }
}
