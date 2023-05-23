<template>
  <div class="page-sign1" @keydown.enter="goOn">
    <van-sticky>
      <NavHeader :hasRight="false" :hasLeft="false" title="LiminoWallet"></NavHeader>
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
      <div class="contract-info pb-20 pt-10 pl-20 pr-20">
        <div class="type pt-10 pb-10">{{t('sign.sign')}}</div>
        <div class="origin pt-10 pb-10">
          <div class="pl-10 pr-10 source flex center-v">
            {{ t('common.source') }}<span class="flex center-v van-ellipsis"
              ><img :src="senderData.tab.favIconUrl" alt="" />{{
                senderData.origin
              }}</span
            >
          </div>
        </div>
      </div>
      <div class="sign-info">
        <div class="title">{{t('sign.walletaddress')}}</div>
        <div class="value">{{ accountInfo.address }}</div>
        <div class="title">{{t('sign.signaturedata')}}</div>
        <div :class="`value hover ${signSelect ? 'focus' : ''}`" @click="toCopy">{{ sig }}</div>
      </div>

      <div class="btn-box">
        <div class="container flex between ml-24 mr-24">
          <van-button type="default" @click="cancel" plain>{{t('sign.cancel')}}</van-button>
          <van-button type="primary" @click="goOn" :loading="loading">{{t('sign.confirm')}}</van-button>
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
import { computed, onMounted, ref, Ref, Events, onUnmounted } from 'vue'
import useClipboard from 'vue-clipboard3'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { sendBackground } from '@/popup/utils/sendBackground'
import { handleType } from '@/scripts/eventType'

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
    const { signType, sig, sendId, sender }: any = query
    const senderData = JSON.parse(sender);
    const back = () => {
      router.replace({ name: 'wallet' })
    }
    const { toSign, password, sign, address }: any = useSign()
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
    const loading = ref(false)
    const goOn = () => {
      loading.value = true
      toSign({
        address: accountInfo.value.address,
        sig: sig,
        isAdmin: false,
        call: (str: string) => {
          sendBackground({method:signType,response:{code:'200',data: str, sendId}})
        }
      })
    }

    const cancel = () => {
      sendBackground({method:handleType.handleReject,response:{method:signType, sendId}})

    }
    const handleKeydown = (e: any) => {
      if(e.keyCode === 13) {
        goOn()
      }
    }
    onMounted(() => {
      window.addEventListener('keydown', handleKeydown)
    })
    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeydown)
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
      senderData,
      goOn,
      sig
    }
  }
}
</script>
<style lang="scss" scoped>
.contract-info {
  .origin {
    background: #f3f4f5;
    .source {
      img {
        width: 13px;
        margin-right: 5px;
      }
      span {
        width: 87%;
      }
    }
  }
  .type {
    width: auto;
    display: inline-block;
    border: 1px solid #ccc;
    text-align: center;
    padding: 10px;
    margin-bottom: 5px;
  }
}
.sign-bg-icon {
  i {
    font-size: 30px;
  }
}
.page-sign1 {
  padding-bottom: 100px;
  .back {
    font-size: 18px;
  }
  .btn-box {
    margin-top: 30px;
    .van-button {
      width: 160px;
    }
  }
  .sign-bg {
    background: #F8F3F9;
    height: 130px;
    &-icon {
      font-size: 40px;
      color: #9F54BA;
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
    margin: 0 20px;
    padding: 10px;
    max-height: 280px;
    min-height: 220px;
    border-radius: 4px;
    overflow-y: scroll;
    background: #f3f4f5;
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
      //   background: #9F54BA;
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
