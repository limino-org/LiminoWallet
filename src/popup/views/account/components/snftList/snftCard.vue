<template>
  <div :class="`new-nft-card pl-8 pr-8 ${data.total_hold == 16 ? 'blink' : ''}`">
    <!-- 1.info -->
    <div class="coll-info">
      <div class="flex between">
        <span class="f-12 lh-14 text-bold">{{ data.name }}</span>
        <span class="more f-12 lh-14 hover" @click.stop="toDetail">{{$t('sendSNFT.more')}}</span>
      </div>
      <div class="info pl-10 pr-10 pt-6 pb-6 lh-14 f-12 mt-8" v-if="data.desc">{{ data.desc }}</div>
    </div>
    <!-- 2.compilations -->
    <div :class="`coll-list flex ${compData.total_hold == 16 ? 'active' : ''}`">
      <div class="coll-card hover" v-for="(item,idx) in compData.children" :key="item.key" @click.stop="handleClick(item,idx)">
        <i class="iconfont icon-duihao2 check-icon" v-show="item.select"></i>
        <img loading="lazy" :src="`${metaDomain}${item.source_url}`" :class="`${item.disabled ? 'gray'  : ''} ${item.Chipcount == 0 ? 'disabled' : ''}`" />
      </div>
    </div>
    <!-- 3.progress  -->
    <div class="progress-box">
      <ProgressBar :value="data['total_hold']" :own="data['total_hold']" :ratio="ratio" />
    </div>
    <!-- 4.money -->
    <div class="total-amount flex center-v mt-10">
      <div :class="`all-box flex center-v mr-8 hover ${
          compData.select ? 'active' : ''
        }`" @click.stop="chooseAll">
        <i :class="`iconfont mr-4 ${compData.select ? 'icon-duihao2' : 'icon-check_line'}`"></i>
        {{$t('sendSNFT.all')}}
      </div>
      <div class="select-box lh-14 mr-4">{{ checkLen }}/{{data['total_hold']}} {{$t('transferNft.select')}},</div>
      <div class="am-box">
        {{ totalAmount }}ERB
        <span>≈ ${{ toUsd(totalAmount, 2) }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, SetupContext, toRaw, watch } from 'vue'
import { addressMask, decimal, weiToNumber, toUsd, toUsdSymbol, snftToErb } from '@/popup/utils/filters'
import { useStore } from 'vuex'
import { computed } from 'vue'
import { Image, Toast } from 'vant'
import { useRoute, useRouter } from 'vue-router'
import ProgressBar from '@/popup/views/account/components/snftList/progressBar.vue'
import BigNumber from 'bignumber.js'
import { useI18n } from 'vue-i18n'
import {VUE_APP_METAURL} from '@/popup/enum/env'
export default defineComponent({
  name: 'nfts-card',
  components: {
    [Image.name]: Image,
    ProgressBar
  },
  emits: ['changeSelect'],
  props: {
    data: {
      type: Object,
      default: {}
    },
    showIcon: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: ''
    },
    toName: {
      type: String,
      default: 'coll-detail'
    },
    selectAll: {
      type: Boolean,
      default: false
    },
    index: {
      type: Number,
      default:0
    }
  },
  setup(props: any, context: SetupContext) {
    const { t } = useI18n()

    const compData = ref({ select: false, children: [] })
    watch(
      () => props.selectAll,
      (n, o) => {
        compData.value.select = n
        compData.value.children.forEach(item => {
          if(item.Chipcount > 0) {
            item.select = n
          }
        })
        const { children } = compData.value
        const clds = children.filter(item => item.select)
        context.emit('changeSelect', { ...compData.value, children: clds })
      },
      { deep: true, immediate: true }
    )

    const collIdStr = '0x80000000000000000000000000000000000'
    const { id, FullNFTs, select } = props.data
    // debugger
    FullNFTs.forEach((item: any) => {
      item.select = select ? true : false
      item.address = item.nft_address.substr(0, 40)
      // if (!item.Chipcount || item.Chipcount < 16) {
        if (!item.Chipcount || item.Chipcount < 16) {
        item.disabled = true
      } else {
        item.disabled = false
      }
    })
    compData.value = {
      id,
      children: toRaw(FullNFTs),
      select: false,
      address: collIdStr + id,
      ...props.data
    }

    const store = useStore()
    const currentNetwork = computed(() => store.state.account.currentNetwork)
    const layoutType = computed(() => {
      return props.type ? props.type : store.state.system.layoutType
    })
    // Balance display type
    const amountType = computed(() => store.state.system.amountType)
    // all/none
    const checkAll = ref(false)
    const router = useRouter()
    const toDetail = () => {
      sessionStorage.setItem('compData', JSON.stringify({ ...compData.value, ...props.data }))
      router.push({ name: props.toName })
    }
    const toggleSelect = () => {
      context.emit('changeSelect', props.data)
    }
    // The number of selected items
    const checkLen = computed(() => {
      const arr = compData.value.children.filter(item => item.select).map(item => item.Chipcount)
      if(arr.length){
        return arr.reduce((total: number,num: number) => total + num)
      }
      return 0
    })

    //The total amount selected
    const totalAmount = computed(() => {
      const arr = compData.value.children.filter(item => item.select).map(item => item.Chipcount)
      let total = 0
      arr.forEach((num:any) => {
        if(num == 256){
          total = new BigNumber(num).multipliedBy(0.15).plus(total).toNumber()
        } else {
          total = new BigNumber(num).multipliedBy(0.1).plus(total).toNumber()
        }
      })
      return total
    })

    const toMore = () => {
      sessionStorage.setItem('compData', JSON.stringify(compData.value))
      router.replace({ name: 'coll-list' })
    }
    // sndt click
    const handleClick = (item: any,idx: number) => {
      if (item.Chipcount == 0) {
        return
      }
      if(!item.loaded) {
        Toast(t('sendSNFT.loadchip'))
        return
      }
      const { index } = props
      item.select = !item.select
      console.log('select', compData.value, item)
      const { children } = compData.value
      const clds = children.filter(item => item.select)
      context.emit('changeSelect', { ...compData.value, children: clds, childIndex: idx,  index, item})
    }
    // All/none
    const chooseAll = () => {
      compData.value.select = !compData.value.select
      if (compData.value) {
        compData.value.children.forEach(item => {
          if (!item.disabled) {
            item.select = compData.value.select
          }
        })
      }
      debugger
      const { children } = compData.value
      // Push selected data to superiors
      context.emit('changeSelect', {
        ...compData.value,
        children: children.filter(item => item.select)
      })
    }
    const metaDomain = ref(`${VUE_APP_METAURL}`)

    // The conversion rate is calculated according to the number of SNFT selected
    const ratio = computed(() => {
       return 0.271
    })
    return {
      addressMask,
      metaDomain,
      currentNetwork,
      layoutType,
      toDetail,
      toggleSelect,
      toUsd,
      weiToNumber,
      toUsdSymbol,
      amountType,
      checkAll,
      checkLen,
      totalAmount,
      toMore,
      handleClick,
      compData,
      ratio,
      chooseAll
    }
  }
})
</script>
<style lang="scss" scoped>
@media screen and (min-width: 756px) {
  .nft-card.card {
    width: 49%;
    margin-right: 0 !important;
  }
  .coll-card:nth-of-type(8n + 8) {
    margin-right: 6.4px !important;
  }
  .coll-list {
    justify-content: space-between;
  }
}

.new-nft-card {
  border: 2px solid #fff;
  &.blink {
    border: 2px solid;
    border-image: linear-gradient(180deg, rgba(255, 240, 197, 1), rgba(255, 255, 255, 1), rgba(251, 195, 50, 1)) 2 2;
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
      background-image: linear-gradient(90deg, rgba(251, 195, 50, 1), rgba(255, 255, 255, 1), rgb(253, 206, 78));
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
          content: '';
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
      margin-right: 0px;
    }
  }
  .total-amount {
    font-size: 12px;
    .select-box {
    }
    .am-box {
      color: #007cdd;
      font-weight: bold;
      span {
        font-size: 12px;
        transform: scale(0.8);
        position: absolute;
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
    .van-image {
      // width: 150px;
      // height: 150px;
      // overflow: hidden;
    }
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
</style>