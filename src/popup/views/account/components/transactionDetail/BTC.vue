<template>
    <div class="transaction-detail">
      <div class="title f-16 text-center">
        {{ title }}
      </div>
      <div class="tran-form mt-20">
        <div class="form-box ml-14 mr-14">
          <div class="card flex between card-border">
            <div class="label flex between label-full">
              <span>{{ t("transactionDetails.status") }}</span>
            </div>
            <div
              :class="`value flex right center-v status ${transactionBTCStatusClass(
                data
              )}`"
            >
              <span>{{ transactionBTCStatus(data) }}</span>
            </div>
          </div>
          <div class="card flex between card-border">
            <div class="label">{{ t("transactionDetails.date") }}</div>
            <div class="value">
              {{ formatBTCTxDate(data) }}
            </div>
          </div>
          <div class="card flex between smallpad">
            <div class="label">{{ t("transactionDetails.from") }}</div>
            <div class="value">{{ addressMask(data.from) }}</div>
          </div>
          <div class="card flex between card-border smallpad2">
            <div class="label">{{ t("transactionDetails.to") }}</div>
            <div class="value">{{ addressMask(data.to) }}</div>
          </div>
          <div class="card flex between card-border">
            <div class="label">{{ t("transactionDetails.byteSize") }}</div>
            <div class="value">{{ data.size || 0 }} Bytes</div>
          </div>
          <div class="card flex between card-sml pt-10">
            <div class="label">
              {{
            t("transactionDetails.transferAmount")
              }}
            </div>
            <div class="value">{{ transferBTCAmountText(data) }} BTC</div>
          </div>
          <div class="card flex between card-sml">
            <div class="label">
              {{ t("transactionDetails.gasfee") }}
              <van-popover
                v-model:show="showPopover"
                theme="dark"
                placement="top-start"
              >
                <div
                  class="f-12 pl-10 pr-10 pt-10 pb-10"
                  @click="showPopover = false"
                >
                  {{ t("common.gasFee") }}
                </div>
                <template #reference>
                  <van-icon
                    name="question hover"
                    @mouseover="showPopover = true"
                    @mouseout="showPopover = false"
                  />
                </template>
              </van-popover>
            </div>
            <div class="value green">
              {{ gasFee }} BTC
            </div>
          </div>
          <div class="card flex between card-sml pb-10">
            <div class="label">{{ t("transactionDetails.totalAmount") }}</div>
            <div class="value">
              {{ totalAmount }} BTC
            </div>
          </div>
        </div>
      </div>
      <div class="flex pb-24 mt-22 btn-box">
        <van-button block @click="cancel" class="mr-24">{{
          t("transactionDetails.cancel")
        }}</van-button>
        <van-button block type="primary" @click="view">{{
          t("transactionDetails.viewDetails")
        }}</van-button>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import {
    SetupContext,
    Ref,
    ref,
    reactive,
    onMounted,
    defineComponent,
    computed,
    watch,
  } from "vue";
  import { Icon, Toast, Button, Popover } from "vant";
  import { useRouter } from "vue-router";
  import { useStore } from "vuex";
  import { utils } from "ethers";
  import { copy } from "@/popup/utils/utils";
  import { useI18n } from "vue-i18n";
  import BigNumber from "bignumber.js";
  import { useToast } from "@/popup/plugins/toast";
  import { VUE_APP_SCAN_URL } from "@/popup/enum/env";
  import {
    transactionTarget,
    formatDate,
    addressMask,
    toUsdSymbol,
    transactionStatus,
    formatEther,
    parseEther,
    transactiontxType,
    transferBTCAmountText,
    handleSendStatus,
    txTypeToIcon,
    handleTxType,
    transactionBTCStatusClass,
    transactionBTCStatus,
    formatBTCTxDate,
    formatTxDate,
  } from "@/popup/utils/filters";
  import { viewTransactionByHash } from "@/popup/utils/utils";

import { getWallet } from "@/popup/store/modules/account";
  export default defineComponent({
    name: "transactionDetail",
    emits: ["handleClose", "handleSpeed", "handleCancel"],
    components: {
      [Icon.name]: Icon,
      [Button.name]: Button,
      [Popover.name]: Popover,
    },
    props: {
      data: {
        type: Object,
        default: {},
      },
 
    },
    setup(props: any, context: SetupContext) {
      const { t } = useI18n();
      const { emit } = context;
      const store = useStore();
      const accountInfo = computed(() => store.state.account.accountInfo);
      const currentNetwork = computed(() => store.state.account.currentNetwork);
      const { $toast } = useToast();
      const handleClose = () => {
        emit("handleClose");
      };
      const toCopy = () => {
        copy(props.data.hash).then((res) => {
          Toast.success(t("copy.titlehash"));
        });
      };

      watch(() => props.data, async(n) => {
        if(n){
            const wallet = await getWallet()
        const data = await wallet.provider.getTx(props.data.hash)
        gasFee.value = new BigNumber(data.fee).div(100000000).toString()
        }
      },{
        immediate: true,
        deep: true
      })

      const tolink = () => {
        console.log(currentNetwork.value.browser);
      };
      const showPopover = ref(false);
      // aggregate amount
      const totalAmount = computed(() => {
        const {value, fee, size, sendStatus } = props.data;
        if(sendStatus == 'success' || sendStatus == 'fail') {
            const gas = (new BigNumber(gasFee.value).plus(new BigNumber(value).div(100000000).toString()))
            return gas.toString()
        }
        return new BigNumber(value).div(100000000).toString()
      });
      
      const gasFee = ref('0')
      const view = () => {
        viewTransactionByHash(props.data.hash)
        // window.open(`${VUE_APP_SCAN_URL}TradeDetail/${props.data.hash}`);
      };
      const cancel = () => {
        emit("handleClose");
      };
  
      const handleSpeed = () => {
        emit("handleSpeed", props.data);
      };
      const handleCancel = () => {
        emit("handleCancel", props.data);
      };
      const title = computed(() => {
        return handleTxType(props.data)
      })
      return {
        title,
        handleSpeed,
        handleCancel,
        t,
        cancel,
        view,
        handleClose,
        transactionTarget,
        transactionBTCStatus,
        formatDate,
        addressMask,
        accountInfo,
        formatEther,
        gasFee,
        parseEther,
        formatBTCTxDate,
        toCopy,
        utils,
        showPopover,
        currentNetwork,
        tolink,
        totalAmount,
        transactionStatus,
        formatTxDate,

        transactiontxType,
        transferBTCAmountText,
        handleSendStatus,
        txTypeToIcon,
        handleTxType,
        transactionBTCStatusClass,
      };
    },
  });
  </script>
  
  <style lang="scss" scoped>
  @import "./index.scss";
  </style>
  