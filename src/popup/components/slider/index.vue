<template>
  <!-- sidebar -->
  <transition name="slider-left">
    <div v-if="showSlider" :style="{ width: '90%', height: '100%' }" class="nav-header-slider-box">
      <div class="slider-con">
        <div :class="`slider-bg ${isStaker ? 'blue' : ''}`">
          <div class="flex back-box">
            <van-icon name="cross" class="hover" @click="showSlider = false" />
          </div>

          <div :class="`user-img `">
            <div class="user-img-circle flex center-v hover">
              <AccountIcon :data="accountInfo.icon" @click="toAccountManagement" />
              <!-- Label set -->
              <div class="tag-list flex slider">
                <van-popover v-model:show="showPopover3" trigger="manual" class="account-pop" placement="bottom-start">
                  <div class="lh-14 pt-8 pb-8 pl-10 pr-10 f-12" @mouseover="showPopoverText3 = true" @mouseleave="handleMouseLeavetext3">
                    <div> {{ t("creatorSnft.labelPeriod") }}: {{ creatorStatus.count }}</div>
                    <div>{{ t("creatorSnft.labelProfit") }}: {{ creatorStatus.profitStr }} ERB</div>
                    <div>{{ t("creatorSnft.labelTimes") }}: {{ creatorStatus.count }}</div>
                    <div>{{ t("creatorSnft.labelAward") }}: {{ creatorStatus.rewardEth }} ERB</div>
                    <div>{{ t("creatorSnft.labelWeight") }}: {{ creatorStatus.weight }}</div>
                  </div>
                  <template #reference>
                    <div class="tag-user type1 position relative hover" @mouseover="showPopover3 = true" @mouseleave="handleMouseLeave3" v-show="creatorStatus
                      ">
                      <span class="user flex center" @click="toCreator">
                        <i class="iconfont icon-Add"></i>
                      </span>
                      <div class="tag-label flex center-v" @click="toCreator">
                        <span class="van-ellipsis">{{ t("creatorSnft.creator") }}</span>
                      </div>
                    </div>
                  </template>
                </van-popover>
                <van-popover v-model:show="showPopover" trigger="manual" class="account-pop MR-10" placement="bottom-start">
                  <div class="lh-14 pt-8 pb-8 pl-10 pr-10 f-12" @mouseover="showPopoverText = true" @mouseleave="handleMouseLeavetext1">
                    <i18n-t tag="div" v-if="expresionClass == 'smile'" keypath="minerspledge.smileTip">
                      <template v-slot:value>{{ Coefficient }}</template>
                      <template v-slot:btn>
                      </template>
                    </i18n-t>
                    <i18n-t tag="div" v-if="expresionClass == 'sad'" keypath="minerspledge.homeTip">
                      <template v-slot:btn>
                        <span class="gotIt" @click="toStaker">{{
                          t("minerspledge.gotIt")
                        }}</span>
                      </template>
                    </i18n-t>
                    <i18n-t tag="div" v-if="expresionClass == 'neutral'" keypath="minerspledge.homeTip">
                      <template v-slot:btn>
                        <span class="gotIt" @click="toStaker">{{
                          t("minerspledge.gotIt")
                        }}</span>
                      </template>
                    </i18n-t>
                  </div>
                  <template #reference>
                    <div class="tag-user type2 position relative hover ml-8" @mouseover="showPopover = true" @mouseleave="handleMouseLeave1" @click="toStaker" v-show="isValidator">
                      <span class="user flex center">
                        <i class="iconfont icon-chuiziicon"></i>
                      </span>
                      <div class="tag-label flex center-v">
                        <span class="van-ellipsis">{{ t("common.validator") }}</span>
                      </div>
                    </div>
                  </template>
                </van-popover>
                <van-popover v-model:show="showPopover2" trigger="manual" class="account-pop" placement="bottom-start">
                  <div class="lh-14 pt-8 pb-8 pl-10 pr-10 f-12" @mouseover="showPopoverText2 = true" @mouseleave="handleMouseLeavetext2">
                    {{ t("common.exchange_pledge") }}
                  </div>
                  <template #reference>
                    <div class="tag-user type3 position relative ml-8 hover" @mouseover="showPopover2 = true" @mouseleave="handleMouseLeave2" @click="toStaker" v-show="isStaker
                      ">
                      <span class="user flex center">
                        <i class="iconfont icon-fangwujianzhuwugoujianbeifen"></i>
                      </span>
                      <div class="tag-label flex center-v">
                        <span class="van-ellipsis">{{ t("common.marketplace") }}</span>
                      </div>
                    </div>
                  </template>
                </van-popover>
              </div>
            </div>
            <!-- Switch account -->
            <div :class="`account mt-6 ${pageType === 'Tab' ? 'mt-14' : ''}`">
              <div class="flex center-v name" @click="toAccountManagement">
                {{ accountInfo.name }}
                <i :class="`iconfont ml-4 f-14 ${showAccount ? 'icon-shangjiantou' : 'icon-xiajiantou'
                  }`"></i>
              </div>
              <!-- Address, copy, QR code-->
              <div :class="`address-card flex mt-6 ${pageType === 'Tab' ? 'mt-14' : ''}`" @click="toCopy">
                <div class="add">{{ accountInfo.address }}</div>
              </div>
              <div :class="`amount mt-8 ${pageType === 'Tab' ? 'mt-14' : ''}`">
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
            <div :class="`setting-btn flex between center-v clickActive ${pageType}`" @click="toOfficiaWebsite">
              <div class="flex center">
                <i class="iconfont icon-zailiulanqidakai"></i>
                <span>{{ t("sidebar.aboutAs") }}</span>
              </div>

              <van-icon name="arrow" />
            </div>
            <div :class="`setting-btn flex between center-v clickActive ${pageType}`" @click="toStaker">
              <div class="flex center">
                <i class="iconfont icon-chuiziicon"></i>
                {{
                  t('validator.pageTit')
                }}
              </div>
              <van-icon name="arrow" />
            </div>
            <div class="setting-btn flex between center-v clickActive " @click="toGenerate">
              <div class="flex center">
                <van-icon name="photo-o" />
                <span>{{
                  t("castingnft.createNFT")
                }}</span>
              </div>
              <van-icon name="arrow" />
            </div>

            <div :class="`setting-btn flex between center-v clickActive ${pageType}`" @click="tobrowser">
              <div class="flex center">
                <i class="iconfont icon-liulanqi"></i>
                {{ t("sidebar.browser") }}
              </div>

              <van-icon name="arrow" />
            </div>
            <div :class="`setting-btn flex between center-v clickActive ${pageType}`" @click="routerTo('transaction-history')">
              <div class="flex center">
                <i class="iconfont icon-lishijilu"></i>
                {{ t("sidebar.transationHistory") }}
              </div>
              <van-icon name="arrow" />
            </div>

            <div :class="`setting-btn flex between center-v clickActive ${pageType}`" @click="toHelp">
              <div class="flex center">
                <i class="iconfont icon-bangzhuzhongxin31"></i>
                <span>{{ t("sidebar.help") }}</span>
              </div>
              <van-icon name="arrow" />
            </div>
            <div :class="`setting-btn flex between center-v clickActive ${pageType}`" @click="toCreator" v-if="currentNetwork.isMain && creatorStatus">
              <div class="flex center">
                <i class="iconfont icon-Add"></i>
                <span>{{ t("sidebar.snftCreator") }}</span>
              </div>
              <van-icon name="arrow" />
            </div>
            <div :class="`setting-btn flex between center-v clickActive ${pageType}`" @click="routerTo('settings')">
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
      <SwitchNetwork v-model:show="showModalNetwork" @close="showModalNetwork = false" />
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
  onUnmounted,
  onActivated,
  onDeactivated,
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
import { decode } from "js-base64";

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
    // @ts-ignore
    const pageType = window.pageType
    const showSlider = ref(false);
    const { emit } = context;
    const store = useStore();
    const router = useRouter();
    const { t } = useI18n();
    const { dispatch } = store;
    // Main network account details
    const ethAccountInfo = computed(() => store.state.account.ethAccountInfo);
    const creatorStatus = computed(() => store.state.account.creatorStatus)
    const isStaker = computed(() => {
      return new BigNumber(ethAccountInfo.value.PledgedBalance || 0).div(1000000000000000000).gte(700)
    })
    const isValidator = computed(() => {
      return new BigNumber(ethAccountInfo.value.PledgedBalance || 0).div(1000000000000000000).gte(70000)
    })
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
        callBack() { },
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
      if (exchangeStatus.ExchangerFlag) {
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
    const toHelp = () => {
      // $toast.warn(t('common.commingsoon'))
      window.open(decode('aHR0cHM6Ly93d3cud29ybWhvbGVzLmNvbS8=') + "docs/wallet/");
    };
    // The account label pops up
    const showPopover = ref(false);
    const showPopover2 = ref(false);
    const showPopover3 = ref(false);
    const toCreator = () => {
      router.push({ name: "snft-creator" });
    };

    const Coefficient = computed(() => {
      return ethAccountInfo.value.Coefficient;
    });
    const expresionClass = computed(() => {
      const num = Number(Coefficient.value);
      if (num < 40) return "sad";
      if (num >= 40 && num <= 50) return "neutral";
      if (num > 50) return "smile";
    });


    const showPopoverText = ref(false);
    const showPopoverText2 = ref(false);
    const showPopoverText3 = ref(false);
    const handleMouseLeave1 = () => {
      // showPopover.value
      let time = setTimeout(() => {
        if (!showPopoverText.value) {
          showPopover.value = false;
        } else {
          showPopover.value = true;
        }
        clearTimeout(time);
      }, 70);
    };
    const handleMouseLeave2 = () => {
      // showPopover.value
      let time = setTimeout(() => {
        if (!showPopoverText2.value) {
          showPopover2.value = false;
        } else {
          showPopover2.value = true;
        }
        clearTimeout(time);
      }, 70);
    };
    const handleMouseLeave3 = () => {
      // showPopover.value
      let time = setTimeout(() => {
        if (!showPopoverText3.value) {
          showPopover3.value = false;
        } else {
          showPopover3.value = true;
        }
        clearTimeout(time);
      }, 70);
    };
    const handleMouseLeavetext1 = () => {
      // showPopover.value
      showPopoverText.value = false;
      if (showPopover.value) {
        showPopover.value = false;
      }
    };
    const handleMouseLeavetext2 = () => {
      // showPopover.value
      showPopoverText2.value = false;
      if (showPopover2.value) {
        showPopover2.value = false;
      }
    };
    const handleMouseLeavetext3 = () => {
      // showPopover.value
      showPopoverText3.value = false;
      if (showPopover3.value) {
        showPopover3.value = false;
      }
    };
    const toGenerate = () => {
      router.push({
        name: "generateNFT-ai"
      })
    }

    const toStaker = () => {
      router.push({ name: "staker" })
    }

    return {
      toStaker,
      toGenerate,
      expresionClass,
      showPopoverText,
      showPopoverText2,
      showPopoverText3,
      handleMouseLeave1,
      handleMouseLeave2,
      handleMouseLeave3,
      handleMouseLeavetext1,
      handleMouseLeavetext2,
      handleMouseLeavetext3,
      creatorStatus,
      Coefficient,
      showPopover,
      showPopover3,
      toCreator,
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
      t,
      pageType,
      isStaker,
      isValidator
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

.slider-con {
  position: relative;
}

.back-box {
  position: absolute;
  right: 15px;
  top: 15px;

  i {
    font-size: 18px;
  }
}
</style>

