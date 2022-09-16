<template>
  <div class="transaction-detail">
    <div class="title f-16 text-center van-hairline--bottom">{{t('transactionDetails.transationHistoryDetails')}}</div>
    <div class="transaction-detail-tit flex center">
      <!-- <van-icon name="cross" @click="handleClose" /> -->
      <div>
        <div class="flex center icon-box mt-30">
          <div class="icon-box-br van-hairline--surround flex center">
            <i class="iconfont icon-teshujiantouzuoxiantiao-copy" v-if="
                accountInfo.address.toUpperCase() == data.from.toUpperCase()
              "></i>
          </div>
        </div>
        <div class="text-center text-tit mt-8">{{ transactionTarget(accountInfo, data) }}</div>
      </div>
    </div>
    <div class="tran-form ml-12 mr-12 mt-20">
      <div class="form-box ml-14 mr-14">
        <div class="card flex between card-border">
          <div class="label">{{t('transactionDetails.status')}}</div>
          <div :class="`value flex right center-v status${data.status}`">
            <span>{{ transactionStatus(data.status) }}</span>
          </div>
        </div>
        <div class="card flex between card-border">
          <div class="label">{{t('transactionDetails.date')}}</div>
          <div class="value">
            {{ formatDate(data.date, "MM/DD") }}
            {{$t('transactionDetails.at')}}
            {{ formatDate(data.date, "HH:mm ") }}
          </div>
        </div>
        <div class="card flex between">
          <div class="label">{{t('transactionDetails.from')}}</div>
          <div class="value">{{ addressMask(data.from) }}</div>
        </div>
        <div class="card flex between  card-border">
          <div class="label">{{t('transactionDetails.to')}}</div>
          <div class="value">{{ addressMask(data.to) }}</div>
        </div>
        <div class="card flex between  card-border">
          <div class="label">{{t('transactionDetails.nonce')}}</div>
          <div class="value">#{{ data.nonce }}</div>
        </div>
        <div class="card flex between">
          <div class="label">{{t('transactionDetails.transferAmount')}}</div>
          <div class="value">{{ utils.formatEther(data.value) }} {{currentNetwork.currencySymbol}}</div>
        </div>
        <div class="card flex between">
          <div class="label">{{t('transactionDetails.gasfee')}}</div>
          <div class="value">{{ gasFee}} {{currentNetwork.currencySymbol}}</div>
        </div>
        <div class="card flex between">
          <div class="label">{{t('transactionDetails.totalAmount')}}</div>
          <div class="value">{{ totalAmount }} {{currentNetwork.currencySymbol}}</div>
        </div>
      </div>
    </div>
    <div class="flex pb-24 mt-22 btn-group">
      <van-button block @click="cancel">{{t('transactionDetails.cancel')}}</van-button>
      <van-button block type="primary" @click="view">{{t('transactionDetails.viewDetails')}}</van-button>
    </div>
  </div>
</template>

<script lang="ts">
import { SetupContext, Ref, ref, reactive, onMounted, defineComponent, computed } from 'vue'
import { Icon, Toast, Button } from 'vant'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { transactionTarget, formatDate, addressMask, formatEther, transactionStatus, parseEther } from '@/popup/utils/filters'
import { utils } from 'ethers'
import { useGasPrice } from '@/popup/hooks/useGasPrice'
import { copy } from '@/popup/utils/utils'
import { useI18n } from 'vue-i18n'
import BigNumber from 'bignumber.js'
export default defineComponent({
  name: 'transactionDetail',
  emits: ['handleClose'],
  components: {
    [Icon.name]: Icon,
    [Button.name]: Button
  },
  props: {
    data: {
      type: Object,
      default: {}
    }
  },
  setup(props: any, context: SetupContext) {
    const { t } = useI18n()
    const { emit } = context
    const store = useStore()
    const accountInfo = computed(() => store.state.account.accountInfo)
    const currentNetwork = computed(() => store.state.account.currentNetwork)
    const handleClose = () => {
      emit('handleClose')
    }
    const toCopy = () => {
      copy(props.data.hash).then(res => {
        Toast.success(t('copy.titlehash'))
      })
    }
    const tolink = () => {
      console.log(currentNetwork.value.browser)
    }
    // aggregate amount
    const totalAmount = computed(() => {
      const am = gasFee.value.plus(utils.formatEther(props.data.value)).toString()
      return am
    })

    // gas= gasLimit * gasPrice
    const gasFee = computed(() => {
      const price = new BigNumber(utils.formatEther(props.data.effectiveGasPrice)).multipliedBy(1000000000)
      const gasuse = new BigNumber(utils.formatEther(props.data.gasUsed)).multipliedBy(1000000000)
      return gasuse.multipliedBy(price)
    })
    const view = () => {
      console.log(`${currentNetwork.value.browser}/Transaction_Details?id=${props.data.hash}`)
      window.open(`${currentNetwork.value.browser}/Transaction_Details?id=${props.data.hash}`)
    }
    const cancel = () => {
      emit('handleClose')
    }
    return {
      t,
      cancel,
      view,
      handleClose,
      transactionTarget,
      formatDate,
      addressMask,
      accountInfo,
      formatEther,
      parseEther,
      toCopy,
      utils,
      currentNetwork,
      tolink,
      totalAmount,
      transactionStatus,
      gasFee
    }
  }
})
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
