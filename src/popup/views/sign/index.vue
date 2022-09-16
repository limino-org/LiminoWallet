<template>
  <div class="page-sign1">
    <van-sticky>
      <NavHeader :hasRight="false" :hasLeft="false">
        <template v-slot:title>
          <div class="flex center">
            <span class="f-16">WormHoles</span>
          </div>
        </template>
      </NavHeader>
    </van-sticky>
    <div class="page-container">
      <div class="sign-bg flex center">
        <div>
          <div class="text-center sign-bg-icon">
            <i class="iconfont icon-dianziqianmingyuedingshu201"></i>
          </div>
          <div class="text-center sign-bg-tit">{{t('sign.signatureIdentification')}}</div>
          <div class="text-center sign-bg-tit1">{{t('sign.confirmsignaturedata')}}</div>
        </div>
      </div>
      <div class="sign-info">
        <div class="title">{{t('sign.walletaddress')}}</div>
        <div class="value">{{ accountInfo.address }}</div>
        <div class="title">{{t('sign.signaturedata')}}</div>
        <div class="flex center" v-if="loading">
          <van-loading color="#1989fa" />
        </div>
        <div v-else :class="`value hover ${signSelect ? 'focus' : ''}`" @click="toCopy">{{ sig }}</div>
      </div>

      <div class="btn-box">
        <div class="container flex between ml-24 mr-24">
          <van-button type="default" @click="cancel" plain>{{t('sign.cancel')}}</van-button>
          <van-button type="primary" @click="goOn">{{t('sign.confirm')}}</van-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
// Single signature data
import { Loading, Sticky, Icon, Field, Button, Toast } from 'vant'
import NavHeader from '@/popup/components/navHeader/index.vue'
import { useRoute, useRouter } from 'vue-router'
import { useSign } from './hooks/sign'
import { computed, onMounted, ref, Ref } from 'vue'
import useClipboard from 'vue-clipboard3'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { handleType } from '@/scripts/background'

export default {
  name: 'sign',
  components: {
    [Loading.name]: Loading,
    [Icon.name]: Icon,
    [Sticky.name]: Sticky,
    [Field.name]: Field,
    [Button.name]: Button,
    NavHeader
  },
  setup() {
    const { t } = useI18n()
    const store = useStore()
    const accountInfo = computed(() => store.state.account.accountInfo)
    const router = useRouter()
    const { query } = useRoute()
    const { signType, sig } = query
    const back = () => {
      router.replace({ name: 'wallet' })
    }
    const { toSign, loading, password, sign, address }: any = useSign()
    const signSelect: Ref<boolean> = ref(false)
    const { toClipboard } = useClipboard()
    const toCopy = async () => {
      if (!sig) {
        Toast(t('sign.ready'))
        return
      }
      try {
        await toClipboard(`${sig}`)
        signSelect.value = true
        Toast.success(t('sign.copy'))
      } catch (e) {
        console.error(e)
      }
    }
    const goOn = () => {
      if (!sign.value) {
        Toast(t('sign.ready'))
        return
      }
      // @ts-ignore
      const bg = chrome.extension.getBackgroundPage()
      console.log('bg.params', bg.params)
      bg.params[signType].sendResponse({ response: sign.value })
    }

    const cancel = () => {
      // @ts-ignore
      const bg = chrome.extension.getBackgroundPage()
      bg.handleReject(signType)
      bg.closePopup(signType)
    }
    onMounted(() => {
      toSign()
    })
    return {
      t,
      back,
      cancel,
      loading,
      toSign,
      password,
      sign,
      address,
      toCopy,
      signSelect,
      router,
      accountInfo,
      goOn,
      sig
    }
  }
}
</script>
<style lang="scss" scoped>
.page-sign1 {
  padding-bottom: 100px;
  .back {
    font-size: 18px;
  }
  .btn-box {
    position: fixed;
    bottom: 50px;
    left: 0;
    right: 0;
    .van-button {
      width: 160px;
    }
  }
  .sign-bg {
    background: #f4faff;
    height: 135px;
    &-icon {
      font-size: 40px;
      color: #037cd6;
    }
    &-tit {
      line-height: 20px;
      font-size: 15px;
      font-weight: bold;
      margin-top: 5px;
    }
    &-tit1 {
      font-size: 12px;
      line-height: 16px;
      margin-top: 7.5px;
    }
  }
  .sign-info {
    margin: 25px 27px;
    padding: 15px;
    max-height: 327px;
    border-radius: 4px;
    overflow-y: scroll;
    border: 1PX solid #e4e7e8;
    div {
      word-break: break-all;
      font-size: 14px;
    }
    .title {
      line-height: 30px;
    }
    .value {
      line-height: 14px;
      // &.select {
      //   background: #1989fa;
      //   color:#fff;
      // }
      &:nth-of-type(1) {
        margin-bottom: 20px;
      }
    }
    .value.focus {
      background: #3897f7;
      color: #fff;
      outline: none;
      display: inline;
      animation: select 200ms step-end forwards;
    }
  }

  @keyframes select {
    to {
      -webkit-user-select: text;
      user-select: text;
    }
  }
}
</style>
