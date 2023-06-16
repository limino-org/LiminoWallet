import { useRoute } from 'vue-router'
import { useStore } from 'vuex';
import { Toast } from 'vant';
import { onMounted, ref, Ref } from 'vue';
import { ethers } from 'ethers';
import { ConnectWalletByPwdAddress, getWallet } from '@/popup/store/modules/account'
import { getCookies } from '@/popup/utils/jsCookie';
import i18n from '@/popup/language/index'
import router from '@/popup/router';
export const useSign = () => {
    const { global: { t } } = i18n
    const route = useRoute()
    const { query } = route
    const { dispatch, state } = useStore()
    const sign: Ref<string> = ref('')
    /**
     * address string
     * sig  
     */
    let { address, data: queryStr } = query
    const loading:Ref<boolean> = ref(false)

    const toSign = async () => {
        const password = await getCookies('password')
        if(!queryStr){
            Toast(i18n.global.t('sign.signature'))
            return
        }
        if(!password){
            Toast(i18n.global.t('sign.password'))
            router.replace({name: "loginAccount-step1",})
            return 
        }
        loading.value = true
        const params: ConnectWalletByPwdAddress = {
            password,
            address: address?.toString() || ''
        }
        dispatch('account/connectWalletByPwdAddress', params).then(async (wallet) => {
            console.log('wallet', wallet)
            try {
                sign.value = await wallet.signMessage(queryStr).catch((err: Error) => Toast(err)).finally(() => loading.value = false)
            } catch(err: any){
                Toast(err || t('sign.unknownmistake'))
            }
        }).catch(err => Toast(err)).finally(() => loading.value = false)
    }
    return {
        toSign,
        loading,
        sign,
        address,
    }
}


interface SignParams {
    address: string
    sig: string
    call: Function
}