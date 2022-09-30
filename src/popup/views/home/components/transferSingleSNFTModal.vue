<template>
    <div class="transfer-NFT-modal">
      <van-dialog
        v-model:show="showModal"
        teleport="#page-box"
        :showConfirmButton="false"
        :showCancelButton="false"
        closeOnClickOverlay
        :title="''"
      >
        <div class="title text-center text-bold van-hairline--bottom">
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
              <div class="van-hairline--bottom"></div>
              <div class="m-card">
                <div class="m-label">{{ t("transferNft.amount") }}</div>
                <div class="m-value">
                  {{ selectTotal }} ERB
                  <span class="usd">≈ $ {{ toUsd(selectTotal, 2) }}</span>
                </div>
              </div>
              <div class="van-hairline--bottom"></div>
  
              <div class="m-card">
                <div class="m-label">{{ t("transferNft.ratio") }}</div>
                <div class="m-value">{{ ratio }}</div>
              </div>
              <div class="van-hairline--bottom"></div>
              <div class="m-card">
                <div class="m-label ">{{ t("bourse.gasFee") }}</div>
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
              <div class="van-hairline--bottom"></div>
              <div class="m-card">
                <div class="m-label">{{ t("transferNft.amount") }}</div>
                <div class="m-value">
                  {{ selectTotal }} ERB
                  <span class="usd">≈ $ {{ toUsd(selectTotal, 2) }}</span>
                </div>
              </div>
              <div class="van-hairline--bottom"></div>
              <div class="m-card">
                <div class="m-label">{{ t("bourse.income") }}</div>
                <div class="m-value">≈ 0.000052 ERB(≈ $1)</div>
              </div>
              <div class="van-hairline--bottom"></div>
              <div class="m-card">
                <div class="m-label">{{ t("bourse.stakingPeriod") }}</div>
                <div class="m-value">1 Year</div>
              </div>
              <div class="van-hairline--bottom"></div>
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
              <div class="van-hairline--bottom"></div>
              <div class="m-card">
                <div class="m-label">{{ t("transferNft.amount") }}</div>
                <div class="m-value">
                  {{ selectTotal }} ERB
                  <span class="usd">≈$ {{ toUsd(selectTotal, 2) }}</span>
                </div>
              </div>
              <div class="van-hairline--bottom"></div>
              <div class="m-card">
                <div class="m-label">{{ t("bourse.hsitoryReturn") }}</div>
                <div class="m-value">
                  {{ historyProfit }}ERB(≈ ${{ toUsd(historyProfit, 6) }})
                </div>
              </div>
              <div class="van-hairline--bottom"></div>
              <div class="m-card">
                <div class="m-label">{{ t("bourse.income") }}</div>
                <div class="m-value">≈ 0.000000001 ERB(≈ $ 1)</div>
              </div>
              <div class="van-hairline--bottom"></div>
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
          <van-button :loading="loading" :disabled="time < 1 ? false : true" type="primary" @click="handleComfirm">
            {{ t("transferNft.confirm") }} <span v-if="time > 0">({{time}}S)</span>
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
  import { addressMask, snftToErb, toUsd } from "@/popup/utils/filters";
  import { getGasFee, getWallet } from "@/popup/store/modules/account";
  import { useTradeConfirm } from "@/popup/plugins/tradeConfirmationsModal";
  import { TradeStatus } from "@/popup/plugins/tradeConfirmationsModal/tradeConfirm";
  import { ethers } from "ethers";
  import { web3 } from "@/popup/utils/web3";
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
        type: Number,
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
      // 倒计时
      const time = ref(3);
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
              if(time.value == 0) {
                clearInterval(t)
              }
              time.value = time.value -1
            },1000)
            if (props.txtype == "2" || props.txtype == "1") {
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
            time.value = 3
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
        sessionStorage.setItem(
          new Date().toUTCString(),
          JSON.stringify(props.selectList)
        );
        const wallet = await getWallet();
        const { address } = wallet;
        // loading.value = true;
        let txQueue: Array<any> = [];
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
        if (props.txtype == "1" || props.txtype == "3") {
            const [data] = props.selectList
            const {nft_address} = data
            const nftAdd = nft_address.substr(0,41)
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
                const data3 = toHex(str);
                const tx1 = {
                  from: address,
                  to: address,
                  data: `0x${data3}`,
                };
                const receipt: any = await wallet.sendTransaction(tx1);
                txQueue.push(receipt);
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
          }

      };
  
    
  
      const submitText = computed(() => {
        let str = "";
        switch (props.txtype) {
          case "2":
            str = t("common.conver");
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
        const wallet = await getWallet();
        const blockNumber = await wallet.provider.getBlockNumber();
        const blockn = web3.utils.toHex(blockNumber.toString());
        const data = await wallet.provider.send("eth_getValidator", [blockn]);
        // const data2 = await getAccount(accountInfo.value.address)
        let total = new BigNumber(0);
        data.Validators.forEach((item: any) => {
          total = total.plus(item.Balance);
        });
        // total zhiyaliang
        const totalStr = total.div(1000000000000000000).toFixed(6);
  
        // total profit
        const totalprofit = state.account.exchangeTotalProfit;
        const totalPledge = new BigNumber(props.selectTotal);
        myprofit.value = new BigNumber(totalprofit)
          .multipliedBy(
            totalPledge.div(new BigNumber(totalStr).div(7).multipliedBy(4))
          )
          .toFixed(6);
        historyProfit.value = new BigNumber(totalprofit)
          .multipliedBy(
            new BigNumber(props.selectTotal).div(
              new BigNumber(totalStr).div(7).multipliedBy(4)
            )
          )
          .toFixed(6);
        console.warn("historyProfit", historyProfit.value);
        console.warn("myprofit", myprofit.value);
      };
  
      const gasFee = ref("");
      const calcGasFee = async () => {
        const { address } = state.account.accountInfo;
        console.warn('calc gasfee -----------------------------------:',props.selectList)
        const [data] = props.selectList
        debugger
        console.log('data----------',data)
        const nft_address = data.nft_address;
        let str = "";
        const addlen = nft_address.length
      let nftAddr = nft_address
      if(addlen < 42) {
        const diff = 42 - addlen
        diff == 1 ? nftAddr + '0' : ''
        diff == 2 ? nftAddr + '00' : ''
        diff == 3 ? nftAddr + '000' : ''
      }
        switch (props.txtype) {
          // 可质押
          case "3":
            str = `wormholes:{"type":7,"nft_address":"${nftAddr}","version":"0.0.1"}`;
            break;
          // 可赎回
          case "1":
            str = `wormholes:{"type":8,"nft_address":"${nftAddr}","version":"0.0.1"}`;
            break;
        }
        console.log("str-------------------", str);
        const data3 = toHex(str);
        const tx1 = {
          from: address,
          to: address,
          data: `0x${data3}`,
        };
        const gas = await getGasFee(tx1);
        gasFee.value = new BigNumber(gas).multipliedBy(1).toFixed(6);
      };
  

          // cacl ratio
    const ratio = computed(() => {
      if (props.txtype == "1" || props.txtype == "3") {
          return 0.143
        }
        if (props.txtype == "2") {
          const list = [];
          // 三种情况 1.合集集满 ，2.snft集满 ，3.碎片  暂不考虑合集情况

              // 合成等级
              props.selectList.forEach((child: any) => {
                const {
                  MergeLevel,
                  Chipcount,
                  pledgestate,
                  snfts,
                  nft_address,
                } = child;
                if (
                  MergeLevel == 0 &&
                  Chipcount > 0 &&
                  pledgestate == "NoPledge"
                ) {
                  list.push(...snfts);
                }
                if (MergeLevel > 0 && Chipcount && pledgestate == "NoPledge") {
                  list.push(nft_address.substr(0, 41));
                }
              });
          let count = 0
          let countNum = 0
          list.forEach(add => {
            const len = add.length
            if(len == 42) {
              countNum += 1
              count = parseFloat(new BigNumber(count).plus(0.095).toFixed(8))
            }
            if(len == 41) {
              countNum += 16
              count = parseFloat(new BigNumber(count).plus(new BigNumber(16).multipliedBy(0.143)).toFixed(8))
            }
            if(len == 40) {
              countNum += 256
              count = parseFloat(new BigNumber(count).plus(new BigNumber(256).multipliedBy(0.271)).toFixed(8))
            }
          })
          return new BigNumber(count).div(countNum).toFixed(6)
        }


    })
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
  
        addressMask,
        toUsd,
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
    background: #f8fcff;
    font-weight: bold;
  }
  
  :deep(.van-button) {
    width: 100px !important;
  }
  .pintu {
    i {
      color: #037cd6;
      font-size: 38px;
    }
  }
  .protocol {
    color: #b3b3b3;
    span {
      color: #037cd6;
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
  