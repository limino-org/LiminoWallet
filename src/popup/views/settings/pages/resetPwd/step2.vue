<template>
    <NavHeader :title="t('setting.resetPwd')" :hasRight="true"></NavHeader>
  <WormTransition size="small">
    <template v-slot:icon>
      <img class="iconele flex center" src="@/assets/logoeth.png" />
    </template>
  </WormTransition>
  <div class="f-24 text-center text-bold mt-10">{{t('resetPwd.resetpasswords')}}</div>
  <div class="text-center text-bold f-12 tit-2 mt-14">{{t('resetPwd.enternewpassword')}}</div>
  <div class="pl-26 pr-26">
    <van-form @submit="onSubmit">
      <div class="label text-bold flex between">
        <span>{{t('resetPwd.newpassword')}}</span>
        <span>
          <i @click="toggleMask" :class="`iconfont hover ${mask ? 'icon-yanjing' : 'icon-yanjing1'}`"></i>
        </span>
      </div>
      <van-field
        v-model="password"
        maxlength="30"
        :type="`${mask ? 'password' : 'string'}`"
        :class="pwd1Err ? 'error' : ''"
        :placeholder="$t('resetPwd.input')"
        :rules="[

          {
            validator: asynPwd,
            message:
              t('createAccountpage.pwdWorng'),
          },
        ]"
      />

      <div class="label text-bold flex between mt-30">
        <span>{{t('resetPwd.confirmpasswords')}}</span>
        <span>
          <i @click="toggleMask2" :class="`iconfont hover ${
              mask2 ? 'icon-yanjing' : 'icon-yanjing1'
            }`"></i>
        </span>
      </div>
      <van-field
        v-model="password2"
        maxlength="30"
        :class="pwd2Err ? 'error' : ''"
        :type="`${mask2 ? 'password' : 'string'}`"
        :placeholder="$t('resetPwd.input')"
        :rules="[
          {
            validator: asynPwd2,
            message:
              t('createAccountpage.pwdWorng'),
          },
        ]"
      />
            <div class="btn-groups">
        <div class="container pl-28 pr-28">
          <van-button block type="primary" native-type="submit">
          {{
          t("resetPwd.confirm")
          }}
        </van-button>
        </div>
      </div>
    </van-form>
  </div>
</template>
<script lang="ts">
import WormTransition from '@/popup/components/wromTransition/index.vue'
import { Icon, Toast, Button, Sticky, Field, Form, CellGroup, Switch, Checkbox, CheckboxGroup } from 'vant'
import NavHeader from '@/popup/components/navHeader/index.vue'
import { createWalletByJson, CreateWalletByJsonParams } from '@/popup/utils/ether'
import { defineComponent, Ref, ref, watch, SetupContext, onBeforeMount, onBeforeUpdate, onMounted, nextTick } from 'vue'
import router from '@/popup/router'
import { setCookies } from '@/popup/utils/jsCookie'
// @ts-ignore
import { encrypt, decrypt } from '@/popup/utils/cryptoJS.js'
import { useI18n } from 'vue-i18n'
import { regPassword1 } from '@/popup/enum/regexp'
import { useStore } from 'vuex'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import localforage from 'localforage'
import { useToast } from '@/popup/plugins/toast'
import { useLogin } from "@/popup/components/navHeader/hooks/login";

export default {
  name: 'restPwd-step1',
  components: {
    WormTransition,
    [Field.name]: Field,
    [Form.name]: Form,
    [Button.name]: Button,
    NavHeader
  },
  setup() {
    const password = ref('')
    const password2 = ref('')
    const { t } = useI18n()
    const mask = ref(true)
    const router = useRouter()
    const route: any = useRoute()
    const { dispatch, state } = useStore()
    const mask2 = ref(true)
    const pwd1Err = ref(false)
    const pwd2Err = ref(false)
    const {$toast} = useToast()
    const { logout } = useLogin()
    const asynPwd = (val: string) => {
      pwd1Err.value = false
      if(!val) {
        pwd1Err.value = true
        return t('resetPwd.password1')
      }
      if (regPassword1.test(password.value)) {
        return true
      }
      pwd1Err.value = true
      return false
    }
    const asynPwd2 = (val: string) => {
      pwd2Err.value = false
      if(!val) {
        pwd2Err.value = true
        return t('resetPwd.password1')
      }
      if (regPassword1.test(password2.value)) {
        if(val == password.value) {
          return true
        } else {
          pwd2Err.value = true
          return t('createwallet.notmatch')
        }
      }
      pwd2Err.value = true
      return t('createAccountpage.pwdWorng')
    }
    const accountInfo = state.account.accountInfo

    const toggleMask = () => {
      mask.value ? (mask.value = false) : (mask.value = true)
    }
    const toggleMask2 = () => {
      mask2.value ? (mask2.value = false) : (mask2.value = true)
    }
    const pwd = ref()
    const checkPwd = async () => {
      if(!pwd.value) {
       // @ts-ignore
       pwd.value = await chrome.storage.local.get('comfirm_password')
       // @ts-ignore
       await chrome.storage.local.set({comfirm_password:''})
      }

      if (!pwd.value.comfirm_password) {
        router.back()
        return
      }
      const { keyStore } = accountInfo
      //Unlock the keyStore file of the current account with a password
      const data: CreateWalletByJsonParams = {
        password: pwd.value.comfirm_password,
        json: keyStore
      }
      try {
        await createWalletByJson(data)
      }catch(err){
        console.warn('err', err)
        router.back()
      }
    }
    onMounted(() => {
      checkPwd()
    })

    const onSubmit = async () => {
      if (password.value != password2.value) {
        Toast(t('createwallet.notmatch'))
        return
      }
      try {
        // Before resetting the password, re encrypt all cached keystores
        await dispatch('account/updateKeyStoreByPwd', password.value)
        $toast.success(t('resetPwd.resetsuccessful'))
        
        nextTick(async() => {
          await logout()
          router.replace({ name: 'loginAccount-step1' })
        })
      } catch (err) {
        console.log('err---', err)
        $toast.warn(t('resetPwd.failedtochange'))
      }
    }
    // Right cancel button

    return {
      password,
      onSubmit,
      pwd1Err,
      pwd2Err,
      t,
      asynPwd,
      asynPwd2,
      mask,
      toggleMask,
      mask2,
      toggleMask2,
      password2,
    }
  }
}
</script>
<style lang="scss" scoped>
.label {
  font-size: 12px;
  line-height: 16px;
  margin-bottom: 10px;
}
.iconele {
  width: 20px;
  // height: 60px;
}
.tit-2 {
  color: #848484;
  margin-bottom: 40px;
}
.icon-yanjing1 {
  color: #9F54BA;
}
.btn-groups {
  margin-top: 30px;
}
:deep(.van-field__label) {
  display: none;
}
:deep(.van-field__error-message) {
  // margin-bottom: 12px;
  line-height: 18px;
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
  margin-bottom: 5px;
  padding: 0 10px;
  border-radius: 5px;
  transition: ease 0.3s;
  font-size: 12px;
  &:hover {
    border: 1PX solid #9F54BA;
  }
}
</style>