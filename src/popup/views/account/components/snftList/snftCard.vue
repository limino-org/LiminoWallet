<template>
  <div
    :class="`new-nft-card pl-8 pr-8 ${data.total_hold == 256 ? 'blink' : ''}`"
  >
    <!-- 1.info -->
    <div class="coll-info">
      <div class="flex between">
        <span class="f-12 lh-14 text-bold">{{ data.name }}</span>
        <span class="more f-12 lh-14 hover" @click.stop="toDetail">{{
          $t("sendSNFT.more")
        }}</span>
      </div>
      <div class="info pl-10 pr-10 pt-6 pb-6 lh-14 f-12 mt-8" v-if="data.desc">
        {{ data.desc }}
      </div>
    </div>
    <!-- 2.compilations -->
    <div
      :class="`coll-list flex ${compData.total_hold && compData.MergeLevel == 2 ? 'active' : ''}`"
    >
      <div
        class="coll-card hover"
        v-for="(item, idx) in compData.children"
        :key="item.key"
        @click.stop="handleClick(item, idx)"
      >
        <i
          class="iconfont icon-duihao2 check-icon"
          v-show="item.select && showIcon && compData.MergeLevel < 2 && !getDisabled(item)"
        ></i>
        <img
          src="./select-white.svg"
          class="check-icon-default no-select"
          alt=""
          v-show="!getDisabled(item) && showIcon && compData.MergeLevel < 2 && !item.select"
        />
        <img
          loading="lazy"
          :src="`${metaDomain}${item.source_url}`"
          :class="`${item.disabled ? 'gray' : ''} ${getDisabled(item)}`"
        />
      </div>
    </div>
    <!-- 3.progress  -->
    <div class="progress-box">
      <ProgressBar
        :value="data['total_hold']"
        :own="selectSnftsLen"
        :ratio="ratio"
      />
    </div>
    <!-- 4.money -->
    <div class="total-amount flex center-v mt-10">
      <div
        v-if="showIcon"
        :class="`all-box flex center-v mr-8 hover ${
          compData.select ? 'active' : ''
        }`"
        @click.stop="chooseAll(compData.select ? false : true)"
      >
        <i
          :class="`iconfont mr-4 ${
            compData.select ? 'icon-duihao2' : 'icon-check_line'
          }`"
        ></i>
        {{ $t("sendSNFT.all") }}
      </div>
      <div class="select-box lh-14 mr-4">{{ checkLen }}/{{ getNumber }},</div>
      <div class="am-box">
        {{ totalAmount }}ERB
        <span>(≈ ${{ toUsd(totalAmount, 2) }})</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, ref, SetupContext, toRaw, watch } from "vue";
import {
  addressMask,
  decimal,
  weiToNumber,
  toUsd,
  toUsdSymbol,
  snftToErb,
} from "@/popup/utils/filters";
import { useStore } from "vuex";
import { computed } from "vue";
import { Image, Toast } from "vant";
import { useRoute, useRouter } from "vue-router";
import ProgressBar from "@/popup/views/account/components/snftList/progressBar.vue";
import BigNumber from "bignumber.js";
import { useI18n } from "vue-i18n";
import { VUE_APP_METAURL } from "@/popup/enum/env";
export default defineComponent({
  name: "nfts-card",
  components: {
    [Image.name]: Image,
    ProgressBar,
  },
  emits: ["changeSelect"],
  props: {
    data: {
      type: Object,
      default: {},
    },
    showIcon: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: "",
    },
    toName: {
      type: String,
      default: "coll-detail",
    },
    selectAll: {
      type: Boolean,
      default: false,
    },
    index: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "3",
    },
  },
  setup(props: any, context: SetupContext) {
    const { t } = useI18n();
    console.log('props.data------', props.data)
    const compData = ref({ select: false, children: [] });



    const collIdStr = "0x80000000000000000000000000000000000";
    const { id, FullNFTs, select } = props.data;
    if(props.data.MergeLevel !== 2) {
      if (props.status == "3") {
      FullNFTs.forEach((item: any) => {
        item.select = select ? true : false;
        item.address = item.nft_address.substr(0, 40);
        const { Chipcount, pledgestate, MergeLevel, Exchange } = item;
        if (pledgestate == "NoPledge") {
          if (!Chipcount || MergeLevel !== 1 || Exchange === 1) {
            item.disabled = true;
          } else {
            item.disabled = false;
          }
        } else {
          item.disabled = true;
        }
      });
    }
    if (props.status == "2") {
      FullNFTs.forEach((item: any) => {
        item.select = select ? true : false;
        item.address = item.nft_address.substr(0, 40);
        const { Chipcount, pledgestate, MergeLevel, Exchange } = item;
        if (pledgestate == "Pledge" || MergeLevel !== 1 || !Chipcount || Exchange === 1) {
          item.disabled = true;
        } else {
          item.disabled = false;
        }
      });
    }
    if (props.status == "1") {
      FullNFTs.forEach((item: any) => {
        item.select = select ? true : false;
        item.address = item.nft_address.substr(0, 40);
        const { Chipcount, pledgestate, isUnfreeze, DeletedAt, MergeLevel, Exchange } = item;
        if (pledgestate == "Pledge") {
          if (!Chipcount || MergeLevel !== 1 || Exchange === 1) {
            item.disabled = true;
          } else {
            item.disabled = false;
          }
        }
        if (pledgestate == "NoPledge" ||(typeof isUnfreeze != 'undefined' && isUnfreeze === false) || Exchange === 1) {
          item.disabled = true;
        }
      });
    }

    }

    watch(() => props.selectAll, (n) => {
      console.warn('select all 222222222222')
    })
    const coll_address = collIdStr + id
    compData.value = {
      id,
      children: toRaw(FullNFTs),
      select: false,
      address: coll_address,
      nft_address: coll_address,
      ...props.data,
    };

    const store = useStore();
    const currentNetwork = computed(() => store.state.account.currentNetwork);
    const layoutType = computed(() => {
      return props.type ? props.type : store.state.system.layoutType;
    });
    // Balance display type
    const amountType = computed(() => store.state.system.amountType);
    // all/none
    const checkAll = ref(false);
    const router = useRouter();
    const toDetail = () => {
      sessionStorage.setItem(
        "compData",
        JSON.stringify({ ...compData.value, ...props.data })
      );
      router.push({ name: props.toName });
    };

    // The number of selected items
    const checkLen = computed(() => {
       // @ts-ignore
      if(compData.value.select && compData.value.MergeLevel == 2) {
        // @ts-ignore
        return compData.value.MergeNumber
      }
      const list = compData.value.children
        .filter((item) => item.select)
      const { status, data } = props;
      let total = 0
      if (status == "2") {
        list.forEach(item => {
          total+=item.snfts.length
        })
        return total
      }
      if (status == "1" || status == "3") {
        let total = 0
        // TODO 计算 解冻质押时选中的碎片数量
        list.forEach(item => {
          const {MergeLevel, MergeNumber} = item
          total += MergeNumber
        })
          return total;
        }

      return 0;
    });
    const totalLen = computed(() => {
      const arr = compData.value.children.map((item) => item.Chipcount);
      if (arr.length) {
        return arr.reduce((total: number, num: number) => total + num);
      }
      return 0;
    });
    //The total amount selected
    const totalAmount = computed(() => {
      // @ts-ignore
      if(compData.value.select && compData.value.MergeLevel == 2) {
        // @ts-ignore
        return new BigNumber(compData.value.MergeNumber).multipliedBy(0.271).toNumber()
      }
      let total = 0;
      compData.value.children
        .forEach((item) => {
          const {select,MergeLevel,MergeNumber,snfts} = item
          if(select) {
            switch(MergeLevel){
              case 1:
                total = new BigNumber(MergeNumber).multipliedBy(0.143).plus(total).toNumber();
                break;
              case 0:
                total = new BigNumber(snfts.length).multipliedBy(0.095).plus(total).toNumber();
                break;
            }
          }
        })

      return total;
    });

    const toMore = () => {
      sessionStorage.setItem("compData", JSON.stringify(compData.value));
      router.replace({ name: "coll-list" });
    };

    // sndt click
    const handleClick = (item: any, idx: number) => {
      console.log('item', item, props)
      if (!props.showIcon) {
        return;
      }
      if(props.data.MergeLevel == 2) {
        return
      }
      const { Chipcount, pledgestate, loaded, disabled, MergeLevel } = item;
      debugger
      const { status } = props;

      if (!loaded) {
        Toast(t("sendSNFT.loadchip"));
        return;
      }
      if (status == "3" || status == "1") {
        if (disabled) {
          return;
        }
      }
      if (status == "2") {
        if (pledgestate == "Pledge" || !Chipcount) {
          return;
        }
      }
      if (Chipcount == 0) {
        return;
      }
      const { index } = props;
      item.select = !item.select;
      console.log("select", compData.value, item);
      const { children } = compData.value;
      const clds = children.filter((item) => item.select);
      context.emit("changeSelect", {
        ...compData.value,
        children: clds,
        childIndex: idx,
        index,
        item,
      });
    };
    const getDisabled = (item: any) => {
      const {
        pledgestate,
        Chipcount,
        disabled,
        isUnfreeze,
        DeletedAt,
        Exchange,
        MergeLevel,
      } = item;
      const { status } = props;
      if (status == "3") {
        if(Exchange === 1 || pledgestate == "Pledge" || !Chipcount || MergeLevel < 1  ){
          return "disabled";
        }
        // return disabled ? "disabled" : "";
      }
      if (status == "2") {
        if (pledgestate == "Pledge" || !Chipcount || Exchange === 1) {
          return "disabled";
        }
      }
      if (status == "1") {
        if (
          pledgestate == "NoPledge" ||
          (typeof isUnfreeze != "undefined" && isUnfreeze === false) ||
          DeletedAt ||  MergeLevel < 1
        ) {
          return "disabled";
        }
      }
      return "";
    };
    // All/none
    const chooseAll = (bool: boolean) => {
      console.log('props.data', props.data)
      // @ts-ignore
      if(props.data.MergeLevel === 2 && props.data.Chipcount && props.status === '1') {
      // @ts-ignore
        if(props.status === '1' && compData.value.pledgestate === 'Pledge' && !compData.value.isUnfreeze) {
          Toast(t('common.unisUnfreeze'))
          return
        }
        compData.value.select = bool;
        context.emit("changeSelect", {
        ...compData.value,
        children: bool ? [ toRaw(props.data)] : [],
      });
        return
      }
      compData.value.select = bool;
      //debugger
      if (compData.value) {
        compData.value.children.forEach((item) => {
          if (getDisabled(item) == "") {
            item.select = bool;
          }
        });
      }
      compData.value = compData.value;
      const { children } = compData.value;
      // Push selected data to superiors
      context.emit("changeSelect", {
        ...compData.value,
        children: children.filter((item) => item.select),
      });
    };

    watch(
      () => props.selectAll,
      (n, o) => {
        // @ts-ignore
        if(props.status === '1' && compData.value.pledgestate === 'Pledge' && !compData.value.isUnfreeze) {
          return
        }
        console.warn('nnnnnnnnnn', n)
        nextTick(() => {
          chooseAll(n)
        })
      },
      { deep: true,immediate: true }
    );
    const metaDomain = ref(`${VUE_APP_METAURL}`);

    // The conversion rate is calculated according to the number of SNFT selected
       // cacl ratio
       const ratio = computed(() => {
        const { status, data } = props;
        const {MergeLevel} = data

      if (status== "1" || status == "3") {
          return 0.143
        }
        if (status == "2") {
          const list = [];
          const selectList = compData.value.children.filter(item => item.select)
          // Three cases: 1. Collection set is full, 2. SNFT set is full, 3. Fragment does not consider collection case for the time being
          selectList.forEach((child: any) => {
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
          if(MergeLevel == 2) {
            return countNum ? 0.271 : 0
        }
          return isNaN(new BigNumber(count).div(countNum).toNumber()) ? 0 : new BigNumber(count).div(countNum).toFixed(3)
        }


    })

    const getNumber = computed(() => {
      const res = { ...props.data };
      console.warn('res------------', res)
      const { status } = props;
      if (status == "3" || status == "1") {
        let total = 0
        if(props.data.MergeLevel === 2) {
          return props.data.MergeNumber
        }
        compData.value.children
        .forEach((item) => {
          if(!item.disabled){
            const {MergeLevel,MergeNumber} = item
            total += MergeNumber
          }
        })
        return total;
      }
      if (status == "2") {
        let total = 0;
        const { MergeLevel, MergeNumber, Chipcount} = res
        if(MergeLevel === 2 && Chipcount) {
          total += MergeNumber
          return total
        }
        res.children.forEach((item: any) => {
          if (getDisabled(item) == "") {
            const {MergeLevel:level,total_hold, MergeNumber} = item
            if(level === 1 && total_hold) {
              total += total_hold
            } else {
              total += item.snfts.length;
            }
          }
        });
        return total;
      }
    });

    const selectSnftsLen = computed(() => {
      const {status} = props
      // if(status == '1' || status == '3') {
      //   return getNumber.value
      // }
      // if(status == '2') {
      //   return getNumber.value
      // }
      return getNumber.value
    })
    return {
      selectSnftsLen,
      getNumber,
      addressMask,
      metaDomain,
      currentNetwork,
      getDisabled,
      layoutType,
      toDetail,
      toUsd,
      weiToNumber,
      toUsdSymbol,
      amountType,
      checkAll,
      checkLen,
      totalLen,
      totalAmount,
      toMore,
      handleClick,
      compData,
      ratio,
      chooseAll,
    };
  },
});
</script>
<style lang="scss" scoped>
.new-nft-card {
  border: 2px solid #fff;
  &.blink {
    border: 2px solid;
    border-image: linear-gradient(
        180deg,
        rgba(255, 240, 197, 1),
        rgba(255, 255, 255, 1),
        rgba(251, 195, 50, 1)
      )
      2 2;
  }
  background: #f1f3f4;
  border-radius: 5px;
  padding-top: 7px;
  width: 100%;

  padding-bottom: 13px;
  // min-height: 196px;
  margin-bottom: 15px;
  .coll-info {
    .more {
      color: #007cdd;
    }
    .info {
      background: #fff;
      color: #848484;
      border-radius: 5px;
    }
  }
  .coll-list {
    flex-wrap: wrap;
    padding-top: 10px;
    padding-bottom: 3px;
    margin-left: -8px;
    margin-right: -8px;
    padding-left: 8px;
    padding-right: 8px;
    &.active {
      margin-bottom: 10px;
      margin-top: 10px;
      background-image: linear-gradient(
        90deg,
        rgba(251, 195, 50, 1),
        rgba(255, 255, 255, 1),
        rgb(253, 206, 78)
      );
      animation: Gradient 6s ease infinite;
    }
    .coll-card {
      width: 35px;
      height: 35px;
      border-radius: 5px;
      background: #d0cccc;
      overflow: hidden;
      margin-right: 6.2px;
      margin-bottom: 6.5px;
      position: relative;
      .check-icon-default {
        position: absolute;
        width: 23px;
        height: 23px;
        object-fit: contain;
        left: 6px;
        top: 7px;
        z-index: 1;
      }
      .check-icon {
        color: #037cd6;
        font-size: 20px;
        display: block;
        position: absolute;
        left: 50%;
        top: 50%;
        margin-left: -10px;
        margin-top: -10px;
        //         width: 20px;
        // height: 20px;
        z-index: 10;
        &::after {
          content: "";
          display: block;
          width: 14px;
          height: 14px;
          background: #fff;
          position: absolute;
          left: 3px;
          top: 4px;
          z-index: -1;
        }
        &::before {
          display: block;

          height: 100%;
          width: 100%;
          border-radius: 50%;
        }
      }
      img {
        object-fit: cover;
        width: 35px;
        height: 35px;
        font-size: 12px;
      }
    }
    .coll-card:nth-of-type(8n + 8) {
      margin-right: 0px !important;
    }
  }

  .total-amount {
    font-size: 12px;
    .select-box {
    }
    .am-box {
      color: #007cdd;
      font-weight: bold;
      font-size: 15px;
      span {
        font-size: 12px;
        transform: scale(0.8);
        font-weight: normal;
      }
    }
  }
  .all-box {
    color: #b3b3b3;
    &.active {
      color: #037cd6;
    }
    & .icon-duihao2 {
      color: #037cd6;
      font-size: 14px;
    }
    & .icon-check_line {
      color: #848484;
      font-size: 14px;
    }
  }
}
.new-nft-list-card {
  padding: 7.5px;
  width: 48%;
  margin-bottom: 15px;
  &::after {
    border-radius: 7.5px;
  }
  .img-box {
    // width: 150px;
    background: rgb(253, 245, 245);
    height: 150px;
    border-radius: 6px 6px 7.5px 7.5px;
  }
  .nft-info {
    .name {
      font-size: 12px;
      line-height: 14px;
      margin-top: 5px;
    }
    .add {
      font-size: 12px;
      color: rgba(154, 154, 154, 1);
      line-height: 12px;
      margin-top: 4px;
    }
  }
}
@media screen and (max-width: 750px) {
  // .coll-card:nth-of-type(8n + 8) {
  //     margin-right: 6.4px !important;
  //   }
}
@media screen and (min-width: 750px) {
  .nft-card.card {
    width: 49%;
    margin-right: 0 !important;
  }
  .new-nft-card .coll-list .coll-card {
    // width: 52px;
    // height: 52px;
  }
  .new-nft-card .coll-list .coll-card:nth-of-type(8n + 8) {
    margin-right: 6.4px !important;
  }
  .coll-list {
    justify-content: space-between;
  }
}


@keyframes Gradient {
    0% {
        background-position: left 0 top 0;
    }
    50% {
        background-position: left 50% top 0;
    }
    100% {
        background-position: left 100% top 0;
    }

  }
</style>