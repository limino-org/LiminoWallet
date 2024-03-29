<template>
  <div class="nav-header-container">
    <div :class="`nav-header ${hasExchange ? 'hasExchange' : ''}`">
      <div class="position relative nav-center van-hairline--bottom">
        <div :class="`nav-content ${hasExchange ? 'hasExchange' : ''}  ${
            paddingTop ? 'paddingTop' : ''
          }`">
          <div class="nav-header-con flex between">
            <div class="menu nav-icon flex center">
              <slot name="left">
                <div class="icon-box flex center" @click="clickLeft" v-if="hasLeft">
                  <!-- <van-icon name="apps-o" v-if="hasLeft" /> -->
                  {{t('wallet.back')}}
                </div>
              </slot>
            </div>
            <div class="title-slot">
              <slot name="title">
                <div class="title" v-if="hasTitle" @click="chooseNetWork">
                  <div class="title-big text-center f-16">{{ title }}</div>
                  <div class="title-small text-center flex center lh-14">
                    <span class="active" :style="{ background: currentNetwork.color }"></span>
                    {{ currentNetwork.label }}
                    <GuideModal12 />
                    &nbsp;
                    {{ t("networklist.network") }}
                    <van-icon class="ml-4 netIcon" :name="!showModalNetwork ? 'arrow-down' : 'arrow-up'" />
                  </div>
                </div>
              </slot>
            </div>

            <div class="code nav-icon flex center">
              <slot name="right">
                <div class="icon-box flex center" @click="clickRight">
                  <!-- <van-icon name="scan" v-if="hasRight" /> -->
                  <span v-if="hasRight">{{t('wallet.cancel')}}</span>
                </div>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- switching network -->
    <SwitchNetwork v-model="showModalNetwork" />
  </div>
  <!-- Close the tip -->
  <van-dialog v-model:show="closeModal" :show-cancel-button="false" :show-confirm-button="false">
    <div>
      <div class="flex center close-icon-tip">
        <van-icon name="warning" />
      </div>
      <div class="lh-20 close-tip">{{$t('common.suretocancel')}}</div>
      <div class="flex between close-btns">
        <van-button type="default" round @click="tohome" block>{{t('common.yes')}}</van-button>
        <van-button type="primary" round block @click="closeModal = false">{{t('common.no')}}</van-button>
      </div>
    </div>
  </van-dialog>
</template>

<script lang="ts">
import { SetupContext, Ref, ref, reactive, defineComponent, computed, nextTick, registerRuntimeCompiler } from 'vue'
import { Popup, Icon, ActionSheet, Dialog, Button, Loading, Circle, Toast } from 'vant'
import NetWorkCard from '../netWorkCard/index.vue'
import { showSlider, show } from '@/popup/components/navHeader/hooks/slider'
import { useToggleAccount } from '@/popup/components/accountModal/hooks/toggleAccount'
import { useNetWork } from '@/popup/components/navHeader/hooks/netWork'
import { useLogin } from '@/popup/components/navHeader/hooks/login'
import { useRouter, useRoute, RouteRecordName } from 'vue-router'
import SwitchNetwork from '@/popup/components/switchNetwork/index.vue'
import { addressMask, decimal } from '@/popup/utils/filters'
import { useStore } from 'vuex'
import { getWallet } from '@/popup/store/modules/account'
import { useI18n } from 'vue-i18n'
import GuideModal12 from '@/popup/components/guideModal/step12.vue'

export default defineComponent({
  name: 'NavHeader',
  emits: ['clickLeft', 'clickRight', 'updateAccountSuccess'],
  components: {
    [Popup.name]: Popup,
    [Icon.name]: Icon,
    [ActionSheet.name]: ActionSheet,
    [Dialog.Component.name]: Dialog.Component,
    [Button.name]: Button,
    [Loading.name]: Loading,
    [Circle.name]: Circle,
    NetWorkCard,
    SwitchNetwork,
    GuideModal12
  },
  props: {
    // Is there a left button
    hasLeft: {
      type: Boolean,
      default: true
    },
    hasRight: {
      type: Boolean,
      default: true
    },
    paddingTop: {
      type: Boolean,
      default: true
    },
    hasTitle: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: 'WormHoles'
    },
    cancelRouteName: {
      type: String,
      default: 'wallet'
    },
    // Back button The redirection route has the highest priority
    backReplaceName: {
      type: String,
      default: ''
    },
    backUrl: {
      type: String,
      default: ''
    }
  },
  setup(props: any, context: SetupContext) {
    const router = useRouter()
    const store = useStore()
    const route = useRoute()
    const { dispatch, getters } = store
    const { state } = store
    const { t } = useI18n()
    const { netWorkList, currentNetwork, showModalNetwork, chooseNetWork, handleChoose, handleChooseComfirm } = useNetWork()

    const accountInfo = computed(() => store.state.account.accountInfo)
    // Whether open through the exchange open exchange discoloration
    const hasExchange = computed(() => {
      const flag = store.getters['account/hasExchange']
      if (route.name == 'wallet' && flag) {
        return true
      }
      return false
    })
    const { emit } = context
    const clickLeft = () => {
      // If backUrl exists and the current route name is not the name of the cancelled route
      const { backUrl, cancelRouteName, backReplaceName } = props
      emit('clickLeft')
      // If the current page confirms the password directly back
      if (route.name == 'resetPwd-step1') {
        router.back()
        return
      }
      if (backReplaceName) {
        router.replace({ name: backReplaceName })
        return
      }
      if (backUrl && route.name === cancelRouteName) {
        router.replace({ name: backUrl })
        return
      }
      if (!backUrl) {
        router.back()
        return
      }
      router.replace({ name: 'wallet' })
    }
    const closeModal = ref(false)
    const clickRight = () => {
      if (
        route.name == 'send' ||
        route.name == 'createNft-step2' ||
        route.name == 'sendNft-step2' ||
        route.name == 'modifAutoExchange' ||
        route.name == 'createAutoExchange'
      ) {
        console.log('打开弹窗')
        closeModal.value = true
      } else {
        router.replace({ name: props.cancelRouteName })
        emit('clickRight')
      }
    }
    const tohome = () => {
      router.push({
        name: 'wallet'
      })
    }

    // Go to the blockchain browser
    const network = computed(() => store.state.account.currentNetwork)

    return {
      t,
      clickLeft,
      clickRight,
      show,
      showModalNetwork,
      chooseNetWork,
      // toImport,
      network,
      netWorkList,
      currentNetwork,
      handleChoose,
      handleChooseComfirm,
      accountInfo,
      addressMask,
      decimal,
      hasExchange,
      closeModal,
      tohome
    }
  }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style  lang="scss">
@import './index.scss';
</style>
