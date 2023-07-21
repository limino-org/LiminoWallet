<template>
  <!-- The current node provids | | no exchange  -->
  <div class="exchange-btn-box">
    <Transition name="slider">
      <div class="help-center-box flex right" v-if="!isSelect">
        <div class="flex right pl-20 pr-20">
          <div class="help-btn flex center hover">
            <div class="btn-mask">
              <div class="btn-mask-box flex center" @click="toHelp" @mouseover="showHelp = true" @mouseout="showHelp = false">
                <GuideModal13 />
                <i class="iconfont icon-bangzhuzhongxin3"></i>
              </div>
            </div>
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
      <div v-if="active == 'b'" class="exchange-con">
        <div class="pl-20 pr-20">
          <div class="wallet-suspension hover" @mouseover="showExchange = true" @mouseout="showExchange = false" @click="toCreate">
            <GuideModal9 />
            <van-icon name="plus" />
          </div>
          <Transition name="slider2">
            <div v-if="showExchange" :class="[
              'wallet-hint pt-10 pb-10 pl-10 pr-10 flex center',
              isExchangerFlag ? 'wallet-hint-h' : '',
            ]">
              <span>{{ t("createNft.createNFTs") }}</span>
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
import { Button, Sticky, Toast, Icon } from "vant";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { decode } from "js-base64";
import { useToast } from "@/popup/plugins/toast";

export default defineComponent({
  name: "exchange-btn",
  components: {
    [Button.name]: Button,
    [Sticky.name]: Sticky,
    [Icon.name]: Icon,
    GuideModal9,
    GuideModal13,
  },
  props: {
    isSelect: {
      type: Boolean,
      default: false,
    },
    active: {
      type: String,
      default: 'a'
    }
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
    const { $toast } = useToast()
    const accountInfo = computed(() => store.state.account.accountInfo)
    const currentNetwork = computed(() => store.state.account.currentNetwork);
    // One-click exchange open status
    const exchangeStatus = computed(() => store.state.account.exchangeStatus);
    // Control the first button
    const slideFlag = ref(eschangeBtnStatus.value);
    // Control the second button
    const hideFlag = ref(false);
    const showHelp = ref(false);


    const changeStatus = () => {
      //debugger;
      dispatch("system/toggleExchangeBtnStatus");
      slideFlag.value = eschangeBtnStatus.value;
    };


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
      window.open(decode('aHR0cHM6Ly93d3cud29ybWhvbGVzLmNvbS8=') + "docs/wallet/");
    };

    const isExchangerFlag = computed(
      () => store.state.account.exchangeStatus.ExchangerFlag
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
    const toCreate = () => {
      if (Number(accountInfo.value.amount) == 0) {
        $toast.warn(t("wallet.haveNoMoney"));
        return false;
      }
      router.push({ name: "generateNFT" });
    };
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
      isSelect2,
      isExchangerFlag,
      exchangeStatus,
      currentNetwork,
      showHelp,
      toCreate,
      toHelp,
    };
  },
});
</script>
<style lang="scss" scoped>
.btn-mask {
  position: relative;
  width: 100%;
  height: 100%;

  &-box {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 1000000;
  }
}

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
  z-index: 1;
  right: 83px;
  top: 10px;
  height: 30px;
  border-radius: 5px;
  background: #9F54BA;
  box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.1);

  span {
    font-size: 12px;
    color: #fff;
    white-space: nowrap;
  }

  &:after {
    content: " ";
    position: absolute;
    bottom: 9px;
    right: -12px;
    border-left: 8px solid #9F54BA;
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
  z-index: 100;

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
      color: #9F54BA;
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
    color: #9F54BA;

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
  background: #9F54BA;
  box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.1),
    0px 0px 10px 0px rgba(0, 0, 0, 0.1);

  i {
    color: #fff;
    font-size: 18px;
  }
}

.ex-inner {
  width: 820px;
  margin: 0 auto;
  position: relative;
}

.exchange-box {
  max-width: 820px;
  box-sizing: border-box;
  margin: 0 auto;
}

.exchange-con {
  position: fixed;
  min-width: 50px;
  bottom: 30px;
  right: 0px;
  z-index: 100;

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
}</style>
