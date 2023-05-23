<template>
  <div class="nft-detail">
    <div class="code flex center">
      <van-image :src="pageData.meta_url" width="256px" height="256px"></van-image>
    </div>
    <div class="flex around text-center pl-20 pr-20">
      <div class="selection-box">
        <div class="lh-16 f-10 price mt-8">10 SNFs</div>
        <div class="lh-20 f-14">{{t('sendSNFT.low')}}</div>
        <div class="lh-16 f-10 price">1.5 ERB</div>
      </div>
      <div class="selection-box">
        <div class="lh-16 f-10 price mt-8">256 SNFs</div>
        <div class="lh-20 f-14">{{t('sendSNFT.high')}}</div>
        <div class="lh-16 f-10 price">768 ERB</div>
      </div>
      <div class="selection-box">
        <div class="lh-16 f-10 price mt-8">512 SNFs</div>
        <div class="lh-20 f-14">{{t('sendSNFT.ultraHigh')}}</div>
        <div class="lh-16 f-10 price">1536 ERB</div>
      </div>
    </div>
    <div class="form van-hairline--surround">
      <div class="content van-hairline--bottom">
        <div class="form-titie">{{t('sendSNFT.name')}}</div>
        <div class="form-content">{{ pageData.name }}</div>
      </div>
      <div class="content van-hairline--bottom">
        <div class="form-titie">{{t('sendSNFT.address')}}</div>
        <div class="form-content van-ellipsis">{{ pageData.address }}</div>
      </div>
      <div class="content van-hairline--bottom">
        <div class="form-titie">{{t('sendSNFT.amount')}}</div>
        <div class="form-content van-ellipsis">
          {{ pageData.erbNumber }} {{ currentNetwork.symbol }}
        </div>
      </div>
      <div class="content">
        <div class="form-titie">{{t('sendSNFT.ratio')}}</div>
        <div class="form-content">1 : 1.5</div>
      </div>
    </div>
    <div class="flex evenly">
      <van-sticky position="bottom" :offset-bottom="30">
        <div class="actions-btn" @click="toSend">
          <div class="action-icon flex center">
            <i class="iconfont icon-changyongtubiao-fuben-21"></i>
          </div>
          <div class="send-action text-center">{{t('sendSNFT.send')}}</div>
        </div>
      </van-sticky>
      <van-sticky position="bottom" :offset-bottom="30">
        <div class="actions-btn" @click="tomore">
          <div class="action-icon flex center">
            <i class="iconfont icon-a-weibiaoti-1_huaban1fuben38"></i>
          </div>
          <div class="send-action text-center">{{t('sendSNFT.more')}}</div>
        </div>
      </van-sticky>
    </div>
  </div>
</template>
<script lang="ts">
import { showSlider, show } from '@/popup/components/navHeader/hooks/slider'

import { Tab, Tabs, Popup, Icon, Dialog, Sticky, Toast, Loading, Image, Empty } from 'vant'
import { ref, Ref, reactive, onMounted, computed, toRefs, watch, onBeforeMount } from 'vue'
import NavHeader from '@/popup/components/navHeader/index.vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { addressMask, snftToErb } from '@/popup/utils/filters'
import { useStore } from 'vuex'

export default {
  components: {
    NavHeader,
    [Icon.name]: Icon,
    [Sticky.name]: Sticky,
    [Image.name]: Image
  },
  setup() {
    const { t } = useI18n()
    const router = useRouter()
    const store = useStore()
    const currentNetwork = computed(() => store.state.account.currentNetwork)

    const route = useRoute()
    const { query } = route
    const { address }: any = query
    const pageData = ref(query)
    const handleLeft = () => {
      router.back()
    }
    const toSend = () => {
      router.push({
        name: 'sendSnft-step2',
        query
      })
    }
    const tomore = () => {
      Toast('Coming soon!')
    }
    return {
      t,
      handleLeft,
      pageData,
      toSend,
      addressMask,
      snftToErb,
      currentNetwork,
      tomore
    }
  }
}
</script>
<style lang="scss" scoped>
.nft-detail {
  padding-bottom: 50px;
  .back {
    font-size: 18px;
    color: #9F54BA;
  }
  .code {
    width: 256px;
    height: 256px;
    margin: 25px auto 15px;
    border: 1PX solid #ccc;
    border-radius: 7px;
    overflow: hidden;
    :deep(.van-image) {
      border-radius: 7px;
      overflow: hidden;
    }
  }
  .info {
    margin: 0 15px;
    .card {
      width: 105px;
      height: 65px;
      background: #F8F3F9;
      border-radius: 7.5px;
      text-align: center;
      padding: 4px 0;
      box-sizing: border-box;
      &.active {
        border: 1PX solid #9F54BA;
      }
      & > div {
        line-height: 20px;
      }
      &-t {
        font-size: 12px;
        color: #848484;
      }
      &-m {
        font-weight: bold;
        font-size: 12px;
      }
      &-b {
        font-size: 12px;
        color: #848484;
      }
    }
  }
  .selection-box {
    width: 105px;
    height: 65px;
    background: #F8F3F9;
    .price {
      color: rgba(132, 132, 132, 1);
    }
  }
  .selection-box:hover {
    border: 1PX solid #9F54BA;
  }

  .form {
    margin: 20px;
    height: 270px;
    &:after {
      border-radius: 5px;
    }
    .content {
      font-size: 14px;
      line-height: 20px;
      padding: 15px 10px;
      .form-titie {
        color: #e4e7e8;
      }
    }
    .line {
      height: 1px;
      background-color: #e4e7e8;
    }
  }
  .actions-btn {
    .action-icon {
      margin: 0 auto;
      width: 35px;
      height: 35px;
      background-color: #9F54BA;
      border-radius: 50%;
      i {
        font-size: 16px;
        color: #fff;
      }
    }
    .send-action {
      line-height: 16px;
      color: #9F54BA;
      font-size: 12px;
      margin-top: 7px;
    }
  }
}
</style>