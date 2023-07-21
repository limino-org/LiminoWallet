<template>
  <NavHeader :title="t('sidebar.exchangemanagement')" :hasRight="false">
    <template v-slot:left>
      <span class="back" @click="back">{{ t("common.back") }}</span>
    </template>
  </NavHeader>
  <div class="exchange-manage" v-if="!loading">
    <!-- The first time was successful -->
    <div class="bourse-img">
      <img
        class="exchange-welcome-icon"
        src="@/assets/exchange/SketchPng6487f59e1a3e4adec886c6b63f8c41c4aa0d61ebfe43fcaad735b3ff5ca97e8d.png"
      />
      <div class="d1">{{ t("bourse.congraTit") }}</div>
      <div class="d2">{{ t("bourse.openSuccess") }}</div>
    </div>
    <!-- <Tip v-else :message="t('createExchange.pageTip')" /> -->
    <div class="list">
      <div class="card flex between" @click="openExchange">
        <div class="info">
          <div class="label">{{ t("createExchange.staking") }}</div>
          <div class="desc">{{ t("createExchange.stakingDesc") }}</div>
        </div>
        <div class="flex center">
          <van-icon name="arrow" />
        </div>
      </div>
    </div>
  </div>
  <div class="flex center loading-page" v-else>
    <van-loading color="#9F54BA" />
  </div>
  <ServerModal v-model="showServerModal" :exchangeName="exchangeName"  :days="days" :hours="hours" @updateStatus="handleUpdateStatus"/>
  <div class="guide-mask" @click.stop="closeGuide" v-if="showGuideMask">
    <div class="container">
      <div class="guide-header"></div>
      <div class="guide-box">
        <div class="guide-con-1" v-if="showServer">
          <div class="guide-text">
            {{ t("guidePopup.createExchangGuideTip1") }}
          </div>
          <div class="line-box"></div>
          <div class="line-circle"></div>
        </div>
      </div>
      <div class="guide-footer"></div>
      <div class="guide-card" v-if="(showGuide && !showServer)  || (showServer && !showGuide)"></div>
    </div>
  </div>
</template>
<script lang="ts">
import NavHeader from "@/popup/components/navHeader/index.vue";
import { encode, decode } from "js-base64";
import { useExchanges } from '@/popup/hooks/useExchanges'
import Tip from "@/popup/components/tip/index.vue";
import { computed, defineComponent, onMounted, Ref, ref } from "@vue/runtime-core";
import { Button, Icon, Loading } from "vant";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import moment from 'moment'
import ServerModal from "./server-modal.vue";
import {
  VUE_APP_EXCHANGESMANAGEMENT_URL,
  VUE_APP_EXCHANGES_URL,
} from "@/popup/enum/env";
import { getWallet } from "@/popup/store/modules/account";
import eventBus from "@/popup/utils/bus";
import { nextTick } from "process";
import { useToast } from '@/popup/plugins/toast';
import { ethers } from 'ethers';
import { Toast } from 'vant';
import BigNumber from 'bignumber.js';

export default {
  name: "exchange-manage",
  components: {
    [Button.name]: Button,
    [Icon.name]: Icon,
    [Loading.name]: Loading,
    NavHeader,
    Tip,
    ServerModal,
  },
  setup() {
    const router = useRouter();
    const { t } = useI18n();
    const { state, commit, dispatch } = useStore();
    const exchangeStatus = computed(() => state.account.exchangeStatus);
    const {getContract} = useExchanges()
    const back = () => {
      router.back();
    };
    const exchangeUrl = computed(() => {
      const add = state.account.accountInfo.address;
      return `${VUE_APP_EXCHANGES_URL}/c${add.toLowerCase()}/#/`;
    });
    const adminUrl = computed(() => {
      const add = state.account.accountInfo.address;
      return `${VUE_APP_EXCHANGESMANAGEMENT_URL}?address=${add.toLowerCase()}&exchangeAddress=${add.toLowerCase()}`;
    });
    const days:Ref<number> = ref(0)
    const hours:Ref<number> = ref(0)
    const hasEnableServe = ref(false)
    const getServerExpiDate = async() => {
      const contractWithSigner = await getContract()
      const [date] = await contractWithSigner.functions.endTime(state.account.accountInfo.address)
      const nowTime = new Date().getTime()
      const a = date.toNumber() > 0 ? date.toNumber() * 1000 : 0
      const b = nowTime
      if(a === 0) {
        return
      }
      hasEnableServe.value = true
      const timestamp = moment(a)
      const nowTimestamp = moment(b);
      const totalHours = timestamp.diff(nowTimestamp,'hours')
      const hour = totalHours%24
      const day = timestamp.diff(nowTimestamp, 'days')
      days.value = day
      hours.value = hour
    }
    const toAdmin = () => {
      window.open(adminUrl.value);
    };
    const toConsole = () => {
      window.open(exchangeUrl.value);
    };
    const openExchange = () => {
      router.push({ name: "bourse" });
    };
    const showServerModal = ref(false);
    const exchangeName = ref("");
    const loading = ref(false);
    const initData = async () => {
      loading.value = true;
      await dispatch('account/getExchangeStatus')
            const {ExchangerFlag,status} = exchangeStatus.value
            //debugger
      if (!state.account.exchangeGuidance && ExchangerFlag) {
        showGuide.value = true;
        // commit("account/UPDATE_EXCHANGEGUIDANCE", true);
      }
      if (!state.account.exchangeServer) {
        showServer.value = true;
        // commit("account/UPDATE_EXCHANGESERVER", true);
      }
      showGuideMask.value = showGuide.value || showServer.value
      try {
        const wallet = await getWallet();
        const { address } = wallet;
        const accountInfo = await wallet.provider.send("eth_getAccountInfo", [
          address,
          "latest",
        ]);
        exchangeName.value = accountInfo.Worm.ExchangerName;
      } finally {
        loading.value = false;
      }
      getServerExpiDate()
    };
    onMounted(initData);
    eventBus.on("walletReady", async () => {
      initData();
    });
        // commit("account/UPDATE_EXCHANGEGUIDANCE", false);
        //  commit("account/UPDATE_EXCHANGESERVER", false);
    const showGuide = ref(false);
    const showServer = ref(false);


    const showGuideMask = ref()

    const closeGuide = () => {
      if(showGuide.value) {
        commit("account/UPDATE_EXCHANGEGUIDANCE", true);
      }
      if(showServer.value) {
        commit("account/UPDATE_EXCHANGESERVER", true);
      }
      showGuideMask.value = false
    }
    const handleUpdateStatus = () => {
      initData()
    }
    
    const {$toast} = useToast()
    const handleAddModel = async() => {
      Toast.loading({
        duration:0
      })
      const wallet = await getWallet()
      const balance = await wallet.getBalance()
      const ethBalance = ethers.utils.formatEther(balance)
      if(new BigNumber(ethBalance).lt(201)) {
        $toast.warn(t('createExchange.nomoney'))
        Toast.clear()
        return
      }
      Toast.clear()
      showServerModal.value = true
    }
    return {
      handleAddModel,
      handleUpdateStatus,
      t,
      back,
      exchangeStatus,
      toAdmin,
      toConsole,
      openExchange,
      showServerModal,
      loading,
      exchangeName,
      showGuide,
      showGuideMask,
      showServer,
      initData,
      closeGuide,
      days,
      hours,
      hasEnableServe
    };
  },
};
</script>
<style lang="scss" scoped>
.guide-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  .guide-header {
    height: 180px;
    background: rgba(0, 0, 0, 0.7);
  }
  .guide-footer {
    height: calc(100vh  - 260px);
    background: rgba(0, 0, 0, 0.7);
  }
  .guide-con-1 {
    .guide-text {
      position: absolute;
      left: 0;
      right: 0;
      line-height: 14px;
      top: -84px;
      text-align: center;
      color: #fff;
    }
    .line-box {
      height: 75px;
      width: 0;
      border-right: 1px dotted #9F54BA;
      position: absolute;
      left: 50%;
      top: -62px;
    }
    .line-circle {
      width: 6px;
      height: 6px;
      background: #9F54BA;
      border-radius: 3px;
      position: absolute;
      left: 50%;
      margin-left: -2px;
      top: -68px;
    }
  }
  .guide-con-2 {
    .guide-text {
      position: absolute;
      left: 0;
      right: 0;
      line-height: 14px;
      bottom: -84px;
      text-align: center;
      color: #fff;
    }
    .line-box {
      height: 75px;
      width: 0;
      border-right: 1px dotted #9F54BA;
      position: absolute;
      left: 50%;
      bottom: -62px;
    }
    .line-circle {
      width: 6px;
      height: 6px;
      background: #9F54BA;
      border-radius: 3px;
      position: absolute;
      left: 50%;
      margin-left: -2px;
      bottom: -68px;
    }
  }
  .guide-con-1,
  .guide-con-2 {
    height: 80px;
    position: relative;
    &.mask {
      background: rgba(0, 0, 0, 0.7);
      &::after {
        display: none;
      }
    }
    &::after {
      content: "";
      display: block;
      position: absolute;
      left: 7.5px;
      right: 7.5px;
      top: 11.5px;
      bottom: 13px;
      border: 1px dotted #9F54BA;
      border-radius: 5px;
    }
  }
  .guide-card {
    height: 158px;
        background: rgba(0, 0, 0, 0.7);

  }
}
.bourse-img {
  height: 135px;
  background-color: #F8F3F9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  .exchange-welcome-icon {
    height: 35px;
    width: 35px;
  }
  .d1 {
    margin: 10px 0;
    font-size: 15px;
    font-weight: bold;
  }
  .d2 {
    font-size: 12px;
    color: #848484;
  }
}
.loading-page {
  height: 80vh;
}
.list {
  .card {
    padding: 19px 15px;
    border-bottom: 1px solid #e6e6e6;

    .label {
      font-size: 15px;
      font-weight: bold;
      line-height: 21px;
    }
    .desc {
      font-size: 12px;
      color: #848484;
      line-height: 18px;
    }
    i {
      font-size: 20px;
      color: #888888;
    }
    &:hover {
      cursor: pointer;
      // background: #f6f7f8;
      .label,
      .desc,
      i {
        color: #9F54BA;
      }
    }
  }
}
</style>