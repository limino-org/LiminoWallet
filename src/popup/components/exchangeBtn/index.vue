<template>
  <!-- The current node provids | | no exchange  -->
  <div class="exchange-btn-box">
    <!-- 帮助中心 -->
    <Transition name="slider">
      <div class="help-center-box flex right" v-if="!isSelect">
        <div class="flex right pl-20 pr-20">
          <div
            class="help-btn flex center hover"
            @click="toHelp"
            @mouseover.self="showHelp = true"
            @mouseout.self="showHelp = false"
          >
            <GuideModal13 />
            <i class="iconfont icon-bangzhuzhongxin3"></i>
          </div>
          <Transition name="slider2">
            <div class="hint pl-10 pr-10" v-if="showHelp">
              {{ t("wallet.helpCenter") }}
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
    <Transition name="slider">
      <div v-if="!isSelect2" class="exchange-con">
        <!-- 一键开设交易所 -->

        <div class="pl-20 pr-20">
 
          <div
            class="wallet-suspension hover"
            @mouseover="showExchange = true"
            @mouseout="showExchange = false"
            @click="toAutoExchange"
          >
  
            <GuideModal9 />

            <i class="iconfont icon-university-full"></i>
          </div>
          <Transition name="slider2">
            <!-- 交易所设置 -->
            <div
              v-if="showExchange"
              :class="[
                'wallet-hint pt-10 pb-10 pl-10 pr-10 flex center',
                isExchanger_flag ? 'wallet-hint-h' : '',
              ]"
            >
              <span v-if="!isExchanger_flag">{{
                t("wallet.openexchange")
              }}</span>
              <span v-else>{{ t("sidebar.exchangemanagement") }}</span>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </div>
</template>
<script lang="ts">
import GuideModal9 from "@/popup/components/guideModal/step9.vue";
import GuideModal13 from "@/popup/components/guideModal/step13.vue";

// One-click exchange animation component
import {
  defineComponent,
  ref,
  Ref,
  watch,
  SetupContext,
  reactive,
  computed,
  onBeforeMount,
  onMounted,
  onActivated,
} from "vue";
import { Button, Sticky, Toast } from "vant";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "exchange-btn",
  components: {
    [Button.name]: Button,
    [Sticky.name]: Sticky,
    GuideModal9,
    GuideModal13,
  },
  props: {
    isSelect: {
      type: Boolean,
      default: false,
    },
  },
  setup(props: any, context: SetupContext) {
    const store = useStore();
    const router = useRouter();
    const { t } = useI18n();
    const { dispatch } = store;
    // One-click exchange button displays status
    const eschangeBtnStatus = computed(
      () => store.state.system.exchangeBtnStatus
    );
    const currentNetwork = computed(() => store.state.account.currentNetwork);
    // One-click exchange open status
    const exchangeStatus = computed(() => store.state.account.exchangeStatus);
    // Control the first button
    const slideFlag = ref(eschangeBtnStatus.value);
    // Control the second button
    const hideFlag = ref(false);
    const showHelp = ref(false);

    const changeStatus = () => {
      debugger;
      dispatch("system/toggleExchangeBtnStatus");
      slideFlag.value = eschangeBtnStatus.value;
    };

    const active = ref(0);

    const onBeforeEnter = () => {
      hideFlag.value = false;
    };

    const onAfterEnter = () => {
      slideFlag.value = false;
    };
    const onAfterLeave = () => {
      hideFlag.value = true;
    };
    const toHelp = () => {
      window.open("https://www.wormholes.com/docs/wallet/");
    };
    const getStatus = async () => {
      Toast.loading({
        message: t("userexchange.loading"),
        forbidClick: true,
        loadingType: "spinner",
      });
      return dispatch("account/getExchangeStatus").finally(() => Toast.clear())
    };
    const toAutoExchange = async() => {
      const {exchanger_flag,status} = await getStatus();
      if(exchanger_flag) {
        router.push({ name: "exchange-management" });
      } else {
         router.push({ name: "bourse" });
      }
    };
    const isExchanger_flag = computed(
      () => store.state.account.exchangeStatus.exchanger_flag
    );
    const isSelect2 = ref(false);
    watch(
      () => props.isSelect,
      (n: boolean) => {
        let time = setTimeout(() => {
          isSelect2.value = n;
          clearTimeout(time);
        }, 150);
      },
      {
        immediate: true,
        deep: true,
      }
    );
    onMounted(async () => {
      await dispatch("system/toggleExchangeBtnStatus", false);
      if (!slideFlag.value) {
        hideFlag.value = true;
      }
      slideFlag.value = false;
    });
    onActivated(async () => {
      await dispatch("system/toggleExchangeBtnStatus", false);
      if (!slideFlag.value) {
        hideFlag.value = true;
      }
      slideFlag.value = false;
    });

    const showExchange = ref(false);
    return {
      t,
      showExchange,
      eschangeBtnStatus,
      changeStatus,
      hideFlag,
      onBeforeEnter,
      onAfterEnter,
      slideFlag,
      onAfterLeave,
      toAutoExchange,
      isSelect2,
      exchangeStatus,
      currentNetwork,
      showHelp,
      isExchanger_flag,
      active,
      toHelp,
    };
  },
});
</script>
<style lang="scss" scoped>
.wallet-hint-h {
  span {
    font-size: 12px;
    color: #fff;
    word-break: keep-all;
  }
}
.wallet-hint {
  min-width: 80px;
  max-width: 170px;
  position: absolute;
  right: 83px;
  top: 10px;
  height: 30px;
  border-radius: 5px;
  background: #037dd6;
  box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.1);
  span {
    font-size: 12px;
    color: #fff;
    white-space:nowrap;
  }
  &:after {
    content: " ";
    position: absolute;
    bottom: 9px;
    right: -12px;
    border-left: 8px solid #037dd6;
    border-right: 8px solid transparent;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    width: 0;
    height: 0;
  }
}
.help-center-box {
  position: fixed;
  min-width: 50px;
  bottom: 90px;
  right: 0px;
  .help-btn {
    width: 50px;
    height: 50px;
    border-radius: 25px;
    background: #fff;
    box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.1),
      0px 0px 10px 0px rgba(0, 0, 0, 0.1);
    position: relative;
    i {
      font-size: 22px;
      color: #037dd6;
    }
  }
  .hint {
    position: absolute;
    z-index: -1;
    min-width: 85px;
    line-height: 30px;
    background: #fff;
    border-radius: 7px;
    box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.1),
      0px 0px 10px 0px rgba(0, 0, 0, 0.1);
    right: 83px;
    top: 10px;
    text-align: center;
    color: #037dd6;
    &:after {
      content: " ";
      position: absolute;
      bottom: 8px;
      right: -12px;
      border-left: 8px solid #fff;
      border-right: 8px solid transparent;
      border-top: 8px solid transparent;
      border-bottom: 8px solid transparent;
      width: 0;
      height: 0;
    }
  }
}
.wallet-suspension {
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border-radius: 50%;
  background: #037dd6;
  box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.1),
    0px 0px 10px 0px rgba(0, 0, 0, 0.1);

  i {
    color: #fff;
    font-size: 18px;
  }
}
.ex-inner {
  width: 750px;
  margin: 0 auto;
  position: relative;
}
.exchange-box {
  max-width: 750px;
  box-sizing: border-box;
  margin: 0 auto;
}
.exchange-con {
  position: fixed;
  min-width: 50px;
  bottom: 30px;
  right: 0px;
  button {
    transition: all 0.5s ease;
    &:hover {
      box-shadow: 0px 5px 7px 2px rgba(0, 0, 0, 0.2);
    }
  }
  &.extend {
    width: 100%;
  }
  .fixed-home {
    width: 50px;
    height: 50px;
    border-radius: 25px;
    box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.2);
    transform-origin: center center;
    z-index: 999;
    background: #fff;
    position: absolute;
    right: 0px;
    top: -50px;
    &:hover {
      box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.2);
      transition: ease 0.3s;
    }
    i {
      font-size: 20px;
    }
  }
}

.slider-enter-active {
  animation: slider-in 0.3s forwards ease;
}
.slider-leave-active {
  animation: slider-in 0.3s reverse ease;
}
.slider2-enter-active {
  animation: slider2-in 0.3s forwards ease;
}
.slider2-leave-active {
  animation: slider2-in 0.3s reverse ease;
}

@keyframes slider-in {
  0% {
    right: -50px;
    opacity: 0;
  }
  100% {
    right: 0;
  }
}
@keyframes slider2-in {
  0% {
    right: -200px;
    opacity: 0;
    transform: scale(0);
  }
  30% {
    right: 20px;
    transform: scale(0.1);
    opacity: 0.1;
  }
  100% {
    right: 83px;
    opacity: 1;
    transform: scale(1);
  }
}
</style>
