<template>
  <div class="accept-popup">
    <div class="accept-popup-top van-hairline--top-bottom"></div>
    <div class="text-center accept-popup-tit">{{t('send.title')}}</div>
    <div class="flex center">
      <div class="code"></div>
    </div>
    <div class="text-center scan-code-tit">{{t('send.sendtitle')}}</div>
    <!-- Copy the address -->
    <div class="flex center">
      <div class="flex copy-info center">
        <div class="address">{{addressMask(accountInfo.address)}}</div>
        <span class="copy-btn" @click="toCopy">{{t('send.tocopy')}}</span>
        <!-- <van-icon name="share-o" /> -->
        <i class="iconfont icon-fenxiang"></i>
      </div>
    </div>
    <!-- request payment -->
    <div class="request-box">
      <van-button plain block type="primary" @click="toPayment">{{t('send.sendbutton')}}</van-button>
    </div>
  </div>
</template>

<script lang="ts">
import { SetupContext, Ref, ref, reactive, defineComponent, computed } from 'vue'
import { Icon, Button, Popup, Toast } from 'vant'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { addressMask } from '@/popup/utils/filters'
import useClipboard from 'vue-clipboard3'
import { useI18n } from 'vue-i18n'
export default defineComponent({
  name: 'acceptCode',
  components: {
    [Icon.name]: Icon,
    [Popup.name]: Popup,
    [Button.name]: Button
  },
  props: {},
  setup(props: any, context: SetupContext) {
    const {t}=useI18n()
    const store = useStore()
    const { emit } = context
    const accountInfo = computed(() => store.state.account.accountInfo)
    const router = useRouter()
    const toPayment = () => {
      emit('handleToStep1')
      router.push({
        name: 'step1'
      })
    }
    // Copy the address
    const { toClipboard } = useClipboard()
    const toCopy = async () => {
      try {
        await toClipboard(`${accountInfo.value.address}`)
        Toast.success(t('copy.title'))
      } catch (e) {
        console.error(e)
      }
    }
    return {
      t,
      toPayment,
      accountInfo,
      addressMask,
      toCopy
    }
  }
})
</script>

<style lang="scss" >
.accept-popup {
  height: 450px;
  &-top {
    height: 30px;
  }
  &-tit {
    line-height: 21px;
    font-size: 15px;
    margin: 13px 0 10px 0;
  }
  .code {
    width: 182px;
    height: 182px;
    background: lightcyan;
  }
  .scan-code-tit {
    line-height: 17px;
    font-size: 12px;
    color: #757780;
    margin: 14px 0 16px;
  }
  .copy-info {
    width: 180px;
    background: rgba(241, 243, 244, 1);
    font-size: 12px;
    height: 44px;
    border-radius: 22px;
    line-height: 44px;
    text-align: center;
    padding-right: 10px;
    .address {
      width: 122px;
      color: rgba(95, 97, 106, 1);
    }
    .copy-btn {
      width: 33px;
      background-color: rgba(216, 216, 216, 1);
      line-height: 20px;
      height: 20px;
      border-radius: 10px;
    }
    i {
      color: rgba(95, 97, 106, 1);
      margin-left: 10px;
    }
  }
  .request-box {
    padding: 0 25px;
    margin-top: 10px;
  }
}
</style>
