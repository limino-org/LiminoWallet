<template>
  <NavHeader :hasRight="false">
    <template v-slot:left>
      <div :class="`flex center icon-box ${hasExchange ? 'hasExchange' : ''}`" @click="handleLeft">
        <GuideModal11 />
        <i class="iconfont icon-gengduo2"></i>
      </div>
    </template>
  </NavHeader>

  <div class="wallet">
    <div class="page-container">
      <!-- Account details module -->
      <div :class="`account-detail-box ${hasExchange ? 'hasExchange' : ''}`">
        <div class="account-card flex center pl-14 pr-14 pt-20">
          <div class="card flex column between">
            <div class="card-top flex pl-14 pr-10 pt-10">
              <!-- icon -->
              <div class="icon-circle flex center hover">
                <AccountIcon :data="accountInfo.icon" @click="showaccount" />
              </div>
              <div class="account-r ml-10">
                <!-- Name, balance, label -->
                <div class="flex between at center-v">
                  <span @click="showaccount" class="clickActive f-12" id="guide-step1">
                    <GuideModal1></GuideModal1>
                    {{ accountInfo.name }}
                    <i
                      :class="`iconfont ml-4 f-14 ${
                        showModal ? 'icon-shangjiantou' : 'icon-xiajiantou'
                      }`"
                    ></i>
                  </span>
                  <!-- Account list Popup-->
                  <AccountModal v-model="showModal" />
                  <!-- <SnftDetails v-model="showModal" /> -->
                  <div class="tag-list flex">
                    <GuideModal10></GuideModal10>
                    <van-popover v-model:show="showPopover" trigger="manual" class="account-pop" placement="bottom-end">
                      <div class="lh-14 pt-8 pb-8 pl-16 pr-16 f-12">{{t("common.right_and_interests")}}</div>
                      <template #reference>
                        <div
                          class="tag-user type2 position relative hover"
                          @mouseover="showPopover = true"
                          @mouseleave="showPopover = false"
                          v-show="
                            ethAccountInfo
                              ? ethAccountInfo.PledgedBalance > 0
                                ? true
                                : false
                              : false
                          "
                        >
                          <span class="user">
                            <img src="@/popup/views/home/imgs/wakuang.png" alt />
                          </span>
                          <div class="tag-label flex center-v">
                            <span>Validator</span>
                          </div>
                        </div>
                      </template>
                    </van-popover>
                    <van-popover v-model:show="showPopover2" trigger="manual" class="account-pop" placement="bottom-end">
                      <div class="lh-14 pt-8 pb-8 pl-16 pr-16 f-12">{{t("common.exchange_pledge")}}</div>
                      <template #reference>
                        <div
                          class="tag-user type3 position relative ml-8 hover"
                          @mouseover="showPopover2 = true"
                          @mouseleave="showPopover2 = false"
                          v-show="
                            ethAccountInfo
                              ? ethAccountInfo.ExchangerFlag
                              : false
                          "
                        >
                          <span class="user">
                            <img src="@/popup/views/home/imgs/smallhome.png" alt />
                          </span>
                          <div class="tag-label flex center-v">
                            <span>Exchange</span>
                          </div>
                        </div>
                      </template>
                    </van-popover>
                  </div>
                </div>
                <!-- Address, copy, QR code -->
                <div class="address-card flex center-v">
                  <div class="add">
                    {{ addressMask(accountInfo.address) }}
                    <GuideModal2></GuideModal2>
                  </div>
                  <i class="iconfont icon-fuzhi2 ml-6 hover" @click="toCopy"></i>
                  <div class="shuxian ml-8 mr-8"></div>
                  <div class="flex center">
                    <GuideModal3></GuideModal3>

                    <i class="iconfont icon-erweima1 hover flex center" @click="handleShowCode"></i>
                  </div>

                  <!-- QR code Modal -->
                  <AddressQRModal v-model="showCode" :data="accountInfo.address" />
                </div>
              </div>
            </div>
            <!-- amount of money -->
            <div class="card-bottom flex right center-v pr-14 pl-14">
              <div class="flex right">
                <i
                  :class="`iconfont  ${
                    amountType == 'mask' ? 'icon-yanjing' : 'icon-yanjing1'
                  } hover`"
                  @click="changeType"
                ></i>
                <div class="flex column bottom dollar ml-6">
                  <i class="iconfont icon-meiyuan"></i>
                </div>
                <GuideModal4></GuideModal4>
                <div
                  :class="`flex amount-box van-ellipsis ${amountClass} ${
                    amountType == 'mask' ? 'pt-6' : ''
                  }`"
                >{{ amountStr }}</div>
              </div>
            </div>
          </div>
        </div>
        <!-- Button group -->
        <div class="btn-group mt-14 pl-10 pr-10 flex between pt-12">
          <div class="actions-btn" @click.stop="toReceive">
            <div class="action-icon flex center">
              <i class="iconfont icon-bottom icon-teshujiantouzuoxiantiao"></i>
            </div>
            <div class="action-name text-center">{{ t("wallet.recive") }}</div>
          </div>
          <div class="actions-btn" @click="handleToBuy" v-if="currentNetwork.chainId != 51888">
            <div class="action-icon flex center">
              <i class="iconfont icon-qianbao2"></i>
            </div>
            <div class="action-name text-center">{{ t("wallet.buy") }}</div>
          </div>
          <div class="actions-btn" v-if="currentNetwork.chainId == 51888" @click="tofaucet">
            <div class="action-icon flex center">
              <i class="iconfont icon-shuilongtou"></i>
            </div>
            <div class="action-name text-center">{{ t("wallet.faucet") }}</div>
          </div>
          <div class="actions-btn" @click="toSend">
            <div class="action-icon flex center">
              <i class="iconfont icon-teshujiantouzuoxiantiao-copy"></i>
            </div>
            <div class="action-name text-center">
              {{ t("wallet.send") }}
              <GuideModal5></GuideModal5>
            </div>
          </div>
          <div class="actions-btn" v-if="currentNetwork.chainId == 51888">
            <div class="action-icon flex center">
              <i class="iconfont icon-icon_huabanfuben"></i>
            </div>
            <div class="action-name text-center">{{ t("wallet.swap") }}</div>
          </div>
        </div>
      </div>
      <van-tabs v-model:active="active" sticky :offset-top="48">
        <div class="listType" v-show="active == 'b'">
          <i class="iconfont icon-fenlei2" @click="handleSetListType1(1)" v-if="layoutType == 'list'"></i>
          <i class="iconfont icon-liebiao" @click="handleSetListType1(2)" v-else></i>
        </div>
        <!-- <div class="listType" v-show="active == 'c'">
          <i class="iconfont icon-fenlei2" @click="handleSetListType"></i>
        </div> -->
        <div class="flex between pl-20 pr-20 guide-tabs-box">
          <div class="flex1">
            <GuideModal6></GuideModal6>
          </div>
          <div class="flex2">
            <GuideModal7></GuideModal7>
          </div>
          <div class="flex3">
            <GuideModal8></GuideModal8>
          </div>
        </div>
        <!-- token Token -->
        <van-tab name="a">
          <template #title>{{ $t("wallet.tokens") }}</template>
          <template #default>
            <van-sticky offset-top="91">
      <div class="flex between center-v create-box">
        <span class="f-12 text-bold label">{{t('wallet.importToken')}}</span>
        <span class="add flex center" @click="toCreate"><van-icon name="plus" /></span>
      </div>
    </van-sticky>
            <!-- The first default token of the current network -->
            <TokenCard :data="myToken" :networkIcon="false" toName="transactionDetails-step1" />
            <TokenCard v-for="(item, idx) in accountTokens" :key="idx" :data="item" toName="transactionDetails-step1" />
          </template>
        </van-tab>
        <!-- nft list -->
        <van-tab name="b">
          <template #title>{{ $t("wallet.NFTs") }}</template>
          <template #default>
            <NftList />
          </template>
        </van-tab>
        <!-- snft list -->
        <van-tab name="c">
          <template #title>{{ $t("wallet.SNFTs") }}</template>
          <template #default>
            <SnftList @changeSwitch="handleChangeIsselect" v-if="active == 'c'" />
          </template>
        </van-tab>
      </van-tabs>
      <!-- sidebar -->
      <slider v-model="showSlider" />
      <!-- One touch exchange button -->
      <ExchangeBtn :isSelect="isSelect" />

      <!-- Guide the user to operate the pop-up window -->
      <GuideModal v-model="showGuideModal" />
      <!-- Guide user to backup mnemonic Popup -->
      <BackUp />
      <!-- Boot backup mnemonic Popup -->
      <BackUpBottom />
    </div>
  </div>
</template>

<script lang="ts">
import { Tab, Tabs, Popup, Icon, Dialog, Sticky, Toast, Loading, Empty, List, Popover, Button } from 'vant'
import { ref, Ref, reactive, onMounted, computed, toRefs, watch, onBeforeMount, onUnmounted, onActivated, onDeactivated, getCurrentInstance, ComponentInternalInstance } from 'vue'
import NavHeader from '@/popup/components/navHeader/index.vue'
import Slider from '@/popup/components/slider/index.vue'
import TokenCard from '@/popup/views/account/components/tokenCard/index.vue'
import CollectionCard from '@/popup/views/account/components/collectionCard/index.vue'
import TransactionDetail from '@/popup/views/account/components/transactionDetail/index.vue'
import NftList from '@/popup/views/account/components/nftList/index.vue'
import SnftList from '@/popup/views/account/components/snftList/index.vue'
import AccountIcon from '@/popup/components/accountIcon/index.vue'
import AcceptCode from '@/popup/views/account/components/acceptCode/index.vue'
import AccountModal from '@/popup/components/accountModal/index.vue'
import { mapState, useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { addressMask, decimal, toUsd } from '@/popup/utils/filters'
import { useToggleAccount } from '@/popup/components/accountModal/hooks/toggleAccount'
import useClipboard from 'vue-clipboard3'
import { useI18n } from 'vue-i18n'
import { getNftOwner } from '@/popup/http/modules/nft'
import eventBus from '@/popup/utils/bus'
import QrcodeModal from '@/popup/components/qrcodeModal/index.vue'
import AddressQRModal from '@/popup/components/addressQRModal/index.vue'
import ExchangeBtn from '@/popup/components/exchangeBtn/index.vue'
import GuideModal from '@/popup/components/guideModal/index.vue'
import GuideModal1 from '@/popup/components/guideModal/step1.vue'
import GuideModal2 from '@/popup/components/guideModal/step2.vue'
import GuideModal3 from '@/popup/components/guideModal/step4.vue'
import GuideModal4 from '@/popup/components/guideModal/step3.vue'
import GuideModal5 from '@/popup/components/guideModal/step5.vue'
import GuideModal6 from '@/popup/components/guideModal/step6.vue'
import GuideModal7 from '@/popup/components/guideModal/step7.vue'
import GuideModal8 from '@/popup/components/guideModal/step8.vue'
import GuideModal9 from '@/popup/components/guideModal/step8.vue'
import GuideModal10 from '@/popup/components/guideModal/step10.vue'
import GuideModal11 from '@/popup/components/guideModal/step11.vue'
import GuideModal13 from '@/popup/components/guideModal/step13.vue'
import BackUp from '@/popup/components/guideModal/backUp.vue'
import BackUpBottom from '@/popup/components/guideModal/backupBottom.vue'
import SnftDetails from '@/popup/components/snftdetails/index.vue'
import { useExchanges } from '@/popup/views/home/hooks/useExchange'
import { web3 } from '@/popup/utils/web3'
import { useToast } from "@/popup/plugins/toast";

export default {
  name: 'wallet',
  components: {
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [Popup.name]: Popup,
    [Icon.name]: Icon,
    [Sticky.name]: Sticky,
    [Loading.name]: Loading,
    [Empty.name]: Empty,
    [List.name]: List,
    [Button.name]: Button,
    [Popover.name]: Popover,
    [Dialog.Component.name]: Dialog.Component,
    TokenCard,
    CollectionCard,
    AcceptCode,
    TransactionDetail,
    NavHeader,
    AccountIcon,
    NftList,
    SnftList,
    AccountModal,
    Slider,
    QrcodeModal,
    ExchangeBtn,
    AddressQRModal,
    GuideModal,
    GuideModal1,
    GuideModal2,
    GuideModal3,
    GuideModal4,
    GuideModal5,
    GuideModal6,
    GuideModal7,
    GuideModal8,
    GuideModal9,
    GuideModal10,
    GuideModal11,
    GuideModal13,
    BackUp,
    BackUpBottom,
    SnftDetails
  },
  setup() {
    const { t } = useI18n()
    const router = useRouter()
    const route = useRoute()
    const active: Ref<string> = ref('a')
    const { generateSign, initExchangeData } = useExchanges()
    const store = useStore()
    const showSlider = ref(false)
    const { dispatch, getters } = store
    const theme = computed(() => store.state.common.theme)
    const accountInfo = computed(() => store.state.account.accountInfo)
    const currentNetwork = computed(() => store.state.account.currentNetwork)
    const layoutList = computed(() => store.state.system.layoutList)
    const layoutType = computed(() => store.state.system.layoutType)
    const ethAccountInfo = computed(() => store.state.system.ethAccountInfo)
    const isSelect = ref(false)
    // Display the default token of the current network
    const myToken = computed(() => {
      const symbol = currentNetwork.value.currencySymbol
      const balance = accountInfo.value.amount
      const data = {
        balance,
        logoUrl: 'eth.jpg',
        name: symbol,
        precision: 1,
        symbol,
        tokenContractAddress: null
      }
      return data
    })
    const loading: Ref<boolean> = ref(false)
    console.log('getters', store)
    const accountTokens = computed(() => store.getters['account/accountTokens'])
    console.log('accountTokens', accountTokens)
    // Jump to receive QR code page
    const toReceive = () => {
      router.push({
        name: 'receive-choose',
        query: { backUrl: 'receive-choose-code' }
      })
    }

    // 打开账户列表
    const showModal: Ref<boolean> = ref(false)
    const showaccount = () => {
      showModal.value = true
    }

    const tofaucet = () => {
      window.open('http://faucet.wormholesscan.com/?address=' + accountInfo.value.address)
    }
    const tobuy = () => {}
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
    const handleLeft = () => {
      showSlider.value = true
    }

    const toSend = () => {
      router.push({ name: 'send' })
    }
    const { toClipboard } = useClipboard()
    const { $toast } = useToast()
    const toCopy = async () => {
      try {
        await toClipboard(`${accountInfo.value.address}`)
        $toast.success(t('copy.title'))
      } catch (e) {
        console.error(e)
      }
    }

    // Has the exchange been opened? Has the exchange changed color
    const hasExchange = computed(() => {
      const flag = store.getters['account/hasExchange']
      if (route.name == 'wallet' && flag) {
        return true
      }
      return false
    })

    // Display QR code address
    const showCode = ref(false)
    const handleShowCode = () => {
      showCode.value = true
    }

    // Switch balance display type
    const changeType = () => {
      dispatch('system/toggleAmountType')
    }
    // Balance display type
    const amountType = computed(() => store.state.system.amountType)
    // Balance getter
    const amount = computed(() => getters['system/getAmount'])

    let time: any = null
    onMounted(() => {
      dispatch('system/getEthAccountInfo')
      dispatch('account/getExchangeStatus').then(res => {
        if (res.status == 2 && res.exchanger_flag) {
          initExchangeData()
        }
      })
      dispatch('transfer/clearTx')
      time = setInterval(() => {
        dispatch('account/updateBalance')
        dispatch('account/updateTokensBalances')
      }, 12000)
    })

    onUnmounted(() => {
      clearInterval(time)
    })
    onDeactivated(() => {
      clearInterval(time)
    })

    // Update the current collection list every time you switch accounts
    eventBus.on('changeAccount', address => {
      dispatch('account/getExchangeStatus')
    })

    // Purchase jump
    const handleToBuy = () => {
      router.push({ name: 'buy-home' })
    }

    // Guide Popup
    const showGuideModal = ref(false)

    // Balance display
    const amountStr = computed(() => {
      const str = amountType.value == 'mask' ? amount.value : amount.value
      return str
    })

    // Dynamically adjust font size according to balance length
    const amountClass = computed(() => {
      const len = amount.value.toString().length
      let str = ''
      if (len > 30) {
        str = 'f-12'
      }
      if (len > 22 && len <= 30) {
        str = 'f-18'
      }
      if (len > 14 && len <= 22) {
        str = 'f-24'
      }
      if (len > 8 && len <= 14) {
        str = 'f-28'
      }
      if (len >= 0 && len <= 8) {
        str = 'f-36'
      }
      return str
    })
    // Account tab Popup
    const showPopover = ref(false)
    const showPopover2 = ref(false)
    // Control snft
    const handleSetListType = (type: number) => {
      router.push({ name: 'coll-list' })
      dispatch('system/setListLayout', 'card')
    }
    // Control nft
    const handleSetListType1 = (type: number) => {
      dispatch('system/setListLayout', type == 1 ? 'card' : 'list')
    }

    const toCreate = () => {
      router.push({name:"tokens-import"})
    }
    const handleChangeIsselect = (v: boolean) => {
      isSelect.value = v
    }
    return {
      t,
      toCreate,
      handleChangeIsselect,
      handleSetListType,
      handleSetListType1,
      active,
      showPopover,
      showPopover2,
      handleView,
      handleClose,
      toSend,
      handleLeft,
      theme,
      amountStr,
      amountClass,
      loading,
      accountInfo,
      currentNetwork,
      addressMask,
      showaccount,
      showModal,
      toCopy,
      transactionData,
      decimal,
      layoutList,
      toReceive,
      layoutType,
      isSelect,
      tofaucet,
      tobuy,
      dispatch,
      accountTokens,
      myToken,
      showSlider,
      hasExchange,
      handleShowCode,
      showCode,
      amount,
      changeType,
      amountType,
      handleToBuy,
      showGuideModal,
      ethAccountInfo,
      toUsd
    }
  }
}
</script>
<style lang="scss" >
@import './index.scss';
</style>
