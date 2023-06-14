<template>
  <NavHeader :hasRight="false" :title="t('createAccountpage.mnemonicBtn')">
    <template v-slot:left>
     <span class="back hover f-12" @click="back">{{t('createAccountpage.back')}}</span>
    </template>
  </NavHeader>

<div>
  <!-- <div class="title">
    <img class="iconele flex center" src="@/assets/token/logowallet.png" alt />
    <div class="tit-big text-center f-24">{{t('createAccountpage.createAccount')}}</div>
    <div class="tit-small text-center f-12 mt-14 mb-30 lh-16">{{t('createAccountpage.setup')}}</div>
  </div> -->
<div class="title">
 <!-- <img class="iconele flex center" src="@/assets/token/logowallet.png" /> -->
<WromTransition size="small" >
<template v-slot:icon>
<img class="iconele flex center" src="@/assets/token/logowallet.png" />
</template>
</WromTransition>
<div class="tit-big text-center f-24 mt-10">
{{ t("createAccountpage.createAccount") }}
</div>
<div class="tit-small text-center f-12 mt-6  lh-16">
{{ t("createAccountpage.setup") }}
</div>
</div>

  <div class="create-new-password">
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <div class="text-bold f-12 mt-10 mb-10 lh-16 flex between">
          <span>{{t('createAccountpage.password')}}</span>
          <span>
            <i @click="toggleMask" :class="`iconfont hover ${choice ? 'icon-yanjing1' : 'icon-yanjing'}`"></i>
          </span>
        </div>
        <van-field
          :class="`${pwd1Err ? 'error' : ''}`"
          v-model="password"
          name="password"
          :type="`${choice ? 'text' : 'password'}`"
          :placeholder="$t('createAccountpage.passwordPlaceholder')"
          :rules="[
            // { required: true, message:t('createAccountpage.pwdRequired') },
            { validator: asynPwd, message: t('createAccountpage.pwdWorng') },
             ]"
        />
        <!-- <div class="tit-small f-12" v-if="password.length<6||password.length>20">{{$t('createAccountpage.pwdMessage')}}</div> -->
        <div class="text-bold f-12 mt-20 mb-10 lh-16 flex between">
          <span>{{t('createAccountpage.confirmPassword')}}</span>
        </div>
        <van-field
          v-model="password2"
          :type="`${choice ? 'text' : 'password'}`"
          name="password2"
          :class="` ${pwd2Err ? 'error' : ''}`"

          :placeholder="t('createAccountpage.confirmPassword')"
          :rules="[
              //  { required: true, message:t('createAccountpage.pwdRequired') },
            { validator: asynPwd2, message: t('createAccountpage.pwdWorng') },
            { validator: asynPwd3, message: t('createAccountpage.inconsistentPwd') },
            ]"
        />
      </van-cell-group>
      <div style="margin: 16px">
        <van-button
          :loading="loading"
          round
          block
          type="primary"
          native-type="submit"
        >{{t('createAccountpage.create')}}</van-button>
      </div>
    </van-form>
    <div class="pwd-tip">
        <i18n-t keypath="createAccountpage.pwdTip" tag="div" class="text-center mt-20 lh-16">
          <template v-slot:br><br></template>
          <template v-slot:link1><span class="hover" @click="routerTo('termsOfUse')">{{t('createAccountpage.link1')}}</span></template>
          <template v-slot:link2><span class="hover" @click="routerTo('privacyNotice')">{{t('createAccountpage.link2')}}</span></template>
        </i18n-t>
      </div>
  </div>

</div>


</template>
<script lang="ts">
import Vue, { nextTick, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { Icon, Toast, Button, Sticky, Field, Form, CellGroup, Switch, Checkbox, CheckboxGroup } from 'vant'
import { encryptPrivateKey, EncryptPrivateKeyParams } from '@/popup/utils/web3'
import { ref, Ref, computed, toRaw, SetupContext, onMounted } from 'vue'
import { setCookies } from '@/popup/utils/jsCookie'
import { passwordExpires } from '@/popup/enum/time'
import { web3 } from '@/popup/utils/web3'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { regPassword1 } from '@/popup/enum/regexp'
import { getPath } from '@/popup/utils/ether'
import { useBroadCast } from '@/popup/utils/broadCost'
import NavHeader from '@/popup/components/navHeader/index.vue'
import TermsService from '@/popup/components/termsservice/index.vue'
import PrivacyPolicy from '@/popup/components/privacypolicy/index.vue'
import localforage from 'localforage'
import WromTransition from '@/popup/components/wromTransition/index.vue'
import {VUE_APP_TERMSOFUSE,VUE_APP_PRIVACYNOTICE} from '@/popup/enum/env'

export default {
name: 'loginAccount-create-step1',
components: {
    [Button.name]: Button,
    [Sticky.name]: Sticky,
    [Form.name]: Form,
    [Field.name]: Field,
    [CellGroup.name]: CellGroup,
    [Switch.name]: Switch,
    [Checkbox.name]: Checkbox,
    [CheckboxGroup.name]: CheckboxGroup,
    PrivacyPolicy,
    TermsService,
    NavHeader,
    WromTransition,
 
},
setup() {
  const { t } = useI18n()
  const router = useRouter()
  const route = useRoute()
  const mnemonic = ref('')
  const store = useStore()
  const { commit, dispatch } = store
  const password: Ref<string> = ref('')
  const password2: Ref<string> = ref('')
  const loading = ref(false)
  const choice: Ref<boolean> = ref(false)
    const back = () => {
      router.back()
    }
  // Listen to the broadcast of the same source window
  const { handleUpdate } = useBroadCast()
    onBeforeMount(async() => {
        // @ts-ignore
      const mnc = await chrome.storage.local.get('mnemonic');
      if(mnc && mnc.mnemonic) {
       // @ts-ignore
       mnemonic.value = mnc && mnc.mnemonic ? mnc.mnemonic : ''
      // @ts-ignore
       await chrome.storage.local.set({mnemonic:''});
      } else {
        router.back()
      }
    })
  const onSubmit = async (value: object) => {
    console.log('submit', value)
    if (password.value == password2.value) {
      loading.value = true
      try {
        loading.value = true
        if (password.value == password2.value) {
          // Store password
          setCookies('password', password2.value, passwordExpires)
          const pathIndex = '0'
          const mnemonicParams: any = {
            pathIndex,
            path: getPath(pathIndex),
            phrase: mnemonic.value
          }
          await store
            .dispatch('account/createWalletByMnemonic', mnemonicParams)
            .then(async wallet => {
              const { privateKey, address } = wallet
              const params: EncryptPrivateKeyParams = {
                privateKey,
                password: password.value
              }
              // Storage password Generates a keystore file based on the password private key
              const keyStore = encryptPrivateKey(params)
              // Encrypt mnemonic storage according to password
              console.log('web3---------', web3)
              // const mnemonicData = encryptPrivateKey({
              //   privateKey: web3.utils.toHex(mnemonic.toString()),
              //   password: password.value
              // })
              // commit('mnemonic/UPDATE_MNEMONIC', mnemonicData)

                console.warn('mnemonic.toString()',mnemonic, mnemonic.value)
              const mnemonicData = encryptPrivateKey({
          privateKey: web3.utils.toHex(mnemonic.value.toString()),
          password: password.value,
        });
        // await localforage.setItem("mnemonic", mnemonicData);
        commit('mnemonic/UPDATE_MNEMONIC', mnemonicData)
            
              await dispatch('account/addAccount', {
                keyStore,
                mnemonic: mnemonicParams,
                address,
                imported: false
              })

              // Cryptographic mnemonic storage stores mnemonic words and paths
              commit('account/UPDATE_MNEMONIC', mnemonicParams)
              commit('account/UPDATE_WALLET', wallet)
              commit('account/UPDATE_KEYSTORE', keyStore)
              router.replace({
                name: 'loginAccount-createing'
              })
            })
            .finally(() => (loading.value = false))
          handleUpdate()
        } else {
          // The entered passwords are inconsistent
          Toast(t('importByMnemonic.notmatch'))
          loading.value = false
        }

      } catch (err) {
        console.error(err)
        loading.value = false
        Toast(t('createwallet.failed'))
      }
    } else {
      // The entered passwords are inconsistent
      Toast(t('createwallet.notmatch'))
    }
  }
  const pwd1Err= ref(false)
  const pwd2Err= ref(false)
  const asynPwd = (val: string) => {
    pwd1Err.value = false
    if(!val){
      pwd1Err.value = true
      return t('createAccountpage.pwdRequired')
    }
    if (regPassword1.test(password.value)) {
      return true
    }
    pwd1Err.value = true
    return false
  }
  const asynPwd2 = (val: string) => {
    pwd2Err.value = false
    if(!val){
      pwd2Err.value = true
      return t('createAccountpage.pwdRequired')
    }
    if (regPassword1.test(password2.value)) {
      return true
    }
    pwd2Err.value = true

    return false
  }
  const asynPwd3 = (val: string) => {
    pwd2Err.value = false
    if(!val){
      pwd2Err.value = true
      return t('createAccountpage.pwdRequired')
    }
    if (password2.value == password.value) {
      return true
    }
    pwd2Err.value = true

    return false
  }
  const toggleMask = () => {
    choice.value ? (choice.value = false) : (choice.value = true)
  }
  const modal1 = ref(false);
  const modal2 = ref(false);
  const routerTo = (name: any) => {
      if(name == 'termsOfUse') {
        window.open('https://limino.com/upload/tst.html')
      }
      if(name =='privacyNotice') {
        window.open('https://limino.com/upload/pn.html')
      }
    }
  return {
    t,
    password2,
    routerTo,
    password,
    onSubmit,
    choice,
    modal1,
    modal2,
    router,
    asynPwd3,
    asynPwd,
    asynPwd2,
    pwd1Err,
    pwd2Err,
    toggleMask,
    loading,
    back,
    VUE_APP_TERMSOFUSE,
    VUE_APP_PRIVACYNOTICE
  }
}
}
</script>
<style lang="scss" scoped>
.pwd-tip {
  span {
    color: #9F54BA;
  }
}
:deep(){
  .van-field.error {
  .van-field__body {
    border: 1px solid #D73A49;
    background: #FBF2F3;
  }
}
}
.pwd-tip {
a {
  color: #9F54BA;
}
}
.title {
font-weight: 600;
font-size: 16px;
}
  .iconele {
  width: 20px;
}

.create-new-password {
.tit-small {
  color: #848484;
}
.right {
  color: #9F54BA;
  text-decoration: underline;
}
.icon-yanjing1 {
  color: #9F54BA;
}
:deep(.van-field__label) {
  display: none;
}
:deep(.van-field__error-message) {
  margin-bottom: 12px;
}
:deep(.van-cell:after) {
  display: none;
}
:deep(.van-cell) {
  padding: 0;
}
:deep(.van-field__body) {
  height: 42px;
  border: 1PX solid #adb8c5;
  margin-bottom: 10px;
  padding: 0 10px;
  border-radius: 5px;
  transition: ease 0.3s;
  font-size: 12px;
  &:hover {
    border: 1PX solid #9F54BA;
  }
}
.tool {
  color: #9F54BA;
}
.pointer {
  cursor: pointer;
}
.check-box {
  margin-top: 30px;
}
}
</style>