<template>
  <van-list
    v-model:loading="loadNft"
    :finished="finished"
    @load="handleOnLoad"
    v-model:error="nftErr"
  >
    <van-sticky offset-top="91">
      <div class="flex between center-v create-box">
        <span class="f-12 text-bold label">{{t('createNft.createNFTs')}}</span>
        <span class="add flex center" @click="toCreate"><van-icon name="plus" /></span>
      </div>
    </van-sticky>
    <div :class="`nft-list ${layoutType}`" v-show="pageData.nftList.length">
      <NftCard
        v-for="item in pageData.nftList"
        :key="item.address"
        :data="item"
      />
    </div>
    <div
      class="flex center no-list pt-30"
      v-show="!pageData.nftList.length && !nftErr && finished"
    >
      <i class="iconfont icon-inbox"></i>
    </div>
    <div class="flex center noTokenBox" v-show="finished && !loadNft">
      <div>
        <div class="text-center tip1">
          {{ t("wallet.notoken", { type: "NFT" }) }}
          <span class="toCreate hover mr-4" @click="toCreate">{{
            t("createNft.createNFTs")
          }}</span>
          <span class="tip2 disabled">{{ t("createNft.findMore") }}</span>
        </div>
      </div>
    </div>

    <!-- error -->
    <div class="err-nft p-20" v-if="nftErr">
      <div class="text-center mt-20 mb-20 f-14">
        {{ t("createNft.pullagain") }}
      </div>
      <div class="flex center">
        <van-button @click="reLoading">{{ t("createNft.retry") }}</van-button>
      </div>
    </div>
  </van-list>
  <!-- </van-pull-refresh> -->
</template>

<script lang="ts">
import NftCard from "./nftCard.vue";
import { getNftOwner } from "@/popup/http/modules/nft";
import eventBus from "@/popup/utils/bus";

import {
  computed,
  ref,
  watch,
  reactive,
  Ref,
  defineComponent,
  SetupContext,
} from "vue";
import { useStore } from "vuex";
import { List, Toast, Button, PullRefresh, Sticky, Icon } from "vant";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { web3 } from "@/popup/utils/web3";
import { useToast } from "@/popup/plugins/toast";
import { encode, decode } from "js-base64";

export default defineComponent({
  name: "nft-list",
  components: {
    NftCard,
    [List.name]: List,
    [Button.name]: Button,
    [PullRefresh.name]: PullRefresh,
    [Sticky.name]: Sticky,
    [Icon.name]: Icon,
  },
  emits: ["onLoad"],
  setup(props: any, context: SetupContext) {
    const store = useStore();
    const { t } = useI18n();
    const router = useRouter();
    const layoutType = computed(() => store.state.system.layoutType);
    const accountInfo = computed(() => store.state.account.accountInfo);
    const pageData = reactive({ nftList: [] });
    const { $toast } = useToast();
    // nft load
    const loadNft: Ref<boolean> = ref(true);
    const finished: Ref<boolean> = ref(false);
    const nftErr: Ref<boolean> = ref(false);
    let params = {
      owner: accountInfo.value.address,
      page: "0",
      page_size: "8",
    };
    // Get user NFT
    const getNftList = async (params: any) => {
      // Get user NFT Gets the NFT list of the current account
      const { nfts, total } = await getNftOwner(params).finally(
        () => (loadNft.value = false)
      );
      // @ts-ignore
      if (nfts && nfts.length) {
        nfts.forEach((item) => {
          item.info = JSON.parse(decode(item.raw_meta_url));
          console.log("nft名称", item.info);
        });

        pageData.nftList.push(...nfts);
      }
      return Promise.resolve(nfts);
    };
    // List loading event
    const handleOnLoad = async () => {
      try {
        params.page = Number(params.page) + 1 + "";
        const list = await getNftList(params);
        if (!list || !list.length) {
          finished.value = true;
        }
      } catch (err) {
        nftErr.value = true;
        Toast(JSON.stringify(err));
      }
    };

    // Error, retry
    const reLoading = () => {
      nftErr.value = false;
      finished.value = false;
      params.page = "0";
      pageData.nftList = [];
      handleOnLoad();
    };

    // Update the current collectibles list each time you switch accounts
    eventBus.on("changeAccount", (address) => {
      params.owner = address;
      reLoading();
    });
    const toCreate = () => {
      if (Number(accountInfo.value.amount) == 0) {
        $toast.warn(t("wallet.haveNoMoney"));
        return false;
      }
      router.push({ path: "/createNft/step2" });
    };

    // The drop-down load
    const onRefresh = () => {
      reLoading();
    };

    const toAdd = () => {

    }
    return {
      toCreate,
      layoutType,
      handleOnLoad,
      pageData,
      nftErr,
      finished,
      loadNft,
      reLoading,
      onRefresh,

      t,
    };
  },
});
</script>
<style lang="scss" scoped>
.create-box {
  background: #f1f3f4;
  height: 30px;
  padding: 0 15px;
  .label {
    color: #848484;
  }
  .add {
    width: 36px;
height: 18px;
background: #037CD6;
border-radius: 9px;
cursor: pointer;
i {
  color: #fff;
  font-size: 14px;
}
  }
}
.nft-list {
  &.card {
    padding: 15px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-content: flex-start;
    // :deep(.nft-card:nth-of-type(odd)) {
    //   margin-right: 15px;
    // }
  }
}
.tip1 {
  .toCreate {
    color: #037cd6;
    font-size: 10px;
    &:hover {
      text-decoration: underline;
    }
  }
}
.tip2.disabled {
  color: #b3b3b3 !important;
}
</style>