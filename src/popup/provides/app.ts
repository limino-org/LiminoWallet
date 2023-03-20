import { useRouter } from "vue-router"
import { useStore } from "vuex"
import { InjectionKey, Ref } from 'vue'
export const provide = () => {
    const router = useRouter()
    const store = useStore()
    return {
        back(){
            router.back()
        },
        wallet(){
            return store.getters['account/wallet']
        },
        backHome(){
            router.replace({name:'wallet'})
        }
    }
}

export interface AppProvide {
    back: InjectionKey<void>,
    backHome: InjectionKey<void>,
    wallet: InjectionKey<Ref<any>>
}