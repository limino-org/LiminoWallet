<template>
  <div
    :class="`new-nft-card pl-8 pr-8 ${data.MergeLevel == 2 ? 'shining' :''}`"
  >
    <div class="new-nft-card-box ">
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
        :class="`coll-card hover ${getClass(item)}`"
        v-for="(item, idx) in compData.children"
        :title="getTipText(item)"
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
          class="snft-img"
        />
      </div>
    </div>
    <!-- 3.progress  -->
    <div class="progress-box">
      <ProgressBar
        :value="data['total_hold']"
        :own="selectSnftsLen"
        :ratio="ratio"
        :total="data['totalcount']"
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
      </div>
    </div>
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, ref, SetupContext, toRaw, watch,Ref } from "vue";
import {
  addressMask,
  decimal,
  weiToNumber,
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
import account from "@/popup/store/modules/account";
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

  },
  setup(props: any, context: SetupContext) {
    const { t } = useI18n();
    console.log('props.data------', props.data)
    const compData:Ref<any> = ref({ select: false, children: [] });
    const store = useStore()
    const currentNetwork = computed(() => store.state.account.currentNetwork);
    const accountInfo = computed(() => store.state.account.accountInfo);
    
    const collIdStr = "0x80000000000000000000000000000000000";
    const { id, children, select , MergeLevel} = props.data;
    if(props.data.MergeLevel !== 2) {

      children.forEach((item: any) => {
        item.select = select ? true : false;
        item.address = item.nft_address.substr(0, 40);
        const { MergeLevel, exchange, snfts, ownaddr } = item;
        if ((!snfts.length && MergeLevel == 0) || (MergeLevel > 1 && ownaddr.toUpperCase() != accountInfo.value.address.toUpperCase()) || exchange === 1) {
            item.disabled = true;
          } else {
            item.disabled = false;
          }
      });

    }

    watch(() => props.selectAll, (n) => {
      console.warn('select all 222222222222')
    })
    const coll_address = collIdStr + id
    compData.value = {
      id,
      children: toRaw(children),
      select: false,
      address: coll_address,
      nft_address: coll_address,
      ...props.data,
    };


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
        let total = 0;
        list.forEach((item: any) => {
          if (getDisabled(item) == "") {
            const {MergeLevel:level, ownaddr, MergeNumber} = item
            if(level === 1 && ownaddr.toUpperCase() == accountInfo.value.address.toUpperCase()) {
              total += MergeNumber
            } else {
              total += item.snfts.length;
            }
          }
        });
        return total;

    });
    const totalLen = computed(() => {
      const arr = compData.value.children.map((item) => item.snfts.length);
      if (arr.length) {
        return arr.reduce((total: number, num: number) => total + num);
      }
      return 0;
    });
    //The total amount selected
    const totalAmount = computed(() => {
      const { t0, t1, t2, t3 } = store.state.configuration.setting.conversion

      // @ts-ignore
      if(compData.value.select && compData.value.MergeLevel == 2) {
        // @ts-ignore
        return new BigNumber(compData.value.MergeNumber).multipliedBy(t3).toNumber()
      }
      let total = 0;
      compData.value.children
        .forEach((item) => {
          const {select,MergeLevel,MergeNumber,snfts} = item
          if(select) {
            switch(MergeLevel){
              case 1:
                total = new BigNumber(MergeNumber).multipliedBy(t1).plus(total).toNumber();
                break;
              case 0:
                total = new BigNumber(snfts.length).multipliedBy(t0).plus(total).toNumber();
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

    // snft click
    const handleClick = (item: any, idx: number) => {
      console.log('item', item, props)
      if (!props.showIcon) {
        sessionStorage.setItem("compData", JSON.stringify(compData.value));
        router.push({name:'coll-detail',query: {...item}})
        return;
      }
      if(props.data.MergeLevel == 2) {
        return
      }
      const { snfts, MergeLevel, ownaddr } = item;
        if (MergeLevel == 0 && !snfts.length) {
          return;
        }
      if (MergeLevel > 0 && ownaddr.toUpperCase() != accountInfo.value.address.toUpperCase()) {
        return;
      }
      const { index } = props;
      item.select = !item.select;
      console.log("select", compData.value, item);
      const { children } = compData.value;
      const clds = children.filter((item) => item.select);
      const emitData = {
        ...compData.value,
        children: clds,
        childIndex: idx,
        index,
        item,
      }
      console.warn('compData', compData)
      context.emit("changeSelect", emitData);
    };
    const getDisabled = (item: any) => {
      const {
        disabled,
        isUnfreeze,
        DeletedAt,
        exchange,
        snfts,
        MergeLevel,
        ownaddr
      } = item;
      const snftsLen = snfts.length
      if(exchange){
        return 'disabled'
      }
      if(MergeLevel == 1 && ownaddr.toUpperCase() != accountInfo.value.address.toUpperCase()) {
        return 'disabled'
      }
      if(MergeLevel == 0 && !snftsLen) {
        return 'disabled'
      }
      return "";
    };
    // All/none
    const chooseAll = (bool: boolean) => {
      console.log('props.data', props.data)
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
        const { t0, t1, t2, t3 } = store.state.configuration.setting.conversion

        const { data } = props;
        const {MergeLevel} = data
        const list = [];
          const selectList = compData.value.children.filter(item => item.select)
          // Three cases: 1. Collection set is full, 2. SNFT set is full, 3. Fragment does not consider collection case for the time being
          selectList.forEach((child: any) => {
                const {
                  MergeLevel,
                  pledgestate,
                  snfts,
                  nft_address,
                } = child;
                if (
                  MergeLevel == 0 &&
                  snfts.length > 0 &&
                  pledgestate == "NoPledge"
                ) {
                  list.push(...snfts);
                }
                if (MergeLevel > 0 && snfts.length && pledgestate == "NoPledge") {
                  list.push(nft_address.substr(0, 41));
                }
              });
          let count = 0
          let countNum = 0
          list.forEach(add => {
            const len = add.length
            if(len == 42) {
              countNum += 1
              count = parseFloat(new BigNumber(count).plus(t0).toFixed(8))
            }
            if(len == 41) {
              countNum += 16
              count = parseFloat(new BigNumber(count).plus(new BigNumber(16).multipliedBy(t1)).toFixed(8))
            }
            if(len == 40) {
              countNum += 256
              count = parseFloat(new BigNumber(count).plus(new BigNumber(256).multipliedBy(t2)).toFixed(8))
            }
          })
          if(MergeLevel == 2) {
            return countNum ? t2 : 0
        }
          return isNaN(new BigNumber(count).div(countNum).toNumber()) ? 0 : new BigNumber(count).div(countNum).toFixed(3)


    })

    const getNumber = computed(() => {
      const res = { ...props.data };
      console.warn('res------------', res)

        let total = 0;
        const { MergeLevel, MergeNumber, snfts} = res
        if(MergeLevel === 2 && snfts.length) {
          total += MergeNumber
          return total
        }
        res.children.forEach((item: any) => {
          if (getDisabled(item) == "") {
            const {MergeLevel:level, ownaddr, MergeNumber, disabled} = item
            if(level === 1 && !disabled) {
              total += MergeNumber
            } else {
              total += item.snfts.length;
            }
          }
        });
        return total;

    });

    const selectSnftsLen = computed(() => {
      return getNumber.value
    })
    const getClass = (item: any) => {
      const { disabled, MergeLevel } = item
      if(disabled) {
        return 'gary'
      }
      if(!disabled && MergeLevel){
        return 'shining'
      }
      return ''

    }
    const getTipText = (item: any) => {
      const { disabled, MergeLevel, exchange } = item

      if(exchange) {
        return t('converSnft.converted')
      }
      if(disabled) {
        return t('converSnft.notObtain')
      }
      // @ts-ignore
      if(!disabled && MergeLevel > 0){
        return t('converSnft.synthesized')
      }
      return t('converSnft.beSyned')
    }
    return {
      getTipText,
      getClass,
      selectSnftsLen,
      getNumber,
      addressMask,
      metaDomain,
      currentNetwork,
      getDisabled,
      layoutType,
      toDetail,
      weiToNumber,
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
:root {
  --card-height: 65vh;
  --card-width: calc(var(--card-height) / 1.5);
}
.new-nft-card {
  border: 2px solid #fff;
  position: relative;
  min-height: 227px;
  &.shining{
    .new-nft-card-box {
      padding: 8px;
      position: absolute;
      background: #f1f3f4;
      left: 2px;
      top: 2px;
      right: 2px;
      bottom: 2px;
      z-index: 3;
    }
    // border: 2px solid #FBC332;
    position: relative;

    &::before{
    content: "";
    width: 100%;
    height: 100%;
    border-radius: 4px;
    background-image: linear-gradient(var(--rotate) , #f8b305, #f8b305 15%, #f8b305);
    position: absolute;
    z-index: 2;
    top: 0;
    left: 0;
    // animation: spin 4s linear infinite;
    }
    &::after {
  //     position: absolute;
  // content: "";
  // top: 10px;
  // left: 0;
  // right: 0;
  // z-index: 1;
  // height: 100%;
  // width: 100%;
  // margin: 0 auto;
  // transform: scale(1);
  // filter: blur(calc(50px / 6));
  // background-image: linear-gradient(var(--rotate) , #fff, #f5f2ed 95%, #eeba37);
  //   opacity: 1;
  // transition: opacity .5s;
  // animation: spin 7s ease-in-out infinite;
}
  }
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
      color: #9F54BA;
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
    margin-left: -6px;
    margin-right: -6px;
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
        z-index: 100;
      }
      .check-icon {
        color: #9F54BA;
        font-size: 20px;
        display: block;
        position: absolute;
        left: 50%;
        top: 50%;
        margin-left: -10px;
        margin-top: -10px;
        //         width: 20px;
        // height: 20px;
        z-index: 11;
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
        border-radius: 4px;
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
      color: #9F54BA;
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
      color: #9F54BA;
    }
    & .icon-duihao2 {
      color: #9F54BA;
      font-size: 14px;
    }
    & .icon-check_line {
      color: #848484;
      font-size: 16px;
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

.coll-card{
  &.gary {
    position: relative;
  .snft-img {
    backdrop-filter: saturate(80%) blur(0);
    filter: grayscale(100%);
  }
  &::after {
    content: '';
    position: absolute;
    background: rgba($color: #000, $alpha: .5);
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    border-radius: 4px;

  }
  }

  &.shining{
    position: relative;
    &::before{
    content: "";
    width: 35px;
    height: 35px;
    border-radius: 4px;
    background-image: linear-gradient(var(--rotate) , #fff, #f0ca6c 20%, #f8b305);
    position: absolute;
    z-index: 2;
    top: 0;
    left: 0;
    animation: spin 3s linear infinite;
    }
    &::after {
      position: absolute;
  content: "";
  top: 10px;
  left: 0;
  right: 0;
  z-index: 1;
  height: 100%;
  width: 100%;
  margin: 0 auto;
  transform: scale(0.8);
  filter: blur(calc(70px / 6));
  background-image: linear-gradient(var(--rotate) , #fff, #f5f3f0 30%, #f8b305);
    opacity: 1;
  transition: opacity .5s;
  animation: spin 3s linear infinite;
}
    & .snft-img {
      width: 29px !important;
      height: 29px !important;
      position: absolute;
      left: 3px;
      top: 3px;
      border-radius: 4px;
      z-index: 10;
    }
  }

}

.coll-card.shining .snft-img  {

}

@property --rotate {
  syntax: "<angle>";
  initial-value: 200deg;
  inherits: false;
}

@keyframes spin {
0% {
--rotate: 0deg;
}
100% {
--rotate: 360deg;
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

  @media screen and (max-width: 750px) {

  .new-nft-card .coll-list .coll-card {
    margin-right: 5px;
  }
  .new-nft-card {
    min-height: 196px;
  }
  .new-nft-card.shining {
    min-height: 240px;
  }
}
@media screen and (min-width: 750px) {
  .nft-card.card {
    width: 49%;
    margin-right: 0 !important;
  }
  .new-nft-card {
    min-height: 170px;
  }
  .new-nft-card.shining {
    min-height: 200px;
  }

  .new-nft-card .coll-list .coll-card:nth-of-type(8n + 8) {
    margin-right: 6.4px !important;
  }
  .coll-list {
    justify-content: space-between;
  }
}
</style>