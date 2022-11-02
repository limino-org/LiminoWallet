import router from '@/popup/router'
import { getWallet, AccountInfo, wallet } from '@/popup/store/modules/account'
import eventBus from '@/popup/utils/bus'
import store from '@/popup/store/index'
import { useLogin } from '@/popup/components/navHeader/hooks/login'
import { getQuery } from '@/popup/utils/utils'
import { getCookies } from '../utils/jsCookie'
import { getURLPath } from '../utils/utils'
export const useWallet = () => {
    const query = getQuery()
    const initWallet = async () => {
        const { dispatch } = store
        const { hasAccount } = useLogin()
        const hasAcc = await hasAccount()
        const password = await getCookies()
        if(!hasAcc) {
            router.replace({ name: 'guide-step1'})
        }
        try {
            let newwallet = await getWallet()
            dispatch('account/updateAllBalance')
            eventBus.emit('walletReady', newwallet)
        } catch (err) {
            console.log('err', err.toString())
            if(err.toString().indexOf('invalid password') > -1) {
                router.replace({ name: "loginAccount-step1", query:{...query,backUrl: getURLPath()} })
                return 
            }
            if(hasAcc && !password) {
               router.replace({ name: "loginAccount-step1", query:{...query,backUrl: getURLPath()} })
               return
            }
            if(!hasAcc && !password) {
                router.replace({ name: 'guide-step1'})
            }
        }
    }
    return {
        initWallet
    }
}