<template>
  <div class="page-box" id="page-box">
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
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import {
  Ref,
  ref,
  watch,
  onBeforeMount,
  onActivated,
  onMounted,
  computed,
  provide
} from "vue";
import { useStore, mapActions } from "vuex";
import { Button } from "vant";
import { utils } from "ethers";
import { useWallet } from "@/popup/hooks/useWallet";
import { useI18n } from "vue-i18n";
import { getWallet } from "./store/modules/account";
import { version } from "@/popup/enum/version";
import { useEvent } from "@/popup/hooks/useEvent";
import CommonModal from "@/popup/components/commonModal/index.vue";
import { addressMask, transactionStatus } from "./utils/filters";
import { guid } from '@/popup/utils/utils'
import { useBroadCast } from '@/popup/utils/broadCost'

export default {
  components: {
    [Button.name]: Button,
    CommonModal,
  },
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const { commit, dispatch, state, getters } = useStore();
    const { initWallet } = useWallet();
    const currentNetwork = computed(() => state.account.currentNetwork);
    provide("appProvide", appProvide());
    onMounted(()=>{
      // update browser session window id
     dispatch('system/setConversationid', guid())
           // Listen to the broadcast of the same source window
      const { broad } = useBroadCast()
      broad.onmessage = (e) => {
        const { data }: any = e
        const { action, id } = data
        if(data && action) {
          // If the same-origin window updates the account
          if(action == 'wromHoles-update' && id != state.system.conversationId) {
            window.location.reload()
          }
        }
      }

      // let time = setTimeout(function() {
      //   commit("account/UPDATE_WORMHOLES_URL", {
      //   URL: "https://api.wormholes.com",
      //   browser: "https://www.wormholesscan.com/#/",
      //   id: 'wormholes-network-1'
      // });
      // clearTimeout(time)
      // }, 1000)
    })
    // Initialize wallet instance
    onBeforeMount(async () => {
      initWallet();
      dispatch("account/getContractAddress");
      useEvent();
    });

    const animation = ref("slide");
    return {
      t,
      route,
      addressMask,
      currentNetwork,
      transactionStatus,
      animation,
    };
  },
};
</script>
<style lang="scss">
.page-container {
  // scrollbar-width: none;
  position: relative;
  box-sizing: border-box;
  padding-bottom: 30px;
  &::-webkit-scrollbar {
    display: none;
    /* Chrome Safari */
  }
}
// .slider-box {
//   position: fixed;
//   left: 0;
//   top: 0;
//   right: 0;
//   bottom: 0;
//   &-container {
//     position: relative;
//     height: 100vh;
//     z-index: -1;
//   }
// }
:deep(.van-popup) {
  position: absolute;
}
.page-box {
  min-height: 100vh;
  transition: transform 0.35s, opacity 0.35s;
  position: relative;
  max-width: 750px;
  margin: 0 auto;
  overflow-y: hidden;
  background: #fff;
  box-sizing: border-box;
  &::-webkit-scrollbar {
    width: 0 !important;
    display: none;
  }
  :deep(.van-toast) {
    word-break: keep-all !important;
  }
}

// 交易弹窗样式
.receipt-box {
  .step-box {
    padding: 0 50px;
    div {
      transition: ease 0.3s;
    }
    .num1 {
      background: #037cd6;
      border: 1PX solid #037cd6;
      color: #fff;
    }
    &.receive {
      .line1::after,
      .line2::after {
        border-color: #037cd6 !important;
      }
      .num3 {
        background: #037cd6;
        border: 1PX solid #037cd6;
        color: #fff;
      }
    }
    .num2 {
      background: #037cd6;
      border: 1PX solid #037cd6;
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
        color: #037cd6;
      }
      .con {
        color: #68b1e6;
      }
    }
    &.receive {
      .send,
      .done {
        color: #037cd6;
      }
    }
    .con {
      color: #037cd6;
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
}

.slide-right-enter-active,
.slide-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  width: 100%;
  height: 100%;
  will-change: transform;
  transition: all 500ms cubic-bezier(0.55, 0, 0.1, 1);
  position: absolute;
  backface-visibility: hidden;
}
.slide-right-enter-active {
  opacity: 0;
  transform: translate3d(-100%, 0, 0);
}
.slide-right-leave-active {
  opacity: 0;
  transform: translate3d(100%, 0, 0);
}
.slide-left-enter-active {
  opacity: 0;
  transform: translate3d(100%, 0, 0);
}
.slide-left-leave-active {
  opacity: 0;
  transform: translate3d(-100%, 0, 0);
}
</style>
