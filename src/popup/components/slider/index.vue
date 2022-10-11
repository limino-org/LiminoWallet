<template>
  <!-- sidebar -->
  <transition name="slider-left">
    <div
      v-if="showSlider"
      :style="{ width: '90%', height: '100%' }"
      class="nav-header-slider-box"
    >
      <div class="slider-con">
        <div :class="`slider-bg ${hasExchange ? 'blue' : ''}`">
          <div class="flex back-box">
            <van-icon name="arrow-left hover" @click="showSlider = false" />
          </div>

          <div class="user-img">
            <div class="user-img-circle flex center-v hover">
              <AccountIcon
                :data="accountInfo.icon"
                @click="toAccountManagement"
              />
              <!-- Label set -->
              <div class="tag-list flex">
                <van-popover
                  v-model:show="showPopover"
                  trigger="manual"
                  class="account-pop MR-10"
                  placement="bottom-start"
                >
                  <div class="lh-14 pt-8 pb-8 pl-16 pr-16 f-12">
                    {{ t("common.right_and_interests") }}
                  </div>
                  <template #reference>
                    <div
                      class="tag-user type2 position relative hover mr-8"
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
                <van-popover
                  v-model:show="showPopover2"
                  trigger="manual"
                  class="account-pop"
                  placement="bottom-start"
                >
                  <div class="lh-14 pt-8 pb-8 pl-16 pr-16 f-12">
                    {{ t("common.exchange_pledge") }}
                  </div>
                  <template #reference>
                    <div
                      class="tag-user type3 position relative mr-8 hover"
                      @mouseover="showPopover2 = true"
                      @mouseleave="showPopover2 = false"
                      v-show="
                        ethAccountInfo ? ethAccountInfo.ExchangerFlag : false
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
            <!-- Switch account -->
            <div class="account mt-6">
              <div class="flex center-v name" @click="toAccountManagement">
                {{ accountInfo.name }}
                <i
                  :class="`iconfont ml-4 f-14 ${
                    showAccount ? 'icon-shangjiantou' : 'icon-xiajiantou'
                  }`"
                ></i>
              </div>
              <!-- Address, copy, QR code-->
              <div class="address-card flex">
                <div class="add">{{ accountInfo.address }}</div>
              </div>
              <div class="amount mt-8">
                {{ amount }} {{ currentNetwork.currencySymbol }}
              </div>
            </div>
          </div>

          <!-- AccountModal -->
          <AccountModal v-model="showAccount" />
        </div>
        <!-- Bottom button group -->
        <div class="slider-bottom">
          <!-- Group of transaction information buttons -->
          <div class="setting-list">
            <!-- websize -->
            <div
              class="setting-btn flex between center-v clickActive"
              @click="toOfficiaWebsite"
            >
              <div class="flex center">
                <i class="iconfont icon-zailiulanqidakai"></i>
                <span>{{ t("sidebar.aboutAs") }}</span>
              </div>

              <van-icon name="arrow" />
            </div>

            <div
              class="setting-btn flex center-v between clickActive"
              v-if="currentNetwork.isMain"
              @click="minerpledge"
            >
              <div class="flex center">
                <i class="iconfont icon-chuiziicon"></i>
                {{ $t("sidebar.minerspledge") }}
              </div>
              <van-icon name="arrow" />
            </div>

            <!-- One-click exchange -->
            <div
              class="setting-btn flex between center-v clickActive"
              v-if="currentNetwork.isMain"
              @click="oneClick"
            >
              <div class="flex center">
                <i class="iconfont icon-fangwujianzhuwugoujianbeifen"></i>
                {{
                  hasExchange
                    ? t("sidebar.exchangemanagement")
                    : t("wallet.openexchange")
                }}
              </div>
              <van-icon name="arrow" />
            </div>

            <div
              class="setting-btn flex between center-v clickActive"
              @click="tobrowser"
            >
              <div class="flex center">
                <i class="iconfont icon-liulanqi"></i>
                {{ t("sidebar.browser") }}
              </div>

              <van-icon name="arrow" />
            </div>
            <div
              class="setting-btn flex center-v between clickActive"
              @click="routerTo('transaction-history')"
            >
              <div class="flex center">
                <i class="iconfont icon-lishijilu"></i>
                {{ t("sidebar.transationHistory") }}
              </div>
              <van-icon name="arrow" />
            </div>

            <div
              class="setting-btn active flex center-v between clickActive"
              @click="toHelp"
            >
              <div class="flex center">
                <i class="iconfont icon-bangzhuzhongxin31"></i>
                <span>{{ t("sidebar.help") }}</span>
              </div>
              <van-icon name="arrow" />
            </div>
            <div
              class="setting-btn flex center-v between clickActive"
              @click="routerTo('settings')"
            >
              <div class="flex center">
                <i class="iconfont icon-shezhi"></i>
                {{ t("sidebar.settings") }}
              </div>
              <van-icon name="arrow" />
            </div>
          </div>
        </div>

        <div class="slider-bottom-box">
          <!-- logout -->
          <div class="logout-box flex center pl-14 pr-14">
            <van-button block @click="handleLogout" class="logoutBtn">{{
              t("sidebar.logout")
            }}</van-button>
          </div>
          <!-- version number -->
          <div class="text-center f-12 lh-16 mt-12 mb-12 version">
            LiminoWallet V{{ version }} ({{ new Date().getFullYear() }})
          </div>
        </div>
      </div>

      <!-- switching network -->
      <SwitchNetwork
        v-model:show="showModalNetwork"
        @close="showModalNetwork = false"
      />
    </div>
  </transition>
  <van-overlay :show="showSlider" :z-index="999" @click="showSlider = false" />
</template>
<script lang="ts">
import {
  SetupContext,
  Ref,
  ref,
  reactive,
  defineComponent,
  computed,
  nextTick,
  registerRuntimeCompiler,
  watch,
  getCurrentInstance,
  ComponentInternalInstance,
} from "vue";
import {
  Popup,
  Icon,
  ActionSheet,
  Dialog,
  Button,
  Loading,
  Circle,
  Toast,
  Slider,
  Popover,
  Overlay,
} from "vant";
import { addressMask, decimal } from "@/popup/utils/filters";
import AddressQRModal from "@/popup/components/addressQRModal/index.vue";
import { version } from "@/popup/enum/version";

import { useToggleAccount } from "@/popup/components/accountModal/hooks/toggleAccount";
import AccountIcon from "@/popup/components/accountIcon/index.vue";
import AccountModal from "@/popup/components/accountModal/index.vue";
import SwitchNetwork from "@/popup/components/switchNetwork/index.vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLogin } from "../navHeader/hooks/login";
import AcceptCode from "@/popup/views/account/components/acceptCode/index.vue";
import { useNetWork } from "../navHeader/hooks/netWork";
import useClipboard from "vue-clipboard3";
import { useToast } from "@/popup/plugins/toast";
import { useDialog } from "@/popup/plugins/dialog";
import BigNumber from "bignumber.js";
import { getWallet } from "@/popup/store/modules/account";

export default defineComponent({
  name: "slider-menu",
  components: {
    [Popup.name]: Popup,
    [Icon.name]: Icon,
    [ActionSheet.name]: ActionSheet,
    [Dialog.Component.name]: Dialog.Component,
    [Button.name]: Button,
    [Loading.name]: Loading,
    [Circle.name]: Circle,
    [Popover.name]: Popover,
    [Overlay.name]: Overlay,
    AccountIcon,
    AccountModal,
    SwitchNetwork,
    AcceptCode,
    AddressQRModal,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  setup(props: any, context: SetupContext) {
    const showSlider = ref(false);
    const { emit } = context;
    const store = useStore();
    const router = useRouter();
    const { t } = useI18n();
    const { dispatch } = store;
    // Main network account details
    const ethAccountInfo = computed(() => store.state.system.ethAccountInfo);
    // Exchange status
    const hasExchange = computed(() => {
      const { exchanger_flag, status } = store.state.account.exchangeStatus;
      return exchanger_flag;
    });
    // Account details
    const accountInfo = computed(() => store.state.account.accountInfo);
    const { logout } = useLogin();
    const {
      netWorkList,
      currentNetwork,
      showModalNetwork,
      chooseNetWork,
      handleChoose,
      handleChooseComfirm,
    } = useNetWork();
    console.warn("currentNetwork", currentNetwork.value);
    watch(
      () => props.modelValue,
      (n) => {
        showSlider.value = n;
        if (n) {
          dispatch("account/getExchangeStatus");
        }
      },
      {
        immediate: true,
      }
    );
    watch(
      () => showSlider.value,
      (n) => {
        if (!n) {
          emit("update:modelValue", false);
        }
      }
    );
    const amount = computed(() => store.getters["system/getAmount"]);
    // Copy user address
    const { toClipboard } = useClipboard();
    const { $toast } = useToast();
    const toCopy = async () => {
      try {
        await toClipboard(`${accountInfo.value.address}`);
        $toast.success(t("copy.title"));
      } catch (e) {
        console.error(e);
      }
    };

    const {
      options,
      showAccount,
      toggleAccount,
      handleAccount,
      createAccount,
      createLoading,
      accountLoading,
    } = useToggleAccount();

    const toAccountManagement = () => {
      router.push({ name: "account-management" });
    };
    const network = computed(() => store.state.account.currentNetwork);
    const tobrowser = () => {
      window.open(`${network.value.browser}`);
    };

    const routerTo = (name: string) => {
      showSlider.value = false;
      let time = setTimeout(() => {
        router.push({ name });
        clearTimeout(time);
      }, 300);
    };

    const handleLogout = () => {
      $dialog.open({
        message: t("sidebar.logoutTip"),
        type: "warn",
        theme: "dark",
        confirmBtnText: t("common.no"),
        cancelBtnText: t("common.yes"),
        callBack() {},
        cancelBack() {
          showSlider.value = false;
          logout();
        },
      });
    };

    const toSend = () => {
      showSlider.value = false;
      router.push({ name: "send" });
    };
    // Popover expands and closes
    const toReceive = () => {
      router.push({
        name: "receive-choose",
        query: { backUrl: "receive-choose-code" },
      });
    };
    const toOfficiaWebsite = () => {
      window.open("https://www.wormholes.com");
    };
    // One-click exchange click events
    const oneClick = async () => {
      Toast.loading({
        duration: 0,
      });
      showSlider.value = false;
      const exchangeStatus = await dispatch("account/getExchangeStatus");
      Toast.clear();
      if (exchangeStatus.exchanger_flag) {
        router.push({
          name: "exchange-management",
        });
      } else {
        router.push({
          name: "bourse",
        });
      }
    };

    // Display qr code address
    const showCode = ref(false);
    const handleShowCode = () => {
      showCode.value = true;
    };

    const { $dialog } = useDialog();
    const minerpledge = async () => {
      showSlider.value = false;
      const wallet = await getWallet();
      const ethAccountInfo = await wallet.provider.send("eth_getAccountInfo", [
        wallet.address,
        "latest",
      ]);
      if (ethAccountInfo.PledgedBalance) {
        router.push({ name: "minersDeal" });
        return;
      }
      let accountAmount = new BigNumber(accountInfo.value.amount);

      if (accountAmount.gte(70001)) {
        showSlider.value = false;
        // router.push({ name: 'minersPledge' })
        router.push({ name: "minersDeal" });
      } else {
        $dialog.open({
          type: "warn",
          theme: "dark",
          hasCancelBtn: false,
          message: t("send.sendMessage"),
        });
        // isWarnings.value = true;
        return;
      }
    };

    const toHelp = () => {
      // $toast.warn(t('common.commingsoon'))
      window.open("https://www.wormholes.com/docs/wallet/");
    };
    // The account label pops up
    const showPopover = ref(false);
    const showPopover2 = ref(false);

    return {
      showPopover,
      showPopover2,
      toOfficiaWebsite,
      handleShowCode,
      showCode,
      toHelp,
      accountInfo,
      options,
      showAccount,
      toggleAccount,
      toAccountManagement,
      handleAccount,
      createAccount,
      amount,
      createLoading,
      accountLoading,
      oneClick,
      toReceive,
      toSend,
      handleLogout,
      netWorkList,
      currentNetwork,
      showModalNetwork,
      chooseNetWork,
      handleChoose,
      handleChooseComfirm,
      tobrowser,
      network,
      routerTo,
      showSlider,
      toCopy,
      addressMask,
      decimal,
      version,
      ethAccountInfo,
      hasExchange,
      t,
      minerpledge,
    };
  },
});
</script>
<style lang="scss" scoped>
.slider-left-enter-active {
  animation: slider-in 0.3s forwards linear;
}
.slider-left-leave-active {
  animation: slider-in 0.3s reverse linear;
}
.logoutBtn {
  background: transparent;
  width: 220px;
}
@keyframes slider-in {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(0);
  }
}
.back-box {
  margin-bottom: 15px;
  i {
    font-size: 16px;
  }
}
</style>

