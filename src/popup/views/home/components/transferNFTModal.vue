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
        {{ $t("transferNft.converttoERB") }} {{submitText}}
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
                <span class="usd">≈$ {{ toUsd(selectTotal, 2) }}</span>
              </div>
            </div>
            <div class="van-hairline--bottom"></div>

            <div class="m-card">
              <div class="m-label">{{ t("transferNft.ratio") }}  </div>
              <div class="m-value">{{ incomeText }}</div>
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
                <span class="usd">≈$ {{ toUsd(selectTotal, 2) }}</span>
              </div>
            </div>
            <div class="van-hairline--bottom"></div>
            <div class="m-card">
              <div class="m-label">{{ t("bourse.income") }}</div>
              <div class="m-value">
                ≈ 0.000052 ERB(≈ $1)
              </div>
            </div>
            <div class="van-hairline--bottom"></div>
            <div class="m-card">
              <div class="m-label">{{ t("bourse.stakingPeriod") }}</div>
              <div class="m-value">
                1 Year
              </div>
            </div>
            <div class="van-hairline--bottom"></div>
            <div class="m-card">
              <div class="m-label">{{ t("bourse.gasFee") }}  </div>
              <div class="m-value gasFee">0.0000210</div>
            </div>
          </div>
        </div>
      </div>
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
                <span class="usd">≈$ {{ toUsd(selectTotal, 2) }}</span>
              </div>
            </div>
            <div class="van-hairline--bottom"></div>
            <div class="m-card">
              <div class="m-label">{{ t("bourse.hsitoryReturn") }}</div>
              <div class="m-value">
                100ERB(≈ $500)
              </div>
            </div>
            <div class="van-hairline--bottom"></div>
            <div class="m-card">
              <div class="m-label">{{ t("bourse.income") }}</div>
              <div class="m-value">
                ≈ 0.000000001 ERB(≈ $ 1)
              </div>
            </div>
            <div class="van-hairline--bottom"></div>
            <div class="m-card">
              <div class="m-label">{{ t("bourse.gasFee") }}  </div>
              <div class="m-value gasFee">0.0000210</div>
            </div>
          </div>
        </div>
      </div>
      <div class="protocol f-12 lh-16 pl-14 pr-14 mb-14 text-center">
        {{ t("transferNft.buyatexchange") }}
      </div>
      <div class="flex between pb-30 pl-16 pr-16">
        <van-button @click="cencel">{{ t("transferNft.cancel") }}</van-button>
        <van-button :loading="loading" type="primary" @click="handleComfirm">
          {{ t("transferNft.confirm") }}
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
} from "vue";
import { Dialog, Button, Field, NumberKeyboard, Toast, CountDown, Popover } from "vant";
import { regNum2 } from "@/popup/enum/regexp";
import BigNumber from "bignumber.js";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { addressMask, snftToErb, toUsd } from "@/popup/utils/filters";
export default defineComponent({
  name: "transfer-NFT-modal",
  components: {
    [Dialog.Component.name]: Dialog.Component,
    [Button.name]: Button,
    [Field.name]: Field,
    [NumberKeyboard.name]: NumberKeyboard,
    [Popover.name]:Popover
  },
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
    // Exchange type 1/ SNFT fragment 2/ SNFT
    type: {
      type: String,
      default: "1",
    },
    txtype: {
      type: String,
      default:'3'
    }
  },
  setup(props: any, context: SetupContext) {
    const { t } = useI18n();
    const { emit }: any = context;
    // 倒计时
    const time = ref(10 * 1000);
    const showModal: Ref<boolean> = ref(false);
    const { dispatch } = useStore();
    watch(
      () => props.modelValue,
      (n) => {
        console.log("selectList", props.selectList);
        showModal.value = n;
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
          loading.value = false;
        }
      }
    );

    const cencel = () => {
      showModal.value = false;
    };

    const loading = ref(false);
    const handleComfirm = async () => {
      emit("handleConfirm");
      loading.value = true;
      const arr = [];
      try {
        // snft chip
        if (props.type == "1") {
          // Exchange 256 addresses using SNFT
          if (props.selectList.length == 256) {
            const snftAddress = props.selectList[0].address.substr(0, 40);
            await dispatch("nft/nftConver", snftAddress);
          } else {
            for await (let item of props.selectList) {
              if (item && item.address) {
                await dispatch("nft/nftConver", item.address);
              }
            }
          }
        }
        // SNFT exchange
        if (props.type == "2") {
          const keys = Object.keys(props.selectList).filter(
            (item) => item != "undefined"
          );
          const list = [];
          //TODO 三种情况 1.合集集满 ，2.snft集满 ，3.碎片
          let totalChipcount = 0
          for (let key of keys) {
            if (key) {
              if (props.selectList[key].length == 16) {
                props.selectList[key].forEach((item: any) => {
                  totalChipcount += item.Chipcount
                })
                // coll
                if(totalChipcount == 256) {
                  list.push(key);
                }
              } else {
                const newlist = props.selectList[key];
                newlist.forEach((item) => {
                  if(item.Chipcount == 256) {
                    list.push(item.address);
                  } else {
                    const { snfts } = item
                    // @ts-ignore
                    list.push(...snfts)
                  }
                });
              }
            }
          }
          
          for await (let address of list) {
            if (address) {
              await dispatch("nft/nftConver", address);
            }
          }
        }
        loading.value = false;
        showModal.value = false;
        Toast(t("transferNFTModal.exchangesuccessfully"));
        emit("nftConverSuccess");
      } catch (err) {
        Toast(err.reason);
      } finally {
        loading.value = false;
      }
    };

    // High and low yield copy
    const incomeText = computed(() => {
      if (props.type == "2") {
        const arr = [];
        // Calculate conversion ratio
        const keys = Object.keys(props.selectList).filter(
          (item) => item != "undefined"
        );
        keys.forEach((key: string) => {
          const list = props.selectList[key];
          if (list.length) {
            const totalChip = list.reduce(
              (total, item) => total + item.Chipcount
            );
            if (totalChip == 256) {
              if (!arr.includes("0.225")) {
                arr.push("0.225");
              }
            } else {
              list.forEach((item: any) => {
                if (item.Chipcount == 256) {
                  if (!arr.includes("0.15")) {
                    arr.push("0.15");
                  }
                } else {
                  if (!arr.includes("0.1")) {
                    arr.push("0.1");
                  }
                }
              });
            }
          }
        });
        if (arr.length) {
          return new BigNumber(arr.reduce((total, num) => total + Number(num)))
            .div(arr.length)
            .toNumber();
        }
      }
      return "1:0.1";
    });


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
    return {
      t,
      submitText,
      showModal,
      cencel,
      handleComfirm,
      loading,
      time,
      incomeText,
      addressMask,
      toUsd,
    };
  },
});
</script>
<style lang="scss" scoped>
  .card-form {
    border: 1px solid #E4E7E8;
    border-radius: 5px;
  }
  .gasFee {
    color: #3AAE55;
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
  }
}
.custom-exchange-modal {
}
</style>
