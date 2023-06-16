<template>
  <div>
    <van-dialog
      v-model:show="showModal"
      teleport="#page-box"
      :class="`transfer-NFT-modal type${txtype}`"
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
        <Tip :message="t('common.converTip')" type="warn" />

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
              <div class="m-value">
                ≈ {{ myprofit }} ERB
              </div>
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
import { getAccountAddr } from "@/popup/http/modules/common";
import { useRouter } from "vue-router";
import Tip from '@/popup/components/tip/index.vue'
export default defineComponent({
  name: "transfer-NFT-modal",
  components: {
    [Dialog.Component.name]: Dialog.Component,
    [Button.name]: Button,
    [Field.name]: Field,
    [NumberKeyboard.name]: NumberKeyboard,
    [Popover.name]: Popover,
    Tip
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
    // Exchange type 1/ SNFT fragment 2/ SNFT
    type: {
      type: String,
      default: "1",
    },
    txtype: {
      type: String,
      default: "3",
    },
    ratio: {
      type: Number,
      default: 0.03,
    },
  },
  setup(props: any, context: SetupContext) {
    const { t } = useI18n();
    const { emit }: any = context;
    // count down
    const time = ref(3);
    const router = useRouter();
    const { $tradeConfirm } = useTradeConfirm();
    const showModal: Ref<boolean> = ref(false);
    const { dispatch, commit, state } = useStore();
    watch(
      () => props.modelValue,
      (n) => {
        console.log("selectList", props.selectList);
        console.log("txtype", props.txtype);
        showModal.value = n;
        if (n) {
          let t = setInterval(() => {
            if (time.value == 0) {
              clearInterval(t);
            }
            time.value = time.value - 1;
          }, 1000);
          if (props.txtype == "1" || props.txtype == "3") {
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

    const historyCallBack = () => {
      router.push({ name: "transaction-history" });
    };
    const loading = ref(false);
    const handleComfirm = async () => {
      emit("update:modelValue", false);
      console.log("selectList", props.selectList);
      const wallet = await getWallet();
      const { address } = wallet;
      // loading.value = true;
      let txQueue: Array<any> = [];
      let approveMessage = "";
      let successMessage = "";
      let wattingMessage = "";
      let failMessage = "";
      let amount = new BigNumber(0);
      let pstr = 0;
      let cstr = 0;
      let nstr = 0;
      let fstr = 0;
      let numstr = "";
      let count = 0;
      console.warn("props.txtype", props.txtype, props.type);
      const { t0, t1, t2, t3 } = state.configuration.setting.conversion;

          // coll conver
          if (props.type == "2") {
            console.warn('props.selectList', props.selectList)
            let newCount = 0;
            Object.keys(props.selectList).forEach((key) => {
              if (
                key != "undefined" &&
                props.selectList[key] &&
                props.selectList[key].length
              ) {
                props.selectList[key].forEach((item) => {
                  
                  const { MergeLevel, MergeNumber, snfts } = item;
                  if (MergeLevel == 0) {
                    amount = amount.plus(t0);
                    fstr+=snfts.length;
                    newCount = newCount + snfts.length;
                  }
                  if (MergeLevel == 1) {
                    amount = amount.plus(
                      new BigNumber(MergeNumber).multipliedBy(t1)
                    );
                    newCount = newCount + 1;
                    nstr++;
                  }
                  if (MergeLevel == 2) {
                    amount = amount.plus(
                      new BigNumber(MergeNumber).multipliedBy(t2)
                    );
                    newCount = newCount + 1;
                    cstr++;
                  }
                  if (MergeLevel == 3) {
                    amount = amount.plus(
                      new BigNumber(MergeNumber).multipliedBy(t3)
                    );
                    newCount = newCount + 1;
                    pstr++;
                  }
                });
              }
            });
            count = newCount;

            console.warn('props.txtype newCount',newCount)
            console.warn('props.txtype amount',amount)
            console.warn('props.txtype cstr',cstr)
            console.warn('props.txtype selectList',props.selectList)
          }
          // chip conver
          if (props.type == "1") {
            count = props.selectList.length;
            props.selectList.forEach((item: any) => {
              const { MergeLevel, MergeNumber } = item;
              if (MergeLevel == 0) {
                amount = amount.plus(t0);
                fstr++;
              }
              if (MergeLevel == 1) {
                amount = amount.plus(
                  new BigNumber(MergeNumber).multipliedBy(t1)
                );
                nstr++;
              }
              if (MergeLevel == 2) {
                amount = amount.plus(
                  new BigNumber(MergeNumber).multipliedBy(t2)
                );
                cstr++;
              }
              if (MergeLevel == 3) {
                amount = amount.plus(
                  new BigNumber(MergeNumber).multipliedBy(t3)
                );
                pstr++;
              }
            });

            pstr ? (numstr = numstr + `(L3*${pstr})` + "、") : "";
            cstr ? (numstr = numstr + `(L2*${cstr})` + "、") : "";
            nstr ? (numstr = numstr + `(L1*${nstr})` + "、") : "";
            fstr ? (numstr = numstr + `(L0*${fstr})` + "、") : "";
          }

          numstr = numstr.slice(0, numstr.length - 1);
          console.warn("numstr pstr", pstr);
          console.warn("numstr cstr", cstr);
          console.warn("numstr nstr", nstr);
          console.warn("numstr fstr", fstr);

          console.warn("numstr", numstr);

          approveMessage = t("wallet.conver_approve");
          wattingMessage = t("wallet.conver_waiting", {
            count: `<span style='color:#9F54BA;'>${count}</span>`,
            amount: `<span style='color:#9F54BA;'>${amount.toNumber()}</span>`,
            countstr: numstr,
          });

      $tradeConfirm.open({
        approveMessage,
        successMessage,
        wattingMessage,
        failMessage,
        wattingMessageType: "html",
        disabled: [TradeStatus.pendding],
        callBack: () => {
          emit("success");
        },
        failBack: () => {
          emit("fail");
        },
      });
      console.log("props.type", props.type);
      console.log("props.txtype", props.txtype);
      // coll transfer
      if (props.type == "2") {
        if (props.txtype == "1" || props.txtype == "3") {
          const list = [];
          const keys = Object.keys(props.selectList).filter(
            (item) => item != "undefined"
          );
          for (let key of keys) {
            props.selectList[key].forEach((child: any) => {
              let { nft_address, MergeLevel } = child;
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
              list.push(nft_address);
            });
          }
          let transitionType = "";
          //debugger;
          try {
            for await (const iterator of list) {
              let str = "";
              switch (props.txtype) {
                // transfer
                case "2":
                  transitionType = "6";
                  str = `wormholes:{"type":6,"nft_address":"${iterator}","version":"v0.0.1"}`;
                  break;
                // pledge
                case "3":
                  transitionType = "7";
                  str = `wormholes:{"type":7,"nft_address":"${iterator}","version":"0.0.1"}`;
                  break;
                // redemption
                case "1":
                  transitionType = "8";
                  str = `wormholes:{"type":8,"nft_address":"${iterator}","version":"0.0.1"}`;
                  break;
              }
              const data3 = toHex(str);
              const tx1 = {
                from: address,
                to: address,
                data: `0x${data3}`,
              };
              const receipt = await dispatch("account/transaction", tx1);
              txQueue.push(receipt);
            }
            $tradeConfirm.update({
              status: "approve",
            });
            await dispatch("account/waitTxQueueResponse");
            if (props.txtype == 2) {
              $tradeConfirm.update({
                status: "success",
                successMessage: t("wallet.conver_success", {
                  count: `<span style='color:#9F54BA;'>${list.length}</span>`,
                  amount: `<span style='color:#9F54BA;'>${amount.toNumber()}</span>`,
                }),
                successMessageType: "html",
                historyCallBack,
              });
            } else {
              $tradeConfirm.update({
                status: "success",
                historyCallBack,
              });
            }
          } catch (err) {
            console.error(err);
            $tradeConfirm.update({
              status: "fail",
              historyCallBack,
            });
          }
        }

        if (props.txtype == "2") {
          const keys = Object.keys(props.selectList).filter(
            (item) => item != "undefined"
          );
          const list = [];
          // Three cases: 1. Collection set is full, 2. SNFT set is full, 3. Fragment does not consider collection case for the time being

          for (let key of keys) {
            if (key) {
              // Synthetic grade
              props.selectList[key].forEach((child: any) => {
                const {
                  MergeLevel,
                  Chipcount,
                  pledgestate,
                  snfts,
                  nft_address,
                } = child;
                switch (MergeLevel) {
                  case 2:
                    list.push(nft_address.substr(0, 40));
                    break;
                  case 1:
                    list.push(nft_address.substr(0, 41));
                    break;
                  case 0:
                    list.push(...snfts);
                    break;
                }
              });
            }
          }
          //debugger
          console.log("list------------", list);
          try {
            for await (let nft_address of list) {
              if (nft_address) {
                const str = `wormholes:{"version": "0.0.1","type":6,"nft_address":"${nft_address}"}`;
                const data3 = toHex(str);
                const tx1 = {
                  from: address,
                  to: address,
                  data: `0x${data3}`,
                  value: "0",
                  checkTxQueue: false,
                };
                const receipt = await dispatch("account/transaction", tx1);
                txQueue.push(receipt);
              }
            }
            $tradeConfirm.update({ status: "approve" });
            const receiptList = await dispatch("account/waitTxQueueResponse");
            const successList = receiptList.map((item: any) => item.status);
            console.warn('successList', successList.length)
            console.warn('receiptList', receiptList.length)
            if (successList.length == list.length) {
              $tradeConfirm.update({
                status: "success",
                successMessage: t("wallet.conver_success", {
                  count: `<span style='color:#9F54BA;'>${list.length}</span>`,
                  amount: `<span style='color:#9F54BA;'>${amount.toNumber()}</span>`,
                }),
                successMessageType: "html",
                historyCallBack,
              });
            } else {
              console.error('conver fail 1', successList, receiptList, count)
              $tradeConfirm.update({
                status: "fail",
                failMessage: t("wallet.conver_wrong", {
                  count: list.length - successList.length,
                }),
                successMessageType: "html",
              });
            }
          } catch (err) {
            console.error('conver fail 2', err)

            $tradeConfirm.update({
              status: "fail",
              failMessage: t("createExchange.create_wrong"),
              historyCallBack,
            });
            console.error(err);
          }
        }
      }
      // chip transfer
      if (props.type == "1") {
        const list = [];
        props.selectList.forEach((item: any) => {
          let { nft_address, MergeLevel } = item;
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
          list.push(nft_address);
        });
        console.log("list----2", list);
        try {
          for await (let nft_address of list) {
            if (nft_address) {
              const str = `wormholes:{"version": "0.0.1","type":6,"nft_address":"${nft_address}"}`;
              const data3 = toHex(str);
              const tx1 = {
                from: address,
                to: address,
                data: `0x${data3}`,
                value: "0",
                checkTxQueue: false,
              };
              const receipt = await dispatch("account/transaction", tx1);
              txQueue.push(receipt);
            }
          }
          $tradeConfirm.update({ status: "approve" });
          const receiptList = await dispatch("account/waitTxQueueResponse");
          const successList = receiptList.map((item: any) => item.status);
          if (successList.length == count) {
            $tradeConfirm.update({
              status: "success",
              successMessage: t("wallet.conver_success", {
                count: `<span style='color:#9F54BA;'>${list.length}</span>`,
                amount: `<span style='color:#9F54BA;'>${amount.toNumber()}</span>`,
              }),
              successMessageType: "html",
            });
          } else {
            console.error('conver fail 3', successList, count)

            $tradeConfirm.update({
              status: "fail",
              failMessage: t("wallet.conver_wrong", {
                count: successList.length,
              }),
              successMessageType: "html",
            });
          }
        } catch (err) {
          $tradeConfirm.update({ status: "fail" });
          console.error(err);
        }
      }
    };


    const submitText = computed(() => {
      // let str = "";
      // switch (props.txtype) {
      //   case "2":
      //     str = t("converSnft.converTit");
      //     break;
      //   case "3":
      //     str = t("createminerspledge.stake");
      //     break;
      //   case "1":
      //     str = t("createExchange.redemption");
      //     break;
      // }
      return t("converSnft.converTit");
    });

    const myprofit = ref("");
    const historyProfit = ref("");
    const calcProfit = async () => {
      const { t0, t1, t2, t3 } = state.configuration.setting.conversion;

      try {
        console.log("1---------------------------");
        const wallet = await getWallet();
        const addressInfo = await getAccountAddr(wallet.address);
        console.warn("addressInfo", addressInfo);
        const { rewardSNFTCount, exchangerAmount, snftAmount } = addressInfo;
        const exchangeNum = ethers.utils.formatEther(exchangerAmount || "0");

        const snftNum = ethers.utils.formatEther(snftAmount || "0");
        console.warn("exchangeNum", exchangeNum);
        console.warn("snftNum", snftNum);
        if (props.txtype === "1") {
          const rio = new BigNumber(props.selectTotal).div(
            new BigNumber(exchangeNum).plus(snftNum)
          );
          historyProfit.value = new BigNumber(rewardSNFTCount)
            .multipliedBy(t0)
            .multipliedBy(rio)
            .toFixed(5);
        }
        console.warn("eth_getAllStakers", props.txtype);
        if (props.txtype === "3") {
          const { Stakers } = await wallet.provider.send("eth_getAllStakers");
          console.warn("pledgeTotal", Stakers);
          const totalPledge = Stakers.map((item: any) => item.Balance)
            .reduce((prev, total) => new BigNumber(prev).plus(prev))
            .div(10000000000000000)
            .toFixed(10);
          console.warn("totalPledge", totalPledge);
          const r = !Number(props.selectTotal)
            ? new BigNumber(0)
            : new BigNumber(props.selectTotal).div(
                new BigNumber(exchangeNum).plus(props.selectTotal)
              );
          console.warn("r---", r.toNumber());
          const am = new BigNumber(props.selectTotal)
            .plus(exchangeNum)
            .div(totalPledge)
            .multipliedBy(599184)
            .multipliedBy(r)
            .toFixed(15);
          myprofit.value = am;
        }

        /**
         * 
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
      let list = [];
      let allsnftList = [];
      if (props.type == "2") {

          const keys = Object.keys(props.selectList).filter(
            (item) => item != "undefined"
          );
          console.log("keys------------", keys);
          // Three cases: 1. Collection set is full, 2. SNFT set is full, 3. Fragment does not consider collection case for the time being
          for (let key of keys) {
            if (key) {
              // Synthetic grade
              props.selectList[key].forEach((child: any) => {
                const {
                  MergeLevel,
                  Chipcount,
                  pledgestate,
                  snfts,
                  nft_address,
                } = child;
                console.warn("chip", child);
                if (
                  MergeLevel == 0 &&
                  snfts.length > 0 &&
                  pledgestate == "NoPledge"
                ) {
                  list.push(...snfts);
                  allsnftList.push(...snfts);
                }
                if (MergeLevel > 0 && Chipcount && pledgestate == "NoPledge") {
                  let newNftAddr = nft_address;
                  switch (MergeLevel) {
                    case 2:
                      newNftAddr = nft_address.substr(0, 40);
                      break;
                    case 1:
                      newNftAddr = nft_address.substr(0, 41);
                      break;
                    case 0:
                      break;
                  }
                  list.push(newNftAddr);
                  allsnftList.push(newNftAddr);
                }
              });
            }
          }
   
      }
      // chip transfer
      if (props.type == "1") {
        if (props.txtype == "2") {
          props.selectList.forEach((item: any) => {
            let { MergeLevel, Chipcount, pledgestate, snfts, nft_address } =
              item;
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
            list.push(nft_address);
          });
          allsnftList = [...list];
        } else {
          props.selectList.forEach((item: any) => {
            const {
              MergeLevel,
              Chipcount,
              pledgestate,
              snfts,
              nft_address,
              isUnfreeze,
              DeletedAt,
            } = item;
            if (
              MergeLevel == 1 &&
              pledgestate == "Pledge" &&
              typeof isUnfreeze !== "undefined" &&
              isUnfreeze &&
              !DeletedAt
            ) {
              list.push(nft_address);
              allsnftList = [...list];
            }
            if (MergeLevel == 0 && pledgestate == "NoPledge") {
              list.push(nft_address);
              allsnftList = [...list];
            }
          });
        }
      }
      console.warn(
        "allsnftList -----------------------------------:",
        allsnftList
      );
      console.warn("list -----------------------------------:", list);

      const len = list.length;
      const [nft_address] = allsnftList;
      console.log("list---------------", list);
      let str = "";

      let nftAddr = nft_address;
      // const addlen = nft_address.length
      // if(addlen < 42) {
      //   // const diff = 42 - addlen
      //   // diff == 1 ? nftAddr += '0' : ''
      //   // diff == 2 ? nftAddr += '00' : ''
      //   // diff == 3 ? nftAddr += '000' : ''
      // }
      console.warn('nftAddr', nftAddr)

      str = `wormholes:{"type":6,"nft_address":"${nftAddr}","version":"v0.0.1"}`
      console.log("str-------------------", str);
      const data3 = toHex(str);
      const tx1 = {
        from: address,
        to: address,
        data: `0x${data3}`,
      };
      const gas = await getGasFee(tx1);
      gasFee.value = new BigNumber(gas).multipliedBy(len).toFixed(6);
      }catch(err){
        console.warn('err---', err)
      }
    };

    return {
      t,
      myprofit,
      submitText,
      showModal,
      gasFee,
      historyProfit,
      cencel,
      handleComfirm,
      loading,
      time,
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
:deep(){
  .wormholes-tip {
    margin-left:0;
    margin-right:0;
  }
}
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
.custom-exchange-modal {
}
</style>
