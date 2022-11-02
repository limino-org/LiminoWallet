<template>
  <div class="currency">
    <div class="flex center">
      <div
        class="flex center currency-icon"
        v-for="item in accountInfo.token"
        :key="item"
      >
        <img
          class="currency-symbol"
          v-if="item"
          :src="require(`@/popup/assets/token/${item.logoUrl}`)"
          alt="'"
        />
      </div>
    </div>
    <div class="amount text-center pl-14 pr-14">
      {{ decimal(pageData.data.balance) }} {{ pageData.data.symbol }}
    </div>
    <div class="flex center">
      <div class="actions-list flex between">
        <div class="actions-list-card">
          <div
            class="actions-list-card-icon flex center"
            @click.stop="toogleAcceptCode"
          >
            <i class="iconfont icon-bottom"></i>
          </div>
          <div class="actions-list-card-label text-center">
            {{ t("wallet.takeover") }}
          </div>
        </div>
        <div class="actions-list-card">
          <div class="actions-list-card-icon flex center" @click="toBuy">
            <i class="iconfont icon-xinyongkayinhangka"></i>
          </div>
          <div class="actions-list-card-label text-center">
            {{ t("wallet.buy") }}
          </div>
        </div>
        <div class="actions-list-card" @click="toSend">
          <div class="actions-list-card-icon flex center">
            <i class="iconfont icon-jiantou_youshang"></i>
          </div>
          <div class="actions-list-card-label text-center">
            {{ t("wallet.send") }}
          </div>
        </div>
        <div class="actions-list-card">
          <div class="actions-list-card-icon flex center" @click="toSwap">
            <i class="iconfont icon-qiehuan"></i>
          </div>
          <div class="actions-list-card-label text-center">
            {{ t("wallet.swap") }}
          </div>
        </div>
      </div>
    </div>
    <div class="swap-list van-hairline--top">
      <!-- Transactions -->
      <CollectionCard
        @handleClick="handleView(item)"
        v-for="item in transactionList"
        :key="item.address"
        :data="item"
      />

      <no-data v-if="!transactionList.length" />

      <!-- View transaction details -->
      <van-dialog
        v-model:show="showTransactionModal"
        title
        :showCancelButton="false"
        :showConfirmButton="false"
        closeOnClickOverlay
      >
        <TransactionDetail
          @handleClose="handleClose"
          :data="transactionData.data"
        />
      </van-dialog>
    </div>
  </div>
</template>
<script lang="ts">
import {
  ref,
  Ref,
  reactive,
  onMounted,
  computed,
  toRefs,
  onBeforeMount,
} from "vue";
import { Icon, Popup, Empty, Dialog } from "vant";
import CollectionCard from "@/popup/views/account/components/collectionCard/index.vue";
import { addressMask, decimal } from "@/popup/utils/filters";
import AcceptCode from "@/popup/views/account/components/acceptCode/index.vue";
import TransactionDetail from "@/popup/views/account/components/transactionDetail/index.vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { hexValue } from "@ethersproject/bytes";
import { useI18n } from "vue-i18n";
export default {
  components: {
    [Icon.name]: Icon,
    [Popup.name]: Popup,
    [Empty.name]: Empty,
    [Dialog.Component.name]: Dialog.Component,
    CollectionCard,
    AcceptCode,
    TransactionDetail,
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const store = useStore();
    const { query } = useRoute();
    const { tokenContractAddress } = query;
    const accountInfo = computed(() => store.state.account.accountInfo);
    const currentNetwork = computed(() => store.state.account.currentNetwork);
    const transactionList = computed(() => {
      const { accountInfo } = store.state.account;
      const { address } = accountInfo;
      const list =
        store.state.account.currentNetwork.transactionList[
          address.toUpperCase()
        ];
      return list || [];
    });
    const pageData = reactive({ data: {} });
    pageData.data = query;

    // To buy
    const toBuy = () => {};

    // To send
    const toSend = () => {
      router.push({ name: "send", query });
    };
    // To exchange
    const toSwap = () => {};
    // Transaction details data
    let transactionData: any = reactive({ data: {} });
    const showTransactionModal: Ref<boolean> = ref(false);
    // View transaction details event
    const handleView = (e: any) => {
      transactionData.data = e;
      showTransactionModal.value = true;
    };
    const handleClose = () => {
      showTransactionModal.value = false;
    };
    return {
      t,
      accountInfo,
      toSend,
      toBuy,
      toSwap,
      handleView,
      handleClose,
      showTransactionModal,
      transactionData,
      decimal,
      currentNetwork,
      transactionList,
      pageData,
    };
  },
};
</script>
<style lang="scss" scoped>
.swap-list {
  padding-bottom: 60px;
  margin-top: 20px;
}
.currency {
  .currency-symbol {
    width: 60px;
    height: 60px;
  }
  &-icon {
    margin-top: 30px;
    width: 34px;
    height: 59px;
    margin-bottom: 20px;
  }
  .amount {
    line-height: 20px;
    font-size: 24px;
    margin-bottom: 25px;
    word-break: break-all;
  }
  .actions-list {
    &-card {
      width: 32px;
      margin: 0 10px;

      &-icon {
        height: 32px;
        background: rgba(3, 125, 214, 1);
        border-radius: 32px;
        transition: ease 0.3s;
        &:hover {
          background: rgb(4, 110, 190);
          box-shadow: 0 3px 4px rgb(166, 213, 248);
        }
      }
      &-label {
        line-height: 16px;
        color: rgba(3, 125, 214, 1);
        font-size: 12px;
        margin-top: 7px;
      }
    }
  }


}
.iconfont {
  color: #fff;
}
</style>