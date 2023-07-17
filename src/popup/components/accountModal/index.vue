<template>
  <van-dialog
    v-model:show="showModal"
    show-cancel-button
    teleport="#page-box"
    class="account-list-modal2"
    :showConfirmButton="false"
    :showCancelButton="false"
    closeOnClickOverlay
  >
    <div class="account-container">
      <div class="title text-center bold van-hairline--bottom">
        {{ t("account.account") }}
      </div>
      <div class="account-list scrollBar" ref="listDom" id="listDom">
        <!-- Imported accounts -->
        <div v-if="importList.length" class="f-12 lh-16 accountList-tit">
          {{ t("account.importaccount") }}
        </div>
        <div
          v-for="(item, index) in importList"
          :key="item.value"
          :data-selected="
            accountInfo.address.toUpperCase() == item.address.toUpperCase()
              ? true
              : false
          "
          :class="` clickActive van-hairline--bottom`"
          @click="handleAccountFun2(item, index)"
        >
          <div class="flex account-card" :title="item.address">
            <div class="flex center select-box">
              <i
                :class="`iconfont ${
                  item.address.toUpperCase() ==
                  accountInfo.address.toUpperCase()
                    ? 'icon-danxuan'
                    : 'icon-danxuan1'
                } `"
              ></i>
            </div>
            <div class="account-icon flex center">
              <div class="account-icon-box">
                <AccountIcon :data="item.icon" :title="item.address"/>
              </div>
            </div>
            <div class="account-info flex center-v">
              <div class="account-info-box">
                <div class="account-name flex center-v" :title="item.address">
                  <div class="name-box">{{ item.name }}</div>
                  <div class="pl-4 pr-4" @click.stop="openModifModal(item)">
                    <i class="iconfont icon-bianji"  :title="t('common.modifName')"></i>
                  </div>
                  <div class="flex"  v-if="popupType === 'Popup'">
                    <div
                    :class="`connectStatus pl-6 pr-6 ${
                      handleHasConnect(item.address) ? 'active' : 'disConnect'
                    } flex center`"
                    :title="
                      handleHasConnect(item.address)
                        ? t('common.isConnect')
                        : t('common.ununited')
                    "
                  ></div>
                  <div
                    class="connectTo"
                    @click.stop="handleConnectTo(item.address)"
                    :title="`${!handleHasConnect(item.address) ? t('common.connectToSize', {size: activeTab.origin}) : t('common.disconnectToSize', {size: activeTab.origin})}`"

                  >
                    {{
                      !handleHasConnect(item.address)
                        ? t("common.connectTo")
                        : t("common.disconnect")
                    }}
                  </div>
                  </div>
                </div>
                <div class="account-value" v-show="amountType != 'mask'">
                  {{ decimal(item.amount) }} {{ currentNetwork.currencySymbol }}
                </div>
                <div class="account-value" v-show="amountType == 'mask'">
                  ********
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Non-imported accounts -->
        <div class="f-12 lh-16 accountList-tit" v-show="defaultlist.length">
          {{ t("account.createaccount") }}
        </div>
        <div
          v-for="(item, index) in defaultlist"
          :key="item.value"
          :data-selected="
            accountInfo.address.toUpperCase() == item.address.toUpperCase()
              ? true
              : false
          "
          :class="` clickActive van-hairline--bottom`"
          @click="handleAccountFun(item, index)"
        >
          <div class="flex account-card" :title="item.address">
            <div class="flex center select-box">
              <i
                :class="`iconfont ${
                  item.address.toUpperCase() ==
                  accountInfo.address.toUpperCase()
                    ? 'icon-danxuan'
                    : 'icon-danxuan1'
                } `"
              ></i>
            </div>
            <div class="account-icon flex center">
              <div class="account-icon-box">
                <AccountIcon :data="item.icon" :title="item.address" />
              </div>
            </div>
            <div class="account-info flex center-v">
              <div class="account-info-box">
                <div class="account-name flex center-v" :title="item.address">
                  {{ item.name }}
                  <div class="pl-4 pr-4" @click.stop="openModifModal(item)">
                    <i class="iconfont icon-bianji" :title="t('common.modifName')"></i>
                  </div>
                  <div class="flex" v-if="popupType === 'Popup'">
                    <div
                    :class="`connectStatus pl-6 pr-6 ${
                      handleHasConnect(item.address) ? 'active' : 'disConnect'
                    } flex center`"
                    :title="
                      handleHasConnect(item.address)
                        ? t('common.isConnect')
                        : t('common.ununited')
                    "
                  ></div>
                  <div
                    class="connectTo"
                    @click.stop="handleConnectTo(item.address)"
                    :title="`${!handleHasConnect(item.address) ? t('common.connectToSize', {size: activeTab.origin}) : t('common.disconnectToSize', {size: activeTab.origin})}`"

                  >
                    {{
                      !handleHasConnect(item.address)
                        ? t("common.connectTo")
                        : t("common.disconnect")
                    }}
                  </div>
                  </div>
                </div>
                <div class="account-value" v-show="amountType != 'mask'">
                  {{ decimal(item.amount) }} {{ currentNetwork.currencySymbol }}
                </div>
                <div class="account-value" v-show="amountType == 'mask'">
                  ********
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- button set -->
      <div class="flex between btn-group border-top pt-20">
        <div class="flex between btn-group-box">
          <div class="btn-box">
            <van-button
              class="btn flex center"
              :loading="createLoading"
              @click="handleCreateAccount"
            >
              <i class="iconfont icon-chuangjianren"></i>
            </van-button>
            <div class="text-center text text-bold lh-16">
              {{ t("account.create") }}
            </div>
          </div>
          <div class="btn-box" @click="toImport">
            <div class="btn flex center">
              <i class="iconfont icon-xiazai"></i>
            </div>
            <div class="text-center text text-bold lh-16">
              {{ t("account.import") }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </van-dialog>
  <!-- Modify the account name popup -->
  <ModifNameModal v-model="showModifName" :data="modifData" />

  <CommonModal v-model="showConnectModal" :title="connectModalTit">
    <div>
      <div class="source-tit text-left mt-20 mb-14 pl-20 pr-20">{{ t('common.source') }}</div>
      <div class="flex center ml-20 mr-20">
        <div class="sender flex center-v  f-14 pl-10 pr-10">
          <div class="icon flex center mr-10">
            <img :src="activeTab.favIconUrl" alt="" />
          </div>
          <div class="origin van-ellipsis text-bold text-left">
            {{ activeTab.origin }}
          </div>
        </div>
      </div>
      <div class="text-left connectTip lh-20 pl-20 pr-20">{{ connectTip }}</div>
      <div class="source-tit text-left mt-10 mb-14 pl-20 pr-20">{{ t('minerspledge.address') }}:</div>
      <div class="connectAddr text-left pl-20 pr-20">
        {{ connectAddr }}
      </div>
      <div class="flex between p-30 connect-btns">
        <van-button @click="showConnectModal = false">{{
          t("common.cancel")
        }}</van-button>
        <van-button
          type="primary"
          @click="handleConnectFun"
          :loading="connectLoading"
          >{{ connectModalTit }}</van-button
        >
      </div>
    </div>
  </CommonModal>
</template>
<script lang="ts">
// @ts-nocheck
import {
  defineComponent,
  Ref,
  ref,
  watch,
  SetupContext,
  computed,
  reactive,
  nextTick,
  onMounted,
  onActivated,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToggleAccount } from "@/popup/components/accountModal/hooks/toggleAccount";
import { Icon, Dialog, Button, Loading, Toast } from "vant";
import AccountIcon from "@/popup/components/accountIcon/index.vue";
import { decimal } from "@/popup/utils/filters";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import ModifNameModal from "@/popup/components/modifNameModal/index.vue";
import { AccountInfo } from "@/popup/store/modules/account";
import CommonModal from "@/popup/components/commonModal";
import { sendBackground } from "@/popup/utils/sendBackground";
import { show } from "../navHeader/hooks/slider";
import { useToast } from "@/popup/plugins/toast";
export default defineComponent({
  name: "accountModal",
  components: {
    [Icon.name]: Icon,
    [Dialog.Component.name]: Dialog.Component,
    [Button.name]: Button,
    [Loading.name]: Loading,
    AccountIcon,
    ModifNameModal,
    CommonModal,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  setup(props: any, context: SetupContext) {
    const { emit }: any = context;
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const i18n = useI18n();
    const { dispatch } = store;
    const { t } = useI18n();
    const accountInfo = computed(() => store.state.account.accountInfo);
    const currentNetwork = computed(() => store.state.account.currentNetwork);
    const showModal: Ref<boolean> = ref(false);
    // Balance display type
    const amountType = computed(() => store.state.system.amountType);
    const popupType = window.pageType
    // Imported accounts
    const importList = computed(() => {
      return store.state.account.accountList.filter(
        (item: AccountInfo) => item.imported
      );
    });
    // Non-imported accounts
    const defaultlist = computed(() => {
      return store.state.account.accountList.filter(
        (item: AccountInfo) => !item.imported
      );
    });
    const {
      toggleAccount,
      handleAccount,
      createAccount,
      createLoading,
      accountLoading,
    } = useToggleAccount();
    const clickAccountIdx = ref(null);
    const clickAccountIdx2 = ref(null);
    const handleAccountFun = (item: any, idx: number) => {
      handleAccount(item, idx, clickAccountIdx);
    };
    const handleAccountFun2 = (item: any, idx: number) => {
      handleAccount(item, idx, clickAccountIdx2);
    };
    watch(
      () => props.modelValue,
      (n) => {
        showModal.value = n;
        if (n) {
          let time = setTimeout(() => {
            handleScroll();
            clearTimeout(time);
          }, 100);
        }
      },
      {
        immediate: true,
      }
    );

    watch(
      () => showModal.value,
      (n) => {
        if (!n) {
          emit("update:modelValue", false);
        }
      }
    );
    const toImport = () => {
      showModal.value = false;
      const name: any = route.name;
      router.push({
        name: "importAccount-step1",
        // name: 'import',
        query: {
          backUrl: name,
        },
      });
    };
    const del = (idx: number) => {
      dispatch("account/deleteAccount", idx);
    };
    // Balance Display Type Modify Name pop-up Modify name pop-up
    const showModifName = ref(false);
    const modifData = ref({});
    const openModifModal = (item: any) => {
      modifData.value = item;
      showModifName.value = true;
    };

    const handleCreateAccount = async () => {
      Toast.loading({
        message: i18n.t("userexchange.loading"),
        forbidClick: true,
        loadingType: "spinner",
      });
      console.log("loading");
      let time = setTimeout(async () => {
        await createAccount();
        await dispatch("common/scrollBottom", { id: "account-list" });
        let time2 = setTimeout(() => {
          Toast.clear();
          clearTimeout(time2);
          handleScroll();
        }, 1000);
        clearTimeout(time);
      });
    };
    const listDom = ref();
    const handleScroll = () => {
      const listDoms = listDom.value;
      const newList = Array.from(listDoms.children);
      const ele: any = newList.find(
        (item: any) => item.dataset.selected == "true"
      );
      const hei = ele.offsetTop - ele.offsetHeight;

      console.warn("hei", hei);
      dispatch("common/scrollTop", {
        id: "listDom",
        top: hei,
      });
    };
    const activeTab = ref(null);
    const isConnectList = ref([]);
    const initConectData = () => {
      return new Promise(async(resolve, reject) => {
        const connectList = await chrome.storage.local.get(["connectList"]);
        console.log("connectList", connectList);
        chrome.tabs.query(
          { active: true, currentWindow: true },
          (tabs: Array<[]>) => {
            console.log("tabs", tabs);
            activeTab.value = tabs.find((item) => item.active);
            activeTab.value.origin = getHostName(activeTab.value.url);
            console.log(" activeTab.value", activeTab.value);
            connectList.connectList.forEach((element) => {
              if (
                element.origin.toUpperCase() ===
                activeTab.value.origin.toUpperCase()
              ) {
                isConnectList.value = element.accountList;
              }
              resolve();
            });
            resolve();
          }
        );
      });
    };

    onMounted(async () => {
      initConectData();
    });

    onActivated(() => {
      initConectData();
    });
    const showConnectModal = ref(false);
    const connectModalTit = ref("");
    const connectType = ref("connectByAddress");
    const connectTip = ref(t("common.connectTip"));
    const connectAddr = ref("");
    const handleHasConnect = (addr: string) => {
      return isConnectList.value.includes(addr);
    };

    const handleConnectTo = (addr: string) => {
      showConnectModal.value = true;
      if (handleHasConnect(addr)) {
        connectType.value = "disconnectByAddress";
        connectModalTit.value = t("common.disconnect");
        connectTip.value = t("common.disconnectTip");
      } else {
        connectType.value = "connectByAddress";
        connectModalTit.value = t("common.connectTo");
        connectTip.value = t("common.connectTip");
      }
      connectAddr.value = addr;
    };
    const {$toast} = useToast()
    const connectLoading = ref(false);
    const handleConnectFun = () => {
      connectLoading.value = true;
      sendBackground({
        method: connectType.value,
        response: {
          code: "200",
          data: { address: connectAddr.value, sender: { ...activeTab.value } },
        },
      });
      let time = setTimeout(() => {
        connectLoading.value = false;
        showConnectModal.value = false;
        initConectData();
        $toast.success(connectType.value ==='connectByAddress' ? t('common.connectSuccess') : t('common.disconnectSuccess'))
        clearTimeout(time);
      }, 1000);
    };
    return {
      showConnectModal,
      connectLoading,
      handleConnectFun,
      popupType,
      handleConnectTo,
      connectTip,
      connectAddr,
      handleHasConnect,
      connectModalTit,
      t,
      activeTab,
      listDom,
      isConnectList,
      toggleAccount,
      handleAccount,
      createAccount,
      createLoading,
      accountLoading,
      clickAccountIdx,
      clickAccountIdx2,
      handleAccountFun,
      handleAccountFun2,
      currentNetwork,
      toImport,
      showModal,
      decimal,
      accountInfo,
      openModifModal,
      showModifName,
      modifData,
      del,
      handleCreateAccount,
      defaultlist,
      importList,
      amountType,
    };
  },
});

function getHostName(url = "") {
  const protocol = url.split("://")[0];
  const regex = /.*\:\/\/([^\/]*).*/;
  const match = url.match(regex);
  let host = "";
  if (typeof match != "undefined" && null != match) {
    host = match[1];
  }
  return `${protocol}://${host}`;
}
</script>
<style lang="scss" scoped>
.name-box {
  max-width: 120px;
}
.connect-btns {
  button {
    min-width: 100px;
  }
}
.connectAddr {
  font-size: 14px;
  color: #000;
  word-break: break-all;
  word-wrap: break-word;
}
.source-tit {
  color: #000;
  font-size: 14px;
  font-weight: bold;
  text-align: left;
}
.sender {
  border: 1px solid #ccc;
  height: 40px;
  width: 100%;
  border-radius: 20px;
  .icon {
    img {
      width: 20px;
      display: block;
    }
  }
  .origin {
    width: 90%;
    color: #000;
    font-size: 13px;
  }
}
.connectTip {
  color: #000;
  margin-top: 10px;
  font-size: 14px;
  font-weight: bold;
}
.connectTo {
  color: #9F54BA;
  margin-left: 5px;
}
.connectStatus {
  &.active::after {
    content: "";
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background: rgb(11, 211, 11);
  }
  &.disConnect::after {
    content: "";
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background: #ccc;
  }
}
.select-box {
  margin-right: 12px;
  i {
    font-size: 18px;
    color: #9F54BA;
  }
}
.btn-group {
  padding: 20px 50px;
}
.btn-group-box {
  width: 180px;
  margin: 0 auto;
}
.accountList-tit {
  color: #8f8f8f;
  padding: 0 20px;
  margin-top: 24px;
}
:deep(.van-loading) {
  width: 22px;
  height: 22px;
}
.btn-box {
  .btn {
    width: 34px;
    height: 34px;
    box-sizing: border-box;
    border-radius: 17px;
    border: 1px solid #9F54BA;
    cursor: pointer;
    &:hover {
      background: #9F54BA;
      i {
        color: #fff;
      }
    }
    i {
      font-size: 16px;
      color: #9F54BA;
    }
  }
  .text {
    color: #9F54BA;
    font-size: 12px;
  }
}
.account-card {
  height: 72px;
  padding: 0 15px;
  transition: ease 0.3s;
  &:hover {
    background: #F8F3F9;
    color:#9F54BA;
    
    .account-value,.account-name i {
      color:#9F54BA;

    }
  }
  .account-icon {
    padding: 0 6px 0 0;
    &-box {
      border-radius: 3px;
      overflow: hidden;
    }
  }
  .account-name {
    line-height: 18px;
    font-size: 12px;
    i {
      font-size: 14px;
      color: #a9a6a6;
    }
  }
  .account-value {
    color: #a9a6a6;
    line-height: 18px;
  }
  .account-info-box {
    width: 240px;
  }
  .add-choose-icon {
    width: 100%;
    i {
      color: rgb(13, 215, 13);
      font-size: 14px;
    }
  }
}
.title {
  color: #000;
  font-size: 15px;
  line-height: 62px;
  background: #F8F3F9;
  font-weight: bold;
}
.account-list {
  max-height: 300px;
  overflow-y: scroll;
}
.icon-weibiaoti-1_xinzengzhanghu {
  font-weight: bold;
  font-size: 20px !important;
}
</style>