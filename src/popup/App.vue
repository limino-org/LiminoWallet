<template>
  <div :class="`page-box container ${pageType}`" id="page-box">

    <div class="container" id="container">
      <div v-if="route.meta.keepAlive">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
      <div v-else>
        <router-view />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { provide as appProvide } from "@/popup/provides/app";
import { useRoute, useRouter } from "vue-router";
import {
  Ref,
  ref,
  watch,
  onBeforeMount,
  onActivated,
  onMounted,
  computed,
  provide,
  nextTick
} from "vue";
import { useStore, mapActions } from "vuex";
import { Button, Loading } from "vant";
import { utils } from "ethers";
import { useWallet } from "@/popup/hooks/useWallet";
import { useI18n } from "vue-i18n";
import eventBus from "@/popup/utils/bus";

import { getWallet } from "./store/modules/account";
import { version } from "@/popup/enum/version";
import { useEvent } from "@/popup/hooks/useEvent";
import CommonModal from "@/popup/components/commonModal/index.vue";
import { addressMask, transactionStatus } from "./utils/filters";
import { guid } from '@/popup/utils/utils'
import { useBroadCast } from '@/popup/utils/broadCost'
import localforage from 'localforage'
import { getAccountAddr } from "@/popup/http/modules/common";
export default {
  components: {
    [Button.name]: Button,
    CommonModal,
  },
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const store = useStore();
    const { commit, dispatch, state, getters } = store
    const { initWallet } = useWallet();
    const currentNetwork = computed(() => state.account.currentNetwork);
    // @ts-ignore
    const pageType = ref(window ? window.pageType : '')
    provide("appProvide", appProvide());
    onMounted(async () => {
      console.log('this', this)
      // update browser session window id
      dispatch('system/setConversationid', guid())
      // Listen to the broadcast of the same source window
      const { broad } = useBroadCast()
      broad.onmessage = async (e) => {
        const { data }: any = e
        const { action, id } = data
        if (data && action) {
          // If the same-origin window updates the account
          if (action == 'wromHoles-update' && id != state.system.conversationId) {
            window.location.reload()
          }
        }
      }
      window.onload = () => {
        // @ts-ignore
        chrome.storage.local.set({ comfirm_password: '' })
        let time = setTimeout(() => {
          document.getElementById('loading-page-box').style.display = 'none'
          document.getElementById('app').style.display = 'block'
          clearTimeout(time)
        }, 200)

        let time2 = setTimeout(function () {
          commit("account/UPDATE_WORMHOLES_URL", {
            URL: "https://api.wormholes.com",
            browser: "https://www.wormholesscan.com/#/",
            label: "Erbie"
          });
          clearTimeout(time2);
        }, 0);

      }

      // move mnemonic to indexDB
      (function () {
        let time = setTimeout(async () => {
          const mnemonic = await localforage.getItem("mnemonic");
          if (!state.mnemonic.keyStore && mnemonic) {
            commit("mnemonic/UPDATE_MNEMONIC", mnemonic);
          }
          clearTimeout(time);
        }, 5000);
      })();
    })
    // Initialize wallet instance
    onBeforeMount(async () => {
      initWallet();
      dispatch("account/getContractAddress");
      dispatch("configuration/getConfiguration");

      useEvent();
    });

    eventBus.on('walletReady', newwallet => {
      dispatch('system/getChainVersion', newwallet);

    })
    const animation = ref("slide");

    return {
      t,
      route,
      addressMask,
      currentNetwork,
      transactionStatus,
      animation,
      pageType
    };
  },
};
</script>
<style lang="scss">
.page-container {
  position: relative;
  box-sizing: border-box;
  padding-bottom: 30px;

  &::-webkit-scrollbar {
    display: none;
    /* Chrome Safari */
  }
}

:deep(.van-popup) {
  position: absolute;
}

:deep(.van-overlay) {
  background: rgba(0, 0, 0, 0.5000);
}

.page-box {
  min-height: 100vh;
  transition: ease .3s;
  position: relative;
  margin: 0 auto;
  overflow-y: hidden;
  background: #fff;
  box-sizing: border-box;

  // box-shadow: 0 1px 2px #f4f5f7;
  &:hover {
    box-shadow: 0 2px 10px #ebedf0;
  }

  :deep(.van-toast) {
    word-break: keep-all !important;
  }

  &>.loading-box {
    height: 100vh;
  }

  &.Popup {
    width: 375PX;
    /* min-height: 601PX; */
  }
}

//Trade popover style
.receipt-box {
  .step-box {
    padding: 0 50px;

    div {
      transition: ease 0.3s;
    }

    .num1 {
      background: #9F54BA;
      border: 1PX solid #9F54BA;
      color: #fff;
    }

    &.receive {

      .line1::after,
      .line2::after {
        border-color: #9F54BA !important;
      }

      .num3 {
        background: #9F54BA;
        border: 1PX solid #9F54BA;
        color: #fff;
      }
    }

    .num2 {
      background: #9F54BA;
      border: 1PX solid #9F54BA;
      color: #fff;
    }

    &.pending {
      .line1::after {
        border-color: #68b1e6 !important;
      }

      .num2 {
        background: #68b1e6;
        border: 1PX solid #68b1e6;
        color: #fff;
      }
    }
  }

  .label-box {
    padding: 0 45px;

    div {
      line-height: 16px;
      transition: ease 0.3s;
      color: #979797;
    }

    &.pending {
      .send {
        color: #9F54BA;
      }

      .con {
        color: #68b1e6;
      }
    }

    &.receive {

      .send,
      .done {
        color: #9F54BA;
      }
    }

    .con {
      color: #9F54BA;
    }
  }

  .num {
    width: 18px;
    line-height: 16px;
    text-align: center;
    font-size: 12px;
    border-radius: 9px;
    color: #979797;
    border: 1PX solid #b3b3b3;
  }

  .line {
    height: 1px;
    flex: 1;
    margin-left: 4px;
    margin-right: 4px;

    &::after {
      border-color: #979797 !important;
      border-style: dashed;
    }
  }
}

.receive-info {
  border: 1PX solid #E4E7E8;
  border-radius: 5px;

  * {
    transition: ease all 0.3s;
  }

  div {
    line-height: 28px;
    color: #979797;
  }

  .status1 span {
    display: inline-block;
    line-height: 14px;
    color: rgba(58, 174, 85, 1);
    background: #e5ffeb;
    padding: 0 5px;
    border-radius: 7px;
  }

  .status0 span {
    display: inline-block;
    line-height: 14px;
    color: rgb(214, 25, 25);
    background: #ffe8e5;
    padding: 0 5px;
    border-radius: 7px;
  }
}</style>
