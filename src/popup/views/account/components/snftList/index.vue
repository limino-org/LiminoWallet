<template>
  <!-- <van-pull-refresh v-model="loadNft" @refresh="onRefresh"> -->
  <van-list
    v-model:loading="loadNft"
    :finished="finished"
    @load="handleOnLoad"
    v-model:error="nftErr"
  >
    <van-sticky :offset-top="91">
      <div>
        <div class="flex between nfttransfer-box center-v pl-14 pr-14">
          <span class="tit lh-30 f-12 hover text-bold">
            {{ t("createNft.converttoERB") }} {{ chooseType.label }}
            <!-- <i
              :class="`iconfont ${
                showModal ? 'icon-shangjiantou' : 'icon-xiajiantou'
              }`"
            ></i
          > -->
          </span>
          <van-switch
            v-model="showConvert"
            size="17"
            @change="handleChangeSwitch"
            v-if="pageData.nftList.length"
          />
        </div>
      </div>
    </van-sticky>
    <div :class="`nft-list-box ${!loadNft && pageData.nftList.length ? 'mb-90' : ''}`">
      <div
        :class="`nft-list ${layoutType} ${showConvert ? 'pb' : ''}`"
        v-show="pageData.nftList.length"
      >
        <SNftCard
          v-for="(item, idx) in pageData.nftList"
          :key="idx"
          :data="item"
          :index="idx"
          @changeSelect="changeSelect"
          :showIcon="showConvert"
          :selectAll="selectAll"
          toName="snftcollection-step1"
        />
      </div>

      <!-- no data -->
      <div
        class="flex center no-list pt-30"
        v-show="!pageData.nftList.length && !nftErr && finished"
      >
        <i class="iconfont icon-inbox"></i>
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
    </div>
  </van-list>

  <Transition name="slider">
      <div class="load-tip flex center" v-if="showConvert && loadNft">
        <div class="load-tip-con flex-1 flex center"><van-loading color="#9F54BA"  size="13"/> <span class="ml-4">{{ t('common.loading') }}</span></div>
      </div>
  </Transition>

  <!-- </van-pull-refresh> -->
  <SliderBottom>
    <i18n-t keypath="wallet.buySnft" tag="div" class="text-center f-12">
        <template v-slot:link><a :href="VUE_APP_OFFICIAL_EXCHANGE" target="__blank">{{ t('wallet.findMore') }}</a></template>
      </i18n-t>
  </SliderBottom>
  <!-- nft snft -->
  <TransferNFT
    v-model="showConvert"
    @handleConfirm="handleConfirmNFT"
    @handleAll="handleAll"
    :selectNumber="selectLength"
    :selectTotal="selectTotal"
    :type="chooseType.value"
    :ratio="ratio"
    :selectedText="selectedText"
  />
  <!-- nft snft Conversion of pop-ups -->
  <TransferNFTModal
    :selectNumber="selectedText"
    :selectTotal="selectTotal"
    :selectList="selectList"
    v-model="showNFTModal"
    :ratio="ratio"
    :txtype="chooseType.value"
    type="2"
    @success="reLoading"
    @fail="reLoading"
  />
  <SnftModal v-model="showModal" :loading="loadNft" @change="handleChoose" />
</template>

<script lang="ts">
import SNftCard from "./snftCard.vue";
import {
  queryOwnerSnftCollections,
  QuerySnftChip,
  queryAllSnftByCollection
} from "@/popup/http/modules/nft";

import eventBus from "@/popup/utils/bus";
import BigNumber from "bignumber.js";
import SnftModal from "./snftModal.vue";
import {
  computed,
  ref,
  watch,
  reactive,
  Ref,
  defineComponent,
  SetupContext,
  onMounted,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  toRaw,
  nextTick,
  onUnmounted,
} from "vue";
import TransferNFT from "@/popup/views/home/components/transferNft.vue";
import TransferNFTModal from "@/popup/views/home/components/transferNFTModal.vue";

import { useStore } from "vuex";
import { List, Toast, Button, Sticky, PullRefresh, Switch, Loading } from "vant";
import { useI18n } from "vue-i18n";
import { VUE_APP_OFFICIAL_EXCHANGE } from "@/popup/enum/env";
import SliderBottom from "@/popup/components/sliderBottom/index.vue";
import { debounce } from "@/popup/utils/utils";
export default defineComponent({
  name: "snft-list",
  components: {
    SNftCard,
    [List.name]: List,
    [Sticky.name]: Sticky,
    [Switch.name]: Switch,
    [Loading.name]: Loading,
    TransferNFT,
    TransferNFTModal,
    [Button.name]: Button,
    [PullRefresh.name]: PullRefresh,
    SnftModal,
    SliderBottom
  },
  emits: ["onLoad", "changeSwitch"],
  setup(props: any, context: SetupContext) {
    const store = useStore();
    const { t } = useI18n();
    const layoutType = computed(() => store.state.system.layoutType);
    const accountInfo = computed(() => store.state.account.accountInfo);

    const pageData = reactive({ nftList: [] });
    // nft load
    const loadNft: Ref<boolean> = ref(false);
    const finished: Ref<boolean> = ref(false);
    const nftErr: Ref<boolean> = ref(false);
    let params = {
      owner_addr: accountInfo.value.address,
      categories: "*",
      count: "3",
      start_index: "0",
      currentPage: 0,
      status: "2",
    };

    onActivated(() => {
      params.owner_addr = accountInfo.value.address;
      reLoading();
    });


    // Classified data
    const categoryList = ref(new Map());
    // Gets a collection of specified accounts
    const getcollectionListPage = async (sendParams: any) => {
      if (isChangeAccount) {
        return {};
      }
      // context.emit("changeSwitch", false);
      try {
        const { data, total_count } = await queryOwnerSnftCollections(
          sendParams
        );
        if (isChangeAccount) {
          return {};
        }
        console.warn("collections", data);
        console.warn("total", total_count);
        // Load the SNFT data of the collection

        const proList = [];
        const snftchipList = [];
        if (data && data.length) {
          data.forEach((item: any) => {
            const { collection_creator_addr, name, chipcount } = item;
            proList.push(
              getSnfts({
                name,
                createaddr: collection_creator_addr,
                owner_addr: accountInfo.value.address,
              })
            );
          });
          if (isChangeAccount) {
            return {};
          }
          const snftList = await Promise.all(proList);
          console.warn("snftList", snftList);
          data.forEach((child: any, idx: number) => {
            const snftsData = snftList[idx];
            const {snfts, snftChips} = snftsData
            child.img_url = child.img;
            child.address = snfts[0].nft_address.substr(0, 40);
            child.nft_address = child.address;
            
            
            data[idx]['FullNFTs'] = snfts
            data[idx]['children'] = snfts
          });
          if (isChangeAccount) {
            return {};
          }
          console.log("snftchipList", snftchipList);
          for await (const params of snftchipList) {
            try {
              if (isChangeAccount) {
                break;
              }
              const { nft_contract_addr, nft_token_id, index, idx, DeletedAt } =
                params;
              const res = await QuerySnftChip({
                nft_contract_addr,
                nft_token_id,
                start_index: "0",
                count: "16",
              });
              const addList = res.data
                .filter(
                  (item: any) =>
                    item.ownaddr.toUpperCase() ==
                    accountInfo.value.address.toUpperCase()
                )
                .map((item: any) => item.nft_address);
              data[idx].children[index].snfts = addList;
              data[idx].children[index].loaded = true;
            } catch (err) {
              console.error(err);
              // Toast(JSON.stringify(err));
            }
          }
          if (isChangeAccount) {
            return {};
          }
          pageData.nftList.push(...data);
          console.log("pageData.nftList", pageData.nftList);
        }
        return data;
      } catch (err) {
        console.error(err);
      }
    };
    // Check SNFT of collection according to name
    const getSnfts = async (params: any) => {
      const { owner_addr } = params;
      try {
        const {data}: any = await queryAllSnftByCollection(params);
        console.log('res', data)
        const { snftChips, snfts } = data
        console.log("snfts snftChips", snftChips);
        console.log("snfts", snfts);
        snfts.forEach((item: any) => {
          item['MergeLevel'] = item.mergelevel
          item['MergeNumber'] = item.mergenumber
          item.id = item.nft_address.substr(39).replaceAll('m','');
          const mySnfts = snftChips.map(child => {
            if(child.ownaddr.toUpperCase() == owner_addr.toUpperCase()){
              const childAddr = child.nft_address.substr(0, child.nft_address.length - 1)
              const fatherAddr = item.nft_address.substr(0, item.nft_address.length - 1)
            if(childAddr.toUpperCase() == fatherAddr.toUpperCase()){
              return child.nft_address
            }
            }
          }).filter(s => s)
          item['snfts'] = mySnfts
        })
        return data;
      } catch (err) {
        console.error(err);
      }
    };

    // List loading event
    const handleOnLoad = async () => {
      loadNft.value = true;
      const p = {
        "3": "NoPledge",
        "2": "",
        "1": "Pledge",
      };
      if (isChangeAccount) {
        return {};
      }
      try {
        const { currentPage, count, owner_addr, categories, status } = params;
        const start_index = currentPage * Number(params.count) + "";
        const list = await getcollectionListPage({
          categories,
          count,
          start_index,
          owner_addr,
          status: p[status],
        });
        // handleAll(false);
        if (!list || !list.length) {
          finished.value = true;
        }
        params.currentPage = params.currentPage + 1;
      } catch (err) {
        nftErr.value = true;
        Toast(JSON.stringify(err));
      } finally {
        loadNft.value = false;
      }
    };
    let isChangeAccount = false;
    // The list load event updates the current Snft list each time the account is switched
    eventBus.on("changeAccount", (address) => {
      loadNft.value = true;
      showConvert.value = false;
      checkObjs.data = {};
      nftErr.value = false;
      params.start_index = "0";
      params.currentPage = 0;
      finished.value = false;
      pageData.nftList = [];
      let time = null;
      if (time) {
        clearTimeout(time);
      }
      isChangeAccount = true;
      params.owner_addr = address;
      time = setTimeout(() => {
        isChangeAccount = false;
        reLoading();
        clearTimeout(time);
      }, 1000);
    });
    // Selected data
    const checkObjs = reactive({ data: {} });
    const changeSelect = async (data: any) => {
      console.warn("data", data);
      const { address, children, MergeLevel } = data;
      if (address && typeof address !== "undefined") {
        if (MergeLevel === 2) {
          if (children.length) {
            checkObjs.data[address] = [{ ...data }];
          } else {
            checkObjs.data[address] = [];
          }
          return;
        }
        checkObjs.data[address] = children;
      }
      let time = setTimeout(() => {
        console.log("selectList", selectList.value);
        clearTimeout(time);
      }, 1000);
    };
    // Error, retry
    const reLoading = () => {
      showConvert.value = false;
      checkObjs.data = {};
      nftErr.value = false;
      params.start_index = "0";
      params.currentPage = 0;
      finished.value = false;
      pageData.nftList = [];
      handleOnLoad();
    };

    // Selected length
    const selectLength = computed(() => {
      if (!pageData.nftList.length) {
        return 0;
      }
      let len = 0;
      Object.keys(checkObjs.data).forEach((key) => {
        checkObjs.data[key]
          .filter((item) => item.select)
          .forEach((item: any) => {
            len += item.Chipcount;
          });
      });
      return len;
    });

    // Select the amount of data
    const selectTotal = computed(() => {
      console.warn("checkObjs.data", checkObjs.data);
      // if (!selectLength.value) {
      //   return 0;
      // }
      let add = 0;
      const { t0, t1, t2, t3 } = store.state.configuration.setting.conversion
      // According to the number of each collection selected, 16 all selected according to 0.225, otherwise according to 0.15 fragments 0.1
      Object.keys(checkObjs.data).forEach((key) => {
        const len = checkObjs.data[key].length;
        if (len) {
          // If the collection is not full
          checkObjs.data[key].forEach((item: any) => {
            const { Chipcount, MergeLevel, MergeNumber, snfts } = item;
            // if(MergeLevel === 2) {
            //   add += new BigNumber(MergeNumber)
            //  .multipliedBy(0.271)
            //   .plus(add)
            //   .toNumber();
            // }
            switch (MergeLevel) {
              case 0:
                add = new BigNumber(snfts.length)
                  .multipliedBy(t0)
                  .plus(add)
                  .toNumber();
                break;
              case 1:
                add = new BigNumber(MergeNumber)
                  .multipliedBy(t1)
                  .plus(add)
                  .toNumber();
                break;
              case 2:
                add = new BigNumber(MergeNumber)
                  .multipliedBy(t2)
                  .plus(add)
                  .toNumber();
                break;
            }
          });
        }
      });
      return add;
    });
    const getDisabled = (item: any) => {
      const {
        pledgestate,
        Chipcount,
        disabled,
        snfts,
        isUnfreeze,
        DeletedAt,
        MergeLevel,
        ownaddr
      } = item;

      if (MergeLevel == 0 && !snfts.length) {
          return "disabled";
      }
      if (MergeLevel > 0 && ownaddr.toUpperCase() != accountInfo.value.address.toUpperCase()) {
          return "disabled";
      }
      return "";
    };
    const selectedText = computed(() => {
        let totalChip = 0;
        let totalSnft = 0;
        let totalColl = 0;
        Object.keys(checkObjs.data).forEach((key) => {
          if (key && key != "undefined") {
            checkObjs.data[key].forEach((child) => {
              if (getDisabled(child) == "") {
                const { MergeLevel, Chipcount, pledgestate } = child;
                if (MergeLevel == 0 && Chipcount && pledgestate == "NoPledge") {
                  totalChip += child.snfts.length;
                }
                if (MergeLevel == 1 && Chipcount && pledgestate == "NoPledge") {
                  totalSnft += 1;
                }
                if (MergeLevel == 2 && Chipcount && pledgestate == "NoPledge") {
                  totalColl += 1;
                }
              }
            });
          }
        });
        return `${totalColl}(L2)/${totalSnft}(L1)/${totalChip}(L0)`;
 
    });
    // List of selections
    const selectList = computed(() => {
      return checkObjs.data;
    });

    // nft transform
    const showConvert = ref(false);
    const handleConvert = () => {
      showConvert.value = true;
    };

    // Make sure the transition opens the popover
    const showNFTModal = ref(false);
    const handleConfirmNFT = () => {
      if (!selectLength.value) {
        Toast(t("sendSNFT.pleasechoose"));
        return;
      }
      showNFTModal.value = true;
    };
    const selectAll = ref(false);
    //All/none
    const handleAll = (select) => {
      console.warn("select-----------------", select);
      selectAll.value = select;
    };

    // const showSlider = ref(false)
    // watch(() => [showConvert.value,loadNft.value], (n) => {
    //   console.warn('watch slider', n)
    // })

    watch(
      () => selectAll.value,
      (n) => {
        console.warn("select all 1111111111111");
      }
    );
    // The drop-down load
    const onRefresh = () => {
      reLoading();
    };

    const showModal = ref(false);
    const handleShowModal = () => {
      if (loadNft.value) {
        Toast(t("common.loadingText"));
        return;
      }
      showModal.value = !showModal.value;
    };
    /**
     * status
     * 2 duihuan
     * 3 zhiya
     * 1 shuhui
     */

    const params2 = {
      owner: accountInfo.value.address,
      page: "1",
      page_size: "60",
      status: "3",
    };
    const chooseType = ref({
      label: t("createExchange.convert"),
      value: "2",
      desc: t("createExchange.desc3"),
      select: true,
    });
    const handleChoose = (e: any) => {
      finished.value = false;
      chooseType.value = e;
      params.start_index = "0";
      params.currentPage = 0;
      params.status = e.value;
      params2.page = "1";
      pageData.nftList = [];
      checkObjs.data = {};
      showConvert.value = false;
      handleOnLoad();
    };

    const handleChangeSwitch = (v: boolean) => {
      context.emit("changeSwitch", v);
    };

    // Exchange rate by selected quantity 256 by single snft
    const ratio = computed(() => {
      let total = 0;
      let am = 0;
      const { t0, t1, t2, t3 } = store.state.configuration.setting.conversion

      const selectAddrs = checkObjs.data;
      Object.keys(selectAddrs).forEach((key) => {
        const list = selectAddrs[key];
        if (list && list.length) {
          list.forEach((item: any) => {
            total = total + 1;
            const { MergeLevel } = item;
            switch (MergeLevel) {
              case 2:
                am += t2;
                break;
              case 1:
                am += t1;
                break;
              case 0:
                am += t0;
                break;
            }
          });
        }
      });
      return parseFloat(new BigNumber(am).div(total).toFixed(5));
    });

    return {
      ratio,
      handleChoose,
      chooseType,
      selectedText,
      handleShowModal,
      showModal,
      onRefresh,
      layoutType,
      handleOnLoad,
      pageData,
      changeSelect,
      showConvert,
      handleConvert,
      handleAll,
      selectAll,
      showNFTModal,
      handleConfirmNFT,
      selectLength,
      selectTotal,
      reLoading,
      loadNft,
      nftErr,
      handleChangeSwitch,
      finished,
      selectList,
      categoryList,
      checkObjs,
      VUE_APP_OFFICIAL_EXCHANGE,
      t,
    };
  },
});
</script>
<style lang="scss" scoped>

.load-tip {
  position: fixed;
  bottom: 100px;
  width: 100px;
  left: 50%;
  margin-left: -50px;
  padding: 3px 5px;
  box-shadow: 0px 0px 3px 0px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  background: #fff;
  color: #9F54BA;
  &-con {
   
  }
}
.nft-list-box {
  &.mb-90 {
    margin-bottom: 70px;
  }
}
.buySnft {
  color: #848484;
    background: #fff;
   &.fixed {
    z-index: 100;
    position: fixed;
    width: 190px;
    bottom: 10px;
    line-height: 14px;
    left: 50%;
    margin-left: -95px;
    padding: 3px 5px;
    box-shadow: 0px 0px 3px 0px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
   }
  a {
    color: #9F54BA;
    &:hover{
      text-decoration: underline;
    }
  }
}
:deep() {
  .van-switch {
    background: #b3b3b3;
  }
  .van-switch--on {
    background: #9F54BA;
  }
}
.nft-list {
  &.pb {
    padding-bottom: 35px;
  }
  &.card {
    padding: 15px 15px 0px;
  }
  &.list {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    padding: 15px;
  }
}

.nfttransfer-box {
  background: #f1f3f4;
  height: 30px;
  .tit {
    i {
      font-size: 12px;
    }
    &:hover {
      color: #9F54BA;
      i {
        color: #9F54BA;
      }
    }
  }
  .transferBtn {
    width: 35px;
    height: 18px;
    line-height: 18px;
    background: #9F54BA;
    color: #fff;
    text-align: center;
    border-radius: 9px;
    &.outline {
      background: #fff;
      border: 1px solid #9F54BA;
      padding: 0 4px;
      display: inline-block;
      color: #9F54BA;
      line-height: 16px;
      width: auto;
    }
    i {
      font-size: 16px;
      &::before {
        display: inline-block;
      }
    }
  }
}
.tip2.disabled {
  color: #b3b3b3 !important;
}
</style>