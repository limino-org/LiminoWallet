import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex';
import { Toast } from 'vant';
import { onMounted, ref, Ref } from 'vue';
import { ethers } from 'ethers';
import { ConnectWalletByPwdAddress } from '@/popup/store/modules/account'
import { getCookies } from '@/popup/utils/jsCookie';
import i18n from '@/popup/language/index'
import { createWalletByJson } from '@/popup/utils/ether';
export const useSign = () => {
    const { global: { t } } = i18n
    const route = useRoute()
    const router = useRouter()
    const { query } = route
    const { dispatch, state } = useStore()
    const sign: Ref<string> = ref('')
    /**
     * address string
     * sig  Hex 
     * backUrl  
     */
    let { address, sig, backUrl: back } = query
    let isAdmin:Boolean = true
    const loading:Ref<boolean> = ref(false)
    const backUrl: Ref<string> = ref('')
    // Link the address wallet first
    const toSign = async(opt: SignParams) => {
        const password = await getCookies('password')
        let call: Function = () => {}
        if(opt){
            address =  opt.address
            sig = opt.sig
            call = opt.call ? opt.call : () =>{}
            isAdmin = typeof opt.isAdmin == 'boolean' ? opt.isAdmin : true
        }
        if(!sig){
            Toast(i18n.global.t('sign.signature'))
            return
        }
        if(!password){
            Toast(i18n.global.t('sign.password'))
            router.replace({ name: "withpassword" });
            return 
        }
        loading.value = true
        const params: ConnectWalletByPwdAddress = {
            password,
            address: address?.toString() || ''
        }
        return dispatch('account/connectWalletByPwdAddress', params).then(async (wallet) => {
            console.log('wallet', wallet)
            try {
                const sstr = sig
                console.warn('sstr-----------------', sstr, isAdmin)
                if(isAdmin){
                    //@/popupts-ignore   Sign the hash string
                    sign.value = ethers.utils.joinSignature(new ethers.utils.SigningKey(wallet.privateKey).signDigest(sstr))
                    backUrl.value = `${back || ''}?sig=${sign.value}`
                } else {
                   sign.value = await wallet.signMessage(sstr)
                }
                call(sign.value)
                return Promise.resolve(sign.value)
            } catch(err: any){
                console.error(err || t('sign.unknownmistake'))
                Toast(err || t('sign.unknownmistake'))
            }
        }).catch(err => Toast(err)).finally(() => loading.value = false)
        
    }
    return {
        toSign,
        loading,
        sign,
        address,
        backUrl
    }
}


interface SignParams {
    address: string
    sig: string
    call?: Function
    isAdmin?: Boolean
}