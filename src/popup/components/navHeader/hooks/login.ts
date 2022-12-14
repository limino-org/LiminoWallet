import { useRouter } from "vue-router"
import { clearWallet } from '@/popup/store/modules/account'
import { useStore } from "vuex"
import { setCookies, getCookies, loginOut, hasLogin } from '@/popup/utils/jsCookie'
import { getQuery } from "@/popup/utils/utils"
import Vrouter from "@/popup/router";
import localforage from 'localforage'
export const useLogin = () => {
    const route = Vrouter.currentRoute.value;
    const router = Vrouter;
    // logout
    const logout = () => {
        clearWallet()
        loginOut()
        const query = getQuery()
        console.log('tologin', '0', query)
        router.replace({ name: "loginAccount-step1", query: query || {} })
    }
    // authentication
    const authentication = () => {
        // Authentication determines whether to log in. If no, the login page is displayed
        return hasLogin()
    }

    // Do you have an account
    const hasAccount = async () => {
        const vuex = await localforage.getItem('vuex') || null
        try {
            // @ts-ignore
            if (vuex && vuex.account.accountList.length) {
                return Promise.resolve(true)
            } else {
                return Promise.resolve(false)
            }
        } catch (err) {
            return Promise.resolve(false)
        }
    }
    return {
        logout,
        authentication,
        hasAccount
    }
}
