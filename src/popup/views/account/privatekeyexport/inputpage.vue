<template>
  <van-nav-bar :title="t('exportprivatekey.setting')" left-arrow @click-left="onClickLeft" />
  <div class="content">
    <div class="title">{{t('exportprivatekey.hint')}}</div>
    <div class="userwarning">
      <div class="warning-icon">
        <van-icon name="warning" style="color: #e78a93" />
      </div>
      <div class="user-title">
      {{t('exportprivatekey.warn')}}
      </div>
    </div>
    <div class="title">{{t('exportprivatekey.input')}}</div>
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          submit-on-enter
          v-model="password"
          type="password"
          name="password"
          :placeholder="$t('exportprivatekey.password')"
          :rules="[{ required: true, message: t('exportprivatekey.inputpassword') }]"
        />
      </van-cell-group>
      <div class="form-button">
        <van-button round block type="default" @click="empty">{{t('exportprivatekey.cancel')}}</van-button>
        <van-button :loading="accountLoading" round block plain type="primary" native-type="submit">{{t('exportprivatekey.submit')}}</van-button>
      </div>
    </van-form>
  </div>
</template>

<script lang="ts">
import { CreateWalletByJsonParams, CreateWalletByMnemonicParams } from '@/popup/utils/ether'
import { setCookies } from '@/popup/utils/jsCookie'
import { ref, Ref, computed, toRaw, SetupContext, onMounted } from 'vue'
import { Icon, NavBar, Form, Field, CellGroup, Button } from 'vant'
import { passwordExpires } from '@/popup/enum/time'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
export default {
  components: {
    [Icon.name]: Icon,
    [NavBar.name]: NavBar,
    [Form.name]: Form,
    [Field.name]: Field,
    [Button.name]: Button,
    [CellGroup.name]: CellGroup
  },
  setup() {
    const{t}=useI18n()
    const router = useRouter()
    const store = useStore()
    const { dispatch, commit, state } = store
    const onClickLeft = () => history.back()
    const empty = () => {
      password.value = ''
    }
    const password: Ref<string> = ref('')
    const accountLoading: Ref<boolean> = ref(false)
    const onSubmit = async (value: object) => {
      accountLoading.value = true
      const accountInfo = store.state.account.accountInfo
      const { keyStore } = accountInfo
      const { currentNetwork } = store.state.account
      const data: CreateWalletByJsonParams = {
        password: password.value,
        json: keyStore
      }
      try {
        await dispatch('account/createWalletByJson', data)
        dispatch('account/updateAccount', currentNetwork)
        dispatch('account/updateBalance')
        setCookies('password', password.value, passwordExpires)
        router.replace({ name: 'successpage' })
      } finally {
        accountLoading.value = false
      }
    }
    return {
      t,
      password,
      accountLoading,
      empty,
      onSubmit,
      onClickLeft
    }
  }
}
</script>

<style lang="scss" scoped>
.content {
  .title {
    margin: 17px 22px;
    font-size: 12px;
  }
  .userwarning {
    height: 70px;
    background-color: #fbf2f3;
    padding: 0 15px 0 0;
    line-height: 12px;
    font-size: 12px;
    display: flex;
    // justify-content: space-evenly;
    align-items: center;

    .warning-icon {
      margin-left: 22px;
    }
    .user-title {
      margin-left: 9px;
    }
  }

  .form-button {
    display: flex;
    margin: 50px 16px;
    button:nth-of-type(1){
      margin-right: 20px;
    }
  }
}

</style>