<template>
  <div class="transactionList">
    <van-sticky>
      <NavHeader :hasRight="false">
        <template v-slot:left>
          <div class="flex center cancel" @click="clickLeft">
            <van-icon name="arrow-left" />
          </div>
        </template>
        <template v-slot:title>
          <div class="flex center title">{{t('transactionList.transactionrecord')}}</div>
        </template>
      </NavHeader>
    </van-sticky>
    <div class="page-container">
            <div class="swap-list van-hairline--top">
      <!-- transaction record -->
      <CollectionCard @handleClick="handleView(item)" v-for="item in transactionList" :key="item.address" :data="item" />
      <no-data v-if="!transactionList.length" />
      <!-- View transaction details -->
      <van-dialog v-model:show="showTransactionModal" title :showCancelButton="false" :showConfirmButton="false" closeOnClickOverlay>
        <TransactionDetail @handleClose="handleClose" :data="transactionData.data" />
      </van-dialog>
    </div>
    </div>
  </div>
</template>
  <script lang="ts">
import { Icon, Toast, Button, Sticky, Field, Dialog, Form, Empty } from "vant";
import NavHeader from "@/popup/components/navHeader/index.vue";
import { useRouter } from "vue-router";
import { computed,Ref,ref,reactive } from "vue";
import { useStore } from "vuex";
import CollectionCard from '@/popup/views/account/components/collectionCard/index.vue'
import TransactionDetail from '@/popup/views/account/components/transactionDetail/index.vue'
import { useI18n } from 'vue-i18n'
export default {
  name: "transactionList",
  components: {
    NavHeader,
    [Sticky.name]: Sticky,
    [Icon.name]: Icon,
    [Empty.name]:Empty,
    [Dialog.Component.name]: Dialog.Component,
    CollectionCard,
    TransactionDetail
  },
  setup() {
    const{t}=useI18n()
    const router = useRouter();
    const store = useStore();
    const transactionList = computed(() => {
      const { accountInfo } = store.state.account;
      const { address } = accountInfo;
      const list =
        store.state.account.currentNetwork.transactionList[
          address.toUpperCase()
        ];
      return list || [];
    });
    // Transaction details data
    let transactionData: any = reactive({ data: {} })
    const showTransactionModal: Ref<boolean> = ref(false)
    // View transaction details events
    const handleView = (e: any) => {
      transactionData.data = e
      showTransactionModal.value = true
    }
    const handleClose = () => {
      showTransactionModal.value = false
    }
    const clickLeft = () => {
      router.back();
    };
    return {
      t,
      clickLeft,
      transactionList,
      handleView,
      handleClose,
      showTransactionModal,
      transactionData
    };
  },
};
</script>
<style lang="scss" scoped>
.transactionList {
  .cancel {
    font-size: 12px;
    color: #9F54BA;
    i {
      font-size: 20px;
    }
  }
  .title {
    font-size: 17px;
  }
}
</style>