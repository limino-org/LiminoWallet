<template>
  <div class="currency">
    <div class="currency-bd">
      <div class="flex center">
        <div class="flex center currency-icon" v-for="item in accountInfo.token" :key="item">
          <img class="currency-symbol" v-if="item" src="@/assets/icon_black.svg" />
        </div>
      </div>
      <div class="amount text-center text-bold pl-14 pr-14">{{ decimal(pageData.data.balance) }} {{ pageData.data.name }}</div>
      <div class="f-12 text-center lh-16 mt-6 balance">{{toUsdSymbol(pageData.data.balance)}}</div>
      <div class="flex center">
        <div class="actions-list flex between">
          <div class="actions-list-card">
            <div class="actions-list-card-icon flex center" @click.stop="toogleAcceptCode">
              <i class="iconfont icon-teshujiantouzuoxiantiao"></i>
            </div>
            <div class="actions-list-card-label text-center">{{ t("wallet.recive") }}</div>
          </div>
          <div class="actions-list-card" @click="toSend">
            <div class="actions-list-card-icon flex center">
              <i class="iconfont icon-teshujiantouzuoxiantiao-copy"></i>
            </div>
            <div class="actions-list-card-label text-center">{{ t("wallet.send") }}</div>
          </div>
          <div class="actions-list-card">
            <div class="actions-list-card-icon flex center" @click="toSwap">
              <i class="iconfont icon-icon_huabanfuben"></i>
            </div>
            <div class="actions-list-card-label text-center">{{ t("wallet.swap") }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="swap-list van-hairline--top">
      <CollectionCard @handleClick="handleView(item)" v-for="item in txList" :key="item.address" :data="item" />
      <no-data v-if="!txList.length" />
      <!-- View transaction details -->
      <van-dialog v-model:show="showTransactionModal" :showCancelButton="false" :showConfirmButton="false" closeOnClickOverlay>
        <TransactionDetail @handleClose="handleClose" :data="transactionData.data" />
      </van-dialog>
    </div>


  </div>
      <van-sticky offset-bottom="100" position="bottom">
    <div class="flex center fixed-bottom">
      <div class="container">
        <span class="f-12 view-history hover" @click="toBrowser">{{t('wallet.toBrowser')}}</span>
      </div>
    </div>
    </van-sticky>
</template>
<script lang="ts">
import { ref, Ref, reactive, onMounted, computed, toRefs, onBeforeMount } from 'vue'
import { Icon, Popup, Empty, Dialog, Sticky } from 'vant'
import CollectionCard from '@/popup/views/account/components/collectionCard/index.vue'
import { addressMask, decimal, toUsdSymbol } from '@/popup/utils/filters'
import AcceptCode from '@/popup/views/account/components/acceptCode/index.vue'
import TransactionDetail from '@/popup/views/account/components/transactionDetail/index.vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { hexValue } from '@ethersproject/bytes'
import { useI18n } from 'vue-i18n'
import localforage from 'localforage'
export default {
  components: {
    [Icon.name]: Icon,
    [Popup.name]: Popup,
    [Empty.name]: Empty,
    [Sticky.name]: Sticky,
    [Dialog.Component.name]: Dialog.Component,
    CollectionCard,
    AcceptCode,
    TransactionDetail
  },
  setup() {
    const { t } = useI18n()
    const router = useRouter()
    const store = useStore()
    const { query } = useRoute()
    const { tokenContractAddress } = query
    const accountInfo = computed(() => store.state.account.accountInfo)
    const currentNetwork = computed(() => store.state.account.currentNetwork)
    const transactionList = computed(() => {
      const { accountInfo } = store.state.account
      const { address } = accountInfo
      const list = store.state.account.currentNetwork.transactionList[address.toUpperCase()]
      return list || []
    })
    const txList = ref([])
    const pageData = reactive({ data: {} })
    pageData.data = query

    const toogleAcceptCode = () => {
      router.push({
        name: 'receive-choose',
        query: { backUrl: 'receive-choose-code' }
      })
    }
    onMounted(async() =>{
      const id = currentNetwork.value.id
      const targetAddress = accountInfo.value.address.toUpperCase()
      debugger
      const tx = await localforage.getItem(`txlist-${id}`)
      debugger
      const list = tx[targetAddress] || []
      if(tokenContractAddress) {
        txList.value = list.filter((item:any) =>  item.tokenAddress && item.tokenAddress.toUpperCase() == tokenContractAddress.toString().toUpperCase())
      } else {
        txList.value = list.filter((item:any) =>  !item.tokenAddress)
      }
    })
    // To buy
    const toBuy = () => {}

    // To send
    const toSend = () => {
      router.push({ name: 'send', query })
    }
    // To exchange
    const toSwap = () => {}
    // Transaction details data
    let transactionData: any = reactive({ data: {} })
    const showTransactionModal: Ref<boolean> = ref(false)
    // View transaction details event
    const handleView = (e: any) => {
      transactionData.data = e
      showTransactionModal.value = true
    }
    const handleClose = () => {
      showTransactionModal.value = false
    }
    const toBrowser = () => {
      window.open(currentNetwork.value.browser)
    }
    return {
      t,
      accountInfo,
      toogleAcceptCode,
      toSend,
      toBuy,
      toSwap,
      handleView,
      handleClose,
      showTransactionModal,
      transactionData,
      decimal,
      currentNetwork,
      transactionList,
      pageData,
      toBrowser,
      toUsdSymbol,
      txList
    }
  }
}
</script>
<style lang="scss" scoped>
.fixed-bottom {
margin-top: 46px;
}
.view-history {
  color: #037CD6;
}
.currency {
  .currency-bd {
    background: rgba(244, 250, 255, 1);
    min-height: 235px;
  }
  .currency-icon {
    // background: rgba(3, 125, 214, 1);
    border-radius: 50%;
    width: 40px;
    height: 40px;
  }

  &-icon {
    margin-top: 24px;
    width: 34px;
    height: 59px;
    margin-bottom: 20px;
  }
  .amount {
    line-height: 20px;
    font-size: 24px;
    margin-top: 8px;
    word-break: break-all;
  }
  .balance {
    color: #848484;
  }
  .actions-list {
    &-card {
      width: 32px;
      margin: 17px 22px 22px;

      &-icon {
        height: 32px;
        background: rgba(3, 125, 214, 1);
        border-radius: 32px;
        transition: ease 0.3s;
        &:hover {
          background: rgb(4, 110, 190);
          box-shadow: 0 3px 4px rgb(166, 213, 248);
        }
      }
      &-label {
        line-height: 16px;
        color: rgba(3, 125, 214, 1);
        font-size: 12px;
        margin-top: 7px;
      }
    }
  }
}
.iconfont {
  color: #fff;
}
</style>