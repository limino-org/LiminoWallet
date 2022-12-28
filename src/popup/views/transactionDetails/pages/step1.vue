<template>
  <div class="currency">
    <div class="currency-bd">
      <div class="flex center">
        <div
          class="flex center currency-icon"
          v-for="item in accountInfo.token"
          :key="item"
        >
          <img
            class="currency-symbol"
            v-if="item"
            src="@/assets/icon_black.svg"
          />
        </div>
      </div>
      <div class="amount text-center text-bold pl-14 pr-14">
        {{ decimal(pageData.data.balance) }} {{ pageData.data.name }}
      </div>
      <div class="f-12 text-center lh-16 mt-6 balance">
        {{ toUsdSymbol(pageData.data.balance) }}
      </div>
      <div class="flex center">
        <div class="actions-list flex between">
          <div class="actions-list-card">
            <div
              class="actions-list-card-icon flex center"
              @click.stop="toogleAcceptCode"
            >
              <i class="iconfont icon-teshujiantouzuoxiantiao"></i>
            </div>
            <div class="actions-list-card-label text-center">
              {{ t("wallet.recive") }}
            </div>
          </div>
          <div class="actions-list-card" @click="toSend">
            <div class="actions-list-card-icon flex center">
              <i class="iconfont icon-teshujiantouzuoxiantiao-copy"></i>
            </div>
            <div class="actions-list-card-label text-center">
              {{ t("wallet.send") }}
            </div>
          </div>
          <!-- <div class="actions-list-card">
            <div class="actions-list-card-icon flex center" @click="toSwap">
              <i class="iconfont icon-icon_huabanfuben"></i>
            </div>
            <div class="actions-list-card-label text-center">
              {{ t("wallet.swap") }}
            </div>
          </div> -->
        </div>
      </div>
    </div>
    <div class="swap-list van-hairline--top">
      <CollectionCard
        @handleClick="handleView(item)"
        @handleSend="handleSend"
        @handleCancel="handleCancel"
        v-for="item in txList"
        :key="item.address"
        :data="item"
      />
      <no-data v-if="!txList.length" />
      <!-- View transaction details -->
      <van-dialog
        v-model:show="showTransactionModal"
        :showCancelButton="false"
        class="transaction-modal"
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
  <div class="flex center fixed-bottom">
      <div class="container">
        <span class="f-12 view-history hover" @click="toBrowser">{{
          t("wallet.toBrowser")
        }}</span>
      </div>
    </div>

    <CommonModal
    v-model="showSpeedModal"
    :title="sendTxType == 1 ? t('common.gasSpeedUp') : t('transationHistory.cancelDealTit')"
    className="transactionDetailsModal"
  >
    <div class="m-14 pl-14 pr-14 border-round detail-modal">
      <div class="flex between lh-16 pt-12 pb-8">
        <span>{{ t("transactionDetails.nonce") }}</span>
        <span>#{{ sendTx.sendData.nonce }}</span>
      </div>
      <div class="flex between lh-16 pt-8 pb-8 border-bottom">
        <span>{{ t("sendto.gasLimit") }}</span>
        <span>{{
          ethers.utils.formatUnits(sendTx.sendData.gasLimit, "wei")
        }}</span>
      </div>
      <div class="flex between lh-16 pt-8 pb-8">
        <span>{{ t("converSnft.amount") }}</span>
        <span>{{!sendTx.tokenAddress ? ethers.utils.formatEther(sendTx.sendData.value) : sendTx.amount }}</span>
      </div>
      <div class="flex between lh-16 pt-8 pb-8">
        <span>{{ t("transactionDetails.gasfee") }}</span>
        <span>{{
          sendTx.sendData.gasPrice
            ? ethers.utils.formatEther(sendTx.sendData.gasPrice)
            : 0
        }}</span>
      </div>
      <div class="flex between lh-16 pt-8 pb-12">
        <span>{{ t("transactionDetails.totalAmount") }}</span>
        <span>≈ {{!sendTx.tokenAddress ? ethers.utils.formatEther(sendTx.sendData.value) : sendTx.amount}} {{currentNetwork.currencySymbol}}</span>
      </div>
    </div>
    <ModifGasFee
      :show="showSpeedModal"
      :to="sendTx.to"
      :gasPrice="sendTx.gasPrice"
      :gasLimit="sendTx.gasLimit"
      :amount="ethers.utils.formatEther(sendTx.sendData.value)"
      @change="handleGasChange"
    />
    <div class="sendBtnBox pb-20 mt-20">
      <van-button @click="showSpeedModal = false" class="mr-26">{{
        t("common.cancel")
      }}</van-button>
      <van-button type="primary" @click="reSendTx" :loading="reloading">{{
        t("common.confirm")
      }}</van-button>
    </div>
  </CommonModal>
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
  onUnmounted,
} from "vue";
import { Icon, Popup, Empty, Dialog, Sticky, Toast, Button } from "vant";
import CollectionCard from "@/popup/views/account/components/collectionCard/index.vue";
import { addressMask, decimal, toUsdSymbol } from "@/popup/utils/filters";
import AcceptCode from "@/popup/views/account/components/acceptCode/index.vue";
import TransactionDetail from "@/popup/views/account/components/transactionDetail/index.vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { hexValue } from "@ethersproject/bytes";
import { useI18n } from "vue-i18n";
import localforage from "localforage";
import eventBus from "@/popup/utils/bus";
import ModifGasFee from "../components/modifGasFee.vue";
import CommonModal from "@/popup/components/commonModal/index.vue";
import { getWallet,clone,TransactionSendStatus } from '@/popup/store/modules/account';
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { web3 } from "@/popup/utils/web3";

export default {
  components: {
    [Icon.name]: Icon,
    [Popup.name]: Popup,
    [Empty.name]: Empty,
    [Sticky.name]: Sticky,
    [Button.name]: Button,
    [Dialog.Component.name]: Dialog.Component,
    CollectionCard,
    AcceptCode,
    TransactionDetail,
    ModifGasFee,
    CommonModal
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const store = useStore();
    const { query } = useRoute();
    const { tokenContractAddress } = query;
    const accountInfo = computed(() => store.state.account.accountInfo);
    const currentNetwork = computed(() => store.state.account.currentNetwork);

    const txList = ref([]);
    const pageData = reactive({ data: {} });
    pageData.data = query;

    const toogleAcceptCode = () => {
      router.push({
        name: "receive-choose",
        query: { backUrl: "receive-choose-code" },
      });
    };

    const getPageList = async () => {
      console.warn('getPageList')
      Toast.loading({ duration: 0 });
      let time = setTimeout(async() => {
        try {
        txList.value = [];
        const id = currentNetwork.value.id;
        const targetAddress = accountInfo.value.address.toUpperCase();
        const tx: any = await localforage.getItem(`txlist-${id}-${targetAddress}`);
        if (tx && tx.length) {
          const list = tx || [];
          if (tokenContractAddress) {
            txList.value = list.filter(
              (item: any) =>
                item.tokenAddress &&
                item.tokenAddress.toUpperCase() ==
                  tokenContractAddress.toString().toUpperCase()
            );
          } else {
            txList.value = list.filter((item: any) => !item.tokenAddress);
          }
          console.warn('txList.value', txList.value)
        }
      } finally {
        Toast.clear();
      }
      clearTimeout(time)
      },50)
    };
    let waitTime: any = ref(null)
    onMounted(async () => {
      getPageList()
      store.dispatch("account/waitTxQueueResponse", {time: null, callback(e: any){
        console.warn('e', e)
        waitTime.value = e
      }}).then(res => {
        if(res !== true){
          eventBus.off('txPush')
      eventBus.off('txupdate')
        getPageList()
        }
      });
    });
    const toSend = () => {
      router.push({ name: "send", query });
    };
    const toSwap = () => {};
    let transactionData: any = reactive({ data: {} });
    const showTransactionModal: Ref<boolean> = ref(false);
    const handleView = (e: any) => {
      transactionData.data = e;
      showTransactionModal.value = true;
    };
    const handleClose = () => {
      showTransactionModal.value = false;
    };
    const showSpeedModal = ref(false);
    const sendTx = ref({});
    // 1 speed up  2 cancel
    const sendTxType = ref(1)
    const handleSend = (data: any) => {
      console.log('handleSend...')
      handleClose()
      sendTxType.value = 1
      sendTx.value = data;
      showSpeedModal.value = true;
      console.log('sendTx---', sendTx.value)
    };

    const handleCancel = (data: any) => {
      handleClose()
      sendTxType.value = 2
      console.warn("cancel...", data);
      sendTx.value = data;
      showSpeedModal.value = true;
    };

    const gasLimit = ref("0");
    const gasPrice = ref("0");
    const handleGasChange = (gasData: any) => {
      const { gasLimit: limit, gasPrice: gprice } = gasData;
      console.warn('limit', limit)
      console.warn('gprice', gprice)
      gasLimit.value = limit;
      gasPrice.value = gprice;
    };
    const reloading = ref(false);
    const reSendTx = async () => {
      reloading.value = true;
      if(sendTxType.value === 1){
        resend()
      }
      if(sendTxType.value === 2){
        cancelSend()
      }
    };
    eventBus.on('txPush', (data: any) => {
      // @ts-ignore
      txList.value.unshift(data)
    })
    eventBus.on('txUpdate', (data: any) => {
      console.warn('txupdate', data)
      for(let i = 0;i<txList.value.length;i++){
        let item = txList.value[i]
        const {txId} = item
        if(txId == data.txId) {
          // @ts-ignore
          txList.value[i] = data
        }
      }
    })
    onUnmounted(() => {
      // console.warn('waitTime.value', waitTime.value)

      if(waitTime.value) {
        clearInterval(waitTime.value)
      }
      eventBus.off('txPush')
      eventBus.off('txupdate')
    })
    const cancelSend = async() =>{
      try {
        const wallet = await getWallet();
        const network = await wallet.provider.getNetwork();
        const { nonce, to, network: localNet, value, tokenAddress, amount, transitionType, txType, data: newData, sendData, txId }: any = sendTx.value;
        const gasp = Number(gasPrice.value)
          ? new BigNumber(gasPrice.value).dividedBy(1000000000).toFixed(12)
          : "0.0000000012";
        const bigGas = ethers.utils.parseEther(gasp);
        const tx = {
          to: wallet.address,
          nonce,
          gasPrice: bigGas,
          gasLimit: gasLimit.value,
          chainId: network.chainId,
          value: ethers.utils.parseEther('0')
        };
        let data = await wallet.sendTransaction(tx);
        const {hash,from,type, value: newVal} = data
        store.commit("account/UPDATE_TRANSACTION", {
          ...sendTx.value,
          receipt: {
            from,
            to,
            status: 0
          },
          gasPrice: bigGas,
          gasLimit,
          txId,
          isCancel: true
        });
        data.date = new Date()
        store.commit("account/PUSH_TXQUEUE", {
        hash,
        from,
        gasLimit: gasLimit.value,
        gasPrice: gasPrice.value,
        nonce,
        to,
        type,
        value: newVal,
        transitionType: transitionType || null,
        txType,
        network: clone(localNet),
        data: clone(newData),
        sendStatus: TransactionSendStatus.pendding,
        sendData:  clone(data),
        tokenAddress,
        amount: '0'
      });
        sessionStorage.setItem("new tx", JSON.stringify(data));
        const receipt = await wallet.provider.waitForTransaction(data.hash, null, 60000);
        await store.dispatch('account/waitTxQueueResponse')
        getPageList()
      } catch (err) {
        console.error(err);
        Toast(err.reason)
      } finally {
        showSpeedModal.value = false;
        reloading.value = false;
      }
    }

    const resend = async() => {
      try {
        
        const wallet = await getWallet();
        const network = await wallet.provider.getNetwork();
        const { nonce, to, network: localNet, value, tokenAddress, amount, transitionType, txType, data: newData, sendData,toAddress }: any = sendTx.value;
        const gasp = Number(gasPrice.value)
          ? new BigNumber(gasPrice.value).dividedBy(1000000000).toFixed(12)
          : "0.0000000012";
        const bigGas = ethers.utils.parseEther(gasp);
        const tx: any = {
          to,
          nonce,
          gasPrice: bigGas,
          gasLimit: gasLimit.value,
          chainId: network.chainId,
        };
        console.warn('tx', tx)
        let data = null
        if(tokenAddress) {
          const { contractWithSigner, contract } = await store.dispatch("account/connectConstract", tokenAddress);
          const amountWei = web3.utils.toWei((amount || 0) + '','ether')
          console.log('amountWei', amountWei)
          console.log('gasp', gasp)
          console.log(' gasLimit.value',  gasLimit.value)
          const transferParams = {
            nonce,
            gasPrice: bigGas,
            gasLimit: gasLimit.value,
          }
          data = await contractWithSigner.transfer(toAddress, amountWei, transferParams)
        } else {
          tx.value = value
          data = await wallet.sendTransaction(tx);
        }
        const {hash,from,type, value: newVal} = data
        store.commit("account/UPDATE_TRANSACTION", {
          ...sendTx.value,
          receipt: {
            from,
            to,
            status: 0
          },
          gasPrice: gasPrice.value,
          gasLimit,
        });

        store.commit("account/PUSH_TXQUEUE", {
        hash,
        from,
        gasLimit: gasLimit.value,
        gasPrice: gasPrice.value,
        nonce,
        to,
        type,
        value: newVal,
        transitionType: transitionType || null,
        txType,
        network: clone(localNet),
        data: clone(newData),
        sendStatus: TransactionSendStatus.pendding,
        sendData:  clone(data),
        tokenAddress,
        amount
      });
        sessionStorage.setItem("new tx", JSON.stringify(data));
        const receipt = await wallet.provider.waitForTransaction(data.hash, null, 60000);
        await store.dispatch('account/waitTxQueueResponse')
        getPageList()
      } catch (err) {
        console.error(err);
        Toast(err.reason)
      } finally {
        showSpeedModal.value = false;
        reloading.value = false;
      }
    }

    const toBrowser = () => {
      window.open(currentNetwork.value.browser);
    };
    return {
      handleCancel,
      handleSend,
      handleGasChange,
      sendTxType,
      reSendTx,
      sendTx,
      ethers,
      resend,
      cancelSend,
      t,
      accountInfo,
      toogleAcceptCode,
      toSend,
      showSpeedModal,
      toSwap,
      handleView,
      handleClose,
      showTransactionModal,
      transactionData,
      decimal,
      currentNetwork,
      pageData,
      toBrowser,
      toUsdSymbol,
      reloading,
      txList,
    };
  },
};
</script>
<style lang="scss" scoped>
.swap-list {
  height: calc(100vh - 48PX - 245px - 50PX);
  overflow-y: scroll;
}
.fixed-bottom {
  height: 50px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}
.view-history {
  color: #037cd6;
}
.currency {
  .currency-bd {
    background: rgba(244, 250, 255, 1);
    height: 235px;
  }
  .currency-icon {
    // background: rgba(3, 125, 214, 1);
    border-radius: 50%;
    width: 40px;
    height: 40px;
  }

  &-icon {
    margin-top: 24px;
    width: 34px;
    height: 59px;
    margin-bottom: 20px;
  }
  .amount {
    line-height: 20px;
    font-size: 24px;
    margin-top: 8px;
    word-break: break-all;
  }
  .balance {
    color: #848484;
  }
  .actions-list {
    &-card {
      width: 32px;
      margin: 17px 22px 22px;

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