<template>
  <div class="nft-detail">
    <div class="quanping">
      <i
        class="iconfont icon-fangda hover"
        color="#FDFDFD"
        @click="showImg"
      ></i>
    </div>
    <div class="code flex center" @click="showImg">
      <van-image
        :src="nftInfo.info.meta_url"
        width="6.8rem"
        height="6.8rem"
      ></van-image>
    </div>

    <!-- NFT information -->
    <div class="form van-hairline--surround">
      <div class="content van-hairline--bottom">
        <div class="form-titie">{{ t("sendNFT.name") }}</div>
        <div class="form-content name">{{ nftInfo.info.name }}</div>
      </div>
      <div class="content van-hairline--bottom">
        <div class="form-titie">{{ t("sendNFT.address") }}</div>
        <div class="form-content van-ellipsis">
          {{ addressMask(pageData.data.address) }}
        </div>
      </div>
      <div class="content">
        <div class="form-titie">{{ t("sendNFT.amount") }}</div>
        <div class="form-content">
          <!-- 0 ERB / $ 0 -->
          {{ pageData.data.royalty_ratio }}ERB
        </div>
      </div>
    </div>
    <!-- function -->
    <div class="flex evenly">
      <van-sticky position="bottom" :offset-bottom="30">
        <div class="actions-btn" @click="toSend">
          <div class="action-icon flex center">
            <i class="iconfont icon-teshujiantouzuoxiantiao-copy"></i>
          </div>
          <div class="send-action text-center">{{ t("sendNFT.send") }}</div>
        </div>
      </van-sticky>
      <van-sticky position="bottom" :offset-bottom="30">
        <div class="actions-btn" @click="tomore">
          <div class="action-icon flex center">
            <i class="iconfont icon-wendang"></i>
          </div>
          <div class="send-action text-center">{{ t("sendNFT.more") }}</div>
        </div>
      </van-sticky>
    </div>
  </div>
</template>
<script lang="ts">
import { showSlider, show } from "@/popup/components/navHeader/hooks/slider";
import {
  Tab,
  Tabs,
  Popup,
  Icon,
  Dialog,
  Sticky,
  Toast,
  Loading,
  Image,
  Empty,
  ImagePreview,
} from "vant";
import {
  ref,
  Ref,
  reactive,
  onMounted,
  computed,
  toRefs,
  watch,
  onBeforeMount,
} from "vue";
import NavHeader from "@/popup/components/navHeader/index.vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { addressMask, decimal } from "@/popup/utils/filters";
import { web3 } from "@/popup/utils/web3";

export default {
  components: {
    NavHeader,
    [Icon.name]: Icon,
    [Sticky.name]: Sticky,
    [Image.name]: Image,
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const route = useRoute();
    const nftInfo = ref(JSON.parse(sessionStorage.getItem("nftInfo")));
    const { address, info } = nftInfo;
    const pageData = reactive({ data: nftInfo });

    const handleLeft = () => {
      router.back();
    };
    const toSend = () => {
      router.push({
        name: "sendNft-step2",
        query: {
          address,
        },
      });
    };
    const tomore = () => {
      Toast(t("sendNFT.tomore"));
    };
    const showImg = () => {
      ImagePreview({ images: [nftInfo.value.info.meta_url], closeable: true });
    };

    return {
      t,
      handleLeft,
      pageData,
      toSend,
      addressMask,
      nftInfo,
      name,
      tomore,
      showImg,
    };
  },
};
</script>
<style lang="scss" scoped>
  .quanping {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
    margin-right: 22px;
    i {
      top: 10px;
      right: 22px;
      font-size: 16px;
      color: #9A9A9A;
    }
  }
.nft-detail {
  padding-bottom: 50px;
  .back {
    font-size: 18px;
    color: rgba(3, 125, 214, 1);
  }

  .code {
    width: 256px;
    height: 256px;
    margin: 25px auto 15px;
    border: 1px solid #ccc;
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
      background: #f4faff;
      border-radius: 7.5px;
      text-align: center;
      padding: 4px 0;
      box-sizing: border-box;
      &.active {
        border: 1px solid #037cd6;
      }
      & > div {
        line-height: 20px;
      }
      &-t {
        font-size: 10px;
        color: #848484;
      }
      &-m {
        font-weight: bold;
        font-size: 12px;
      }
      &-b {
        font-size: 10px;
        color: #848484;
      }
    }
  }
  .form {
    margin: 20px;
    height: 205px;
    &:after {
      border-radius: 5px;
    }
    .content {
      font-size: 14px;
      line-height: 20px;
      padding: 15px 10px;
      .form-titie {
        color: #9A9A9A;
      }
      .name {
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
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
      background-color: #037cd6;
      border-radius: 50%;
      i {
        font-size: 16px;
        color: #fff;
      }
    }
    .send-action {
      line-height: 16px;
      color: rgba(3, 125, 214, 1);
      font-size: 12px;
      margin-top: 7px;
    }
  }
}
</style>