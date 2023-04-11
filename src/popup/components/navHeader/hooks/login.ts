import { useRouter } from "vue-router"
import { clearWallet } from '@/popup/store/modules/account'
import { useStore } from "vuex"
import { setCookies, getCookies, loginOut, hasLogin } from '@/popup/utils/jsCookie'
import { getQuery } from "@/popup/utils/utils"
import { sendBackground } from '@/popup/utils/sendBackground';

import Vrouter from "@/popup/router";
import localforage from 'localforage'
import eventBus from "@/popup/utils/bus"
import { eventsEmitter } from "@/scripts/eventType"
import { useBroadCast } from '@/popup/utils/broadCost'

export const useLogin = () => {
    const { handleUpdate } = useBroadCast()
    const route = Vrouter.currentRoute.value;
    const router = Vrouter;
    // logout
    const logout = async () => {
        clearWallet()
        await loginOut()
        eventBus.emit('disconnect')
        const query = getQuery()
        sendBackground({method: eventsEmitter.logout, response:{code:'200',data: false}})
        handleUpdate()
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
                return true
            } else {
                return false
            }
        } catch (err) {
            return false
        }
    }
    return {
        logout,
        authentication,
        hasAccount
    }
}
