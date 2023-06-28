<template>
  <div class="miners">
    <NavHeader :hasLeft="true" :hasRight="false" backUrl="wallet" cancelRouteName="autoExchange" :title="t('wallet.autoNFTexchange')"></NavHeader>
    <div class="miners-container">
      <div>
        <span class="text">{{$t('minerspledge.please')}}</span>
        <van-field v-model="nodeValue" :placeholder="t('minerspledge.please')" />
      </div>
      <div class="flex center-v between">
        <van-button color="#000000" class="btn" plain block @click="clickLeft">{{$t('minerspledge.cancel')}}</van-button>
        <van-button type="primary" class="btn" round block @click="next">{{$t('minerspledge.next')}}</van-button>
      </div>
    </div>
    <loading-view v-model:show="isLoading" v-model:currentRate="currentRate" v-model:speed="speed" v-model:rate="rate"></loading-view>
    <affirm-dialog v-model:show="isAffirmDialog"></affirm-dialog>
    <next-dialog v-model:show="nextShow" @success="nextSuccess"></next-dialog>
    <index-dialog
      v-model:nodeValue="nodeValue"
      v-model:show="dealShow"
      v-model:balance="balanceMoney"
      @changeAgreementShow="agreementShow = true"
      @success="indexSuccess"
    ></index-dialog>
    <agreement-view v-model:show="agreementShow" v-model:check="check"></agreement-view>
    <success-dialog v-model:show="isSuccess"></success-dialog>
  </div>
</template>
  <script lang="ts">
import { Icon, Sticky, Field, Button, Toast } from 'vant'
import NavHeader from '@/popup/components/navHeader/index.vue'
import { useRouter } from 'vue-router'
import { ref, nextTick } from 'vue'
import AffirmDialog from './components/affirmDialog.vue'
import NextDialog from './components/next.vue'
import SuccessDialog from './components/success.vue'
import LoadingView from '@/popup/components/minerpledge/loading.vue'
import AgreementView from '@/popup/components/minerpledge/agreement.vue'
import { RegUrl, RegNum1 } from '@/popup/enum/regexp'
import { ethers, utils } from 'ethers'
import { getWallet, wallet } from '@/popup/store/modules/account'
import { useI18n } from 'vue-i18n'

export default {
  name: 'minerpledge',
  components: {
    NavHeader,
    [Sticky.name]: Sticky,
    [Icon.name]: Icon,
    [Field.name]: Field,
    [Button.name]: Button,
    AffirmDialog,
    NextDialog,
    SuccessDialog,
    LoadingView,
    AgreementView
  },
  setup() {
    const { t } = useI18n()
    const router = useRouter()
    const clickLeft = () => {
      nodeValue.value = ''
      router.back()
    }
    let nodeValue = ref('')
    let isAffirmDialog = ref(false)
    let isLoading = ref(false)
    let currentRate = ref(0)
    let rate = ref(0)
    let speed = ref(0)
    let nextShow = ref(false)
    let dealShow = ref(false)
    let balanceMoney = ref(0)
    let agreementShow = ref(false)
    let check = ref(false)
    let next = async () => {
      currentRate.value = 0
      //First check if the node is input
      if (!nodeValue.value) {
        //Please enter the node URL
        Toast.fail(t('minerspledge.please'))
        return
      }
      isLoading.value = true
      let interval = setInterval(() => {
        currentRate.value += 4
        if (currentRate.value === 100) {
          clearInterval(interval)
        }
      })
      let closeAll = () => {
        clearInterval(interval)
        isLoading.value = false
        isAffirmDialog.value = true
      }
      //Check if the URL of the input node matches
      if (!RegUrl.test(nodeValue.value)) {
        //Incorrect input node URL
        closeAll()
        return
      } else {
        //Above if by executing the next step
        //Determine whether the current balance can be used as the miner's pledge amount
        try {
          const wallet = await getWallet()
          // debugger
          //Determine the current node URL
          let provider = ethers.getDefaultProvider(nodeValue.value)
          const newWallet: any = wallet.connect(provider)
          const balance = await newWallet.getBalance()
          console.log(balance)
          console.log('================banlance')
          let money = utils.formatEther(balance._hex)
          //Loading
          console.log(money)
          console.log('================money')
          //If there is a current balance, you can make adjustments to the pledge
          if (money >= 100000) {
            clearInterval(interval)
            isLoading.value = false
            nextShow.value = true
            balanceMoney.value = money
            console.log(balanceMoney)
            console.log('=========11111111=======')
            // })
          } else {
            closeAll()
          }
        } catch (error) {
          closeAll()
        }
      }
    }
    let nextSuccess = () => {
      nextShow.value = false
      nextTick(() => {
        dealShow.value = true
      })
    }
    let isSuccess = ref(false)
    let indexSuccess = () => {
      isSuccess.value = true
    }

    return {
      t,
      clickLeft,
      nodeValue,
      isAffirmDialog,
      isLoading,
      next,
      currentRate,
      rate,
      speed,
      nextShow,
      nextSuccess,
      dealShow,
      balanceMoney,
      agreementShow,
      check,
      isSuccess,
      indexSuccess
    }
  }
}
</script>
<style lang="scss" scoped>
.miners {
  .cancel {
    font-size: 12px;
    color: #9F54BA;
    i {
      font-size: 20px;
    }
  }
  .title {
    font-size: 17px;
  }
  .miners-container {
    height: calc(100vh - 48px);
    display: flex;
    flex-direction: column;
    align-content: space-between;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 35px 23px 37px 23px;
    .text {
      display: inline-block;
      margin-bottom: 15px;
      font-size: 14px;
    }
    :deep(){
      .van-cell {
      padding: 0;
    }
    .van-button--block {
      width: 160px;
    }
    .van-cell__value {
      width: 329px;
      height: 39px;
      line-height: 39px;
      padding-left: 15px;
      border-radius: 4px 4px 4px 4px;
      border: 1PX solid #68717b;
    }
    }
  }
}
</style>