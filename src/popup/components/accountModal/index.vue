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
      <div class="account-list" ref="listDom" id="listDom">
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
          :class="` clickActive ${
            index < defaultlist.length - 1 ? 'van-hairline--bottom' : ''
          }`"
          @click="handleAccountFun2(item, index)"
        >
          <div class="flex account-card">
            <div class="flex center select-box">
              <i :class="`iconfont ${item.address.toUpperCase() == accountInfo.address.toUpperCase()
 ? 'icon-danxuan' : 'icon-danxuan1'} `"></i>
            </div>
            <div class="account-icon flex center">
              <div class="account-icon-box">
                <AccountIcon :data="item.icon" />
              </div>
            </div>
            <div class="account-info flex center-v">
              <div class="account-info-box">
                <div class="account-name flex center-v">
                  {{ item.name }}
                  <div class="pl-4 pr-4" @click.stop="openModifModal(item)">
                    <i class="iconfont icon-bianji"></i>
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
          :class="` clickActive ${
            index < defaultlist.length - 1 ? 'van-hairline--bottom' : ''
          }`"
          @click="handleAccountFun(item, index)"
        >
          <div class="flex account-card">
            <div class="flex center select-box">
              <i :class="`iconfont ${item.address.toUpperCase() == accountInfo.address.toUpperCase()
 ? 'icon-danxuan' : 'icon-danxuan1'} `"></i>
            </div>
            <div class="account-icon flex center">
              <div class="account-icon-box">
                <AccountIcon :data="item.icon" />
              </div>
            </div>
            <div class="account-info flex center-v">
              <div class="account-info-box">
                <div class="account-name flex center-v">
                  {{ item.name }}
                  <div class="pl-4 pr-4" @click.stop="openModifModal(item)">
                    <i class="iconfont icon-bianji"></i>
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
      <div class="flex between btn-group van-hairline--top pt-20">
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
</template>
<script lang="ts">
import {
  defineComponent,
  Ref,
  ref,
  watch,
  SetupContext,
  computed,
  reactive,
  nextTick,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToggleAccount } from "@/popup/components/accountModal/hooks/toggleAccount";
import { Icon, Dialog, Button, Loading, Toast } from "vant";
import AccountIcon from "@/popup/components/accountIcon/index.vue";
import { decimal } from "@/popup/utils/filters";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import ModifNameModal from "@/popup/components/modifNameModal/index.vue";
export default defineComponent({
  name: "accountModal",
  components: {
    [Icon.name]: Icon,
    [Dialog.Component.name]: Dialog.Component,
    [Button.name]: Button,
    [Loading.name]: Loading,
    AccountIcon,
    ModifNameModal,
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

    const {
      toggleAccount,
      handleAccount,
      createAccount,
      createLoading,
      accountLoading,
      importList,
      defaultlist,
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
        }, 300);
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
    return {
      t,
      listDom,
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
</script>
<style lang="scss" scoped>
  .select-box {
    margin-right: 12px;
    i {
      font-size: 18px;
      color: #037cd6;
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
    border: 1px solid #037cd6;
    cursor: pointer;
    &:hover {
      background: #037cd6;
      i {
        color: #fff;
      }
    }
    i {
      font-size: 16px;
      color: #037cd6;
    }
  }
  .text {
    color: #037cd6;
    font-size: 12px;
  }
}
.account-card {
  height: 72px;
  padding: 0 15px;
  transition: ease 0.3s;
  &:hover {
    background: rgb(244, 247, 250);
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
  background: #f8fcff;
  font-weight: bold;
}
.account-list {
  max-height: 400px;
  overflow-y: scroll;
}
.icon-weibiaoti-1_xinzengzhanghu {
  font-weight: bold;
  font-size: 20px !important;
}
</style>