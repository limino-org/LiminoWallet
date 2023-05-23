<template>
  <div>
    <van-dialog
      v-model:show="showModal"
      teleport="#page-box"
      :class="`transferSingleSNFTModal ${txtype}`"
      :showConfirmButton="false"
      :showCancelButton="false"
      closeOnClickOverlay
      :title="''"
    >
      <div class="title text-center text-bold border-bottom">
        {{ submitText }}
      </div>
      <!-- <div class="flex center pintu mt-20">
          <i class="iconfont icon-pintu"></i>
        </div> -->
      <!-- <div class="text-center f-16 lh-20">
          {{ t("transferNft.confirmconversion") }}
        </div> -->
      <div class="list pl-12 pr-12 mt-20 mb-20" v-if="txtype == '2'">
        <div class="card">
          <!-- <div class="tip">{{ t("transferNft.singleconversionlow") }}</div> -->
          <div class="card-form mt-20 pl-12 pr-12">
            <div class="m-card">
              <div class="m-label">{{ t("transferNft.select") }}</div>
              <div class="m-value">{{ selectNumber }}</div>
            </div>
            <div class="border-bottom"></div>
            <div class="m-card">
              <div class="m-label">{{ t("transferNft.amount") }}</div>
              <div class="m-value">
                {{ selectTotal }} ERB
              </div>
            </div>
            <div class="border-bottom"></div>

            <div class="m-card">
              <div class="m-label">{{ t("transferNft.ratio") }}</div>
              <div class="m-value">{{ ratio }}</div>
            </div>
            <div class="border-bottom"></div>
            <div class="m-card">
              <div class="m-label">{{ t("bourse.gasFee") }}</div>
              <div class="m-value gasFee">≈ {{ gasFee }} ERB</div>
            </div>
          </div>
        </div>
      </div>
      <div class="list pl-12 pr-12 mt-20 mb-20" v-if="txtype == '3'">
        <div class="card">
          <!-- <div class="tip">{{ t("transferNft.singleconversionlow") }}</div> -->
          <div class="card-form mt-20 pl-12 pr-12">
            <div class="m-card">
              <div class="m-label">{{ t("transferNft.select") }}</div>
              <div class="m-value">{{ selectNumber }}</div>
            </div>
            <div class="border-bottom"></div>
            <div class="m-card">
              <div class="m-label">{{ t("transferNft.amount") }}</div>
              <div class="m-value">
                {{ selectTotal }} ERB
              </div>
            </div>
            <div class="border-bottom"></div>
            <div class="m-card">
              <div class="m-label">{{ t("bourse.income") }}</div>
              <div class="m-value">≈ {{myprofit}} ERB</div>
            </div>
            <div class="border-bottom"></div>
            <div class="m-card">
              <div class="m-label">{{ t("bourse.stakingPeriod") }}</div>
              <div class="m-value">1 {{ t("createExchange.year") }}</div>
            </div>
            <div class="border-bottom"></div>
            <div class="m-card">
              <div class="m-label">{{ t("bourse.gasFee") }}</div>
              <div class="m-value gasFee">≈{{ gasFee }} ERB</div>
            </div>
          </div>
        </div>
      </div>
      <div class="list pl-12 pr-12 mt-20 mb-20" v-if="txtype == '1'">
        <div class="card">
          <!-- <div class="tip">{{ t("transferNft.singleconversionlow") }}</div> -->
          <div class="card-form mt-20 pl-12 pr-12">
            <div class="m-card">
              <div class="m-label">{{ t("transferNft.select") }}</div>
              <div class="m-value">{{ selectNumber }}</div>
            </div>
            <div class="border-bottom"></div>
            <div class="m-card">
              <div class="m-label">{{ t("transferNft.amount") }}</div>
              <div class="m-value">
                {{ selectTotal }} ERB
              </div>
            </div>
            <div class="border-bottom"></div>
            <div class="m-card">
              <div class="m-label">{{ t("bourse.hsitoryReturn") }}</div>
              <div class="m-value">
                {{ historyProfit }}ERB
              </div>
            </div>
            <div class="border-bottom"></div>
            <div class="m-card">
              <div class="m-label">{{ t("bourse.gasFee") }}</div>
              <div class="m-value gasFee">≈{{ gasFee }} ERB</div>
            </div>
          </div>
        </div>
      </div>
      <div class="protocol f-12 lh-16 pl-14 pr-14 mb-14 text-center">
        {{ t("transferNft.buyatexchange") }}
      </div>
      <div class="flex evenly pb-30 pl-16 pr-16">
        <van-button @click="cencel">{{ t("transferNft.cancel") }}</van-button>
        <van-button
          :loading="loading"
          :disabled="time < 1 ? false : true"
          type="primary"
          @click="handleComfirm"
        >
          {{ t("transferNft.confirm") }}
          <span v-if="time > 0">({{ time }}S)</span>
        </van-button>
      </div>
    </van-dialog>
  </div>
</template>
  <script lang="ts">
import {
  defineComponent,
  ref,
  Ref,
  watch,
  SetupContext,
  reactive,
  computed,
  toRaw,
} from "vue";
import {
  Dialog,
  Button,
  Field,
  NumberKeyboard,
  Toast,
  CountDown,
  Popover,
} from "vant";
import { regNum2 } from "@/popup/enum/regexp";
import BigNumber from "bignumber.js";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { addressMask } from "@/popup/utils/filters";
import {
  getGasFee,
  getWallet,
  TransactionTypes,
} from "@/popup/store/modules/account";
import { useTradeConfirm } from "@/popup/plugins/tradeConfirmationsModal";
import { TradeStatus } from "@/popup/plugins/tradeConfirmationsModal/tradeConfirm";
import { ethers } from "ethers";
import { web3 } from "@/popup/utils/web3";
import { clone } from "pouchdb-utils";
import { useToast } from "@/popup/plugins/toast";
import { getAccountAddr } from "@/popup/http/modules/common";
//   Pledge redemption of a single SNFT
export default defineComponent({
  name: "transfer-NFT-modal",
  components: {
    [Dialog.Component.name]: Dialog.Component,
    [Button.name]: Button,
    [Field.name]: Field,
    [NumberKeyboard.name]: NumberKeyboard,
    [Popover.name]: Popover,
  },
  emits: ["success", "update:modelValue", "fail"],
  props: {
    // title
    title: {
      type: String,
      default: "Convert to ERB",
    },
    // v-model
    modelValue: {
      type: Boolean,
      default: false,
    },
    // length
    selectNumber: {
      type: Number || String,
      default: 0,
    },
    // total
    selectTotal: {
      type: Number,
      default: 0,
    },
    // list
    selectList: {
      type: Object,
      default: [] || {},
    },
    txtype: {
      type: String,
      default: "3",
    },
  },
  setup(props: any, context: SetupContext) {
    const { t } = useI18n();
    const { emit }: any = context;
    // count down
    const time = ref(3);
    const { $tradeConfirm } = useTradeConfirm();
    const { $toast } = useToast();
    const showModal: Ref<boolean> = ref(false);
    const { dispatch, commit, state } = useStore();
    const { currentNetwork } = state.account;
    watch(
      () => props.modelValue,
      (n) => {
        console.log("selectList", props.selectList);
        console.log("txtype", props.txtype, typeof props.txtype);
        showModal.value = n;
        if (n) {
          let t = setInterval(() => {
            if (time.value == 0) {
              clearInterval(t);
            }
            time.value = time.value - 1;
          }, 1000);
          if (props.txtype == "3" || props.txtype == "1") {
            console.warn("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
            calcProfit();
          }
          calcGasFee();
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
          time.value = 3;
          emit("update:modelValue", false);
          loading.value = false;
        }
      }
    );

    const cencel = () => {
      showModal.value = false;
    };

    const loading = ref(false);
    const handleComfirm = async () => {
      emit("update:modelValue", false);
      console.log("selectList", props.selectList);
      const wallet = await getWallet();
      const { address } = wallet;
      let approveMessage = "";
      let successMessage = "";
      let wattingMessage = "";
      let failMessage = "";
      switch (props.txtype) {
        case "1":
          approveMessage = t("minerspledge.close_approve");
          wattingMessage = t("minerspledge.close_waiting");
          successMessage = t("minerspledge.close_success");
          failMessage = t("minerspledge.close_wrong");
          break;
        case "3":
          approveMessage = t("minerspledge.create_approve");
          wattingMessage = t("minerspledge.create_waiting");
          successMessage = t("minerspledge.create_success");
          failMessage = t("minerspledge.create_wrong");
          break;
      }
      $tradeConfirm.open({
        approveMessage,
        successMessage,
        wattingMessage,
        failMessage,
        disabled: [TradeStatus.pendding],
        callBack: () => {
          emit("success");
        },
        failBack: () => {
          emit("fail");
        },
      });
        const [data] = props.selectList;
        const { nft_address, MergeLevel } = data;
        let nftAdd = nft_address
        switch(MergeLevel){
          case 1:
          nftAdd = nft_address.substr(0, 41);
            break;
          case 2:
          nftAdd = nft_address.substr(0, 40);
            break;
        }
        //debugger;
        try {
          let str = "";
          switch (props.txtype) {
            // transfer
            case "2":
              str = `wormholes:{"type":6,"nft_address":"${nftAdd}","version":"v0.0.1"}`;
              break;
            // pledge
            case "3":
              str = `wormholes:{"type":7,"nft_address":"${nftAdd}","version":"0.0.1"}`;
              break;
            // redemption
            case "1":
              str = `wormholes:{"type":8,"nft_address":"${nftAdd}","version":"0.0.1"}`;
              break;
          }
          console.log('str', str)
          const data3 = toHex(str);
          const tx1 = {
            from: address,
            to: address,
            data: `0x${data3}`,
          };
          const receipt: any = await wallet.sendTransaction(tx1);
          const { from, gasLimit, gasPrice, hash, nonce, to, type, value } =
            receipt;
          commit("account/PUSH_TXQUEUE", {
            hash,
            from,
            gasLimit,
            gasPrice,
            nonce,
            to,
            type,
            value,
            nft_address: nftAdd,
            network: clone(currentNetwork),
            txType: TransactionTypes.other,
          });
          $tradeConfirm.update({
            status: "approve",
          });
          await dispatch("account/waitTxQueueResponse");
          $tradeConfirm.update({
            status: "success",
          });
        } catch (err) {
          console.error(err);
          $tradeConfirm.update({
            status: "fail",
          });
        }
    };

    const submitText = computed(() => {
      let str = "";
      switch (props.txtype) {
        case "2":
          str = t("converSnft.converTit");
          break;
        case "3":
          str = t("createminerspledge.stake");
          break;
        case "1":
          str = t("createExchange.redemption");
          break;
      }
      return str;
    });

    const myprofit = ref("");
    const historyProfit = ref("");
    const calcProfit = async () => {
      const { t0, t1, t2, t3 } = state.configuration.setting.conversion

      try {
        console.log("1---------------------------");
        const wallet = await getWallet();
        const addressInfo = await getAccountAddr(wallet.address)
        console.warn('addressInfo', addressInfo)
        const {rewardSNFTCount,exchangerAmount,snftAmount} = addressInfo
        const exchangeNum = ethers.utils.formatEther(exchangerAmount || '0')
        const snftNum = ethers.utils.formatEther(snftAmount || '0')
        if(props.txtype === '1') {
        
        const rio = new BigNumber(props.selectTotal).div(new BigNumber(exchangeNum).plus(snftNum))
        historyProfit.value = new BigNumber(rewardSNFTCount).multipliedBy(t0).multipliedBy(rio).toFixed(5)
        }
        console.warn('eth_getAllStakers',props.txtype)
        if(props.txtype === '3') {
          const {Stakers} = await wallet.provider.send('eth_getAllStakers')
        console.warn('pledgeTotal', Stakers)
        const totalPledge = Stakers.map((item: any) => item.Balance).reduce((prev, total) => new BigNumber(prev).plus(prev)).div(10000000000000000).toFixed(10)
        console.warn('totalPledge', totalPledge)
        const r = !Number(props.selectTotal) ? new BigNumber(0): new BigNumber(props.selectTotal).div(new BigNumber(exchangeNum).plus(props.selectTotal))
        console.warn('r---', r.toNumber())
        const am = new BigNumber(props.selectTotal).plus(exchangeNum).div(totalPledge).multipliedBy(599184).multipliedBy(r).toFixed(15)
        myprofit.value = am  
      }
      
      
        /**
         * （SNFT质押金额+交易所质押金额）/全网质押金额 * 599184  * （SNFT质押/（SNFT + 交易所））
         * address: "0x7e5f4552091a69125d5dfcb7b8c2659029395bdf"
           balance: "155996997207323999550712"
           code: null
           createdTx: null
           creator: null
           exchangerAmount: "0"
           name: null
           rewardCoinCount: 0
           rewardSNFTCount: 0
           snftAmount: "0"
           symbol: null
           totalNFT: 0
           totalSNFT: 0
           transactionCount: 10
           type: null
           validatorAmount: "70000000000000000000000"
         */

        console.warn("historyProfit", historyProfit.value);
        console.warn("myprofit", myprofit.value);
      } catch (err) {
        console.log("4---------------------------++++++++", err);
      }
    };

    const gasFee = ref("");
    const calcGasFee = async () => {
      try {
        const { address } = state.account.accountInfo;
        console.warn(
          "calc gasfee -----------------------------------:",
          props.selectList
        );
        const [data] = props.selectList;
        let { nft_address, MergeLevel } = data;
        switch (MergeLevel) {
          case 0:
            break;
          case 1:
            nft_address = nft_address.substr(0, 41);
            break;
          case 2:
            nft_address = nft_address.substr(0, 40);
            break;
        }
        console.log("data----------", data);
        let str = "";

        switch (props.txtype) {
          // To pledge
          case "3":
            str = `wormholes:{"type":7,"nft_address":"${nft_address}","version":"0.0.1"}`;
            break;
          // redeemable
          case "1":
            str = `wormholes:{"type":8,"nft_address":"${nft_address}","version":"0.0.1"}`;
            break;
          case "2":
            str = `wormholes:{"type":6,"nft_address":"${nft_address}","version":"0.0.1"}`;
            break;
        }
        console.log("gas fee  - str-------------------", str);
        const data3 = toHex(str);
        const tx1 = {
          from: address,
          to: address,
          data: `0x${data3}`,
        };
        const gas = await getGasFee(tx1);
        gasFee.value = new BigNumber(gas).multipliedBy(1).toFixed(6);
      } catch (err) {
        console.warn("gas err", err);
        $toast.warn(err);
      }
    };

    // cacl ratio
    const ratio = computed(() => {
      const { t0, t1, t2, t3 } = state.configuration.setting.conversion

      if (props.txtype == "1" || props.txtype == "3") {
        return 0.143;
      }
      if (props.txtype == "2") {
        const list = [];
        // Three cases: 1. Collection set is full, 2. SNFT set is full, 3. Fragment does not consider collection case for the time being

        props.selectList.forEach((child: any) => {
          const { MergeLevel, Chipcount, pledgestate, snfts, nft_address } =
            child;
          if (MergeLevel == 0 && Chipcount > 0 && pledgestate == "NoPledge") {
            list.push(...snfts);
          }
          if (MergeLevel > 0 && Chipcount && pledgestate == "NoPledge") {
            list.push(nft_address.substr(0, 41));
          }
        });
        let count = 0;
        let countNum = 0;
        list.forEach((add) => {
          const len = add.length;
          if (len == 42) {
            countNum += 1;
            count = parseFloat(new BigNumber(count).plus(t0).toFixed(8));
          }
          if (len == 41) {
            countNum += 16;
            count = parseFloat(
              new BigNumber(count)
                .plus(new BigNumber(16).multipliedBy(t1))
                .toFixed(8)
            );
          }
          if (len == 40) {
            countNum += 256;
            count = parseFloat(
              new BigNumber(count)
                .plus(new BigNumber(256).multipliedBy(t2))
                .toFixed(8)
            );
          }
        });
        return new BigNumber(count).div(countNum).toFixed(6);
      }
    });
    return {
      ratio,
      t,
      submitText,
      showModal,
      gasFee,
      historyProfit,
      cencel,
      handleComfirm,
      loading,
      time,
      myprofit,
      addressMask,
    };
  },
});

function toHex(str: string) {
  if (str === "") return "";
  var hexCharCode = [];
  for (var i = 0; i < str.length; i++) {
    hexCharCode.push(str.charCodeAt(i).toString(16));
  }
  return hexCharCode.join("");
}
</script>
  <style lang="scss" scoped>
.card-form {
  border: 1px solid #e4e7e8;
  border-radius: 5px;
}
.gasFee {
  color: #3aae55;
}
.title {
  color: #000;
  font-size: 15px;
  line-height: 62px;
  background: #F8F3F9;
  font-weight: bold;
}

:deep(.van-button) {
  width: 100px !important;
}
.pintu {
  i {
    color: #9F54BA;
    font-size: 38px;
  }
}
.protocol {
  color: #b3b3b3;
  span {
    color: #9F54BA;
    text-decoration: underline;
  }
}
.list {
  .card {
    &::after {
      border-radius: 4px;
    }
    .tip {
      color: #8f8f8f;
    }
  }
}
.m-card {
  font-size: 12px;
  padding: 6px;
  .m-label {
    color: #8f8f8f;
    line-height: 20px;
  }
  .m-value {
    line-height: 20px;
    font-size: 12px;
  }
}
// .custom-exchange-modal {
// }
</style>
  