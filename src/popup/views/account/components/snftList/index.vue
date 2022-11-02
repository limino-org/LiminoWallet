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
          <span class="tit lh-30 f-12 hover text-bold" @click="handleShowModal">
            {{ t("createNft.converttoERB") }} {{ chooseType.label }}
            <i
              :class="`iconfont ${
                showModal ? 'icon-shangjiantou' : 'icon-xiajiantou'
              }`"
            ></i
          ></span>
          <van-switch
            v-model="showConvert"
            size="17"
            @change="handleChangeSwitch"
            v-if="pageData.nftList.length"
          />
        </div>
      </div>
    </van-sticky>
    <div class="nft-list-box">
      <div
        :class="`nft-list ${layoutType} ${showConvert ? 'pb' : ''}`"
        v-show="pageData.nftList.length"
      >
        <SNftCard
          v-for="(item, idx) in pageData.nftList"
          :key="idx"
          :data="item"
          :index="idx"
          :status="chooseType.value"
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
  <!-- </van-pull-refresh> -->
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
  querySnftByCollection,
  collectionListPage,
  QuerySnftChip,
  snft_com_page,
  queryArraySnft,
  queryCollectionAllSnft,
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
} from "vue";
import TransferNFT from "@/popup/views/home/components/transferNft.vue";
import TransferNFTModal from "@/popup/views/home/components/transferNFTModal.vue";

import { useStore } from "vuex";
import { List, Toast, Button, Sticky, PullRefresh, Switch } from "vant";
import { useI18n } from "vue-i18n";
import { emit } from "process";
import { getWallet } from "@/popup/store/modules/account";
export default defineComponent({
  name: "snft-list",
  components: {
    SNftCard,
    [List.name]: List,
    [Sticky.name]: Sticky,
    [Switch.name]: Switch,
    TransferNFT,
    TransferNFTModal,
    [Button.name]: Button,
    [PullRefresh.name]: PullRefresh,
    SnftModal,
  },
  emits: ["onLoad", "changeSwitch"],
  setup(props: any, context: SetupContext) {
    const store = useStore();
    const { t } = useI18n();
    const layoutType = computed(() => store.state.system.layoutType);
    const accountInfo = computed(() => store.state.account.accountInfo);
    const network = ref(null);
    const blockNumber = ref(null)
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
    })

    const updateNetwork = async () => {
      if(!network.value){
        const wallet = await getWallet();
        network.value = await wallet.provider.getNetwork();
        console.log("network.value", network.value);
        return network.value
      }
      return network.value
    };
    const updateBlockNumber = async () => {
      const wallet = await getWallet();
      blockNumber.value = await wallet.provider.getBlockNumber();
      console.log('blockNumber.value', blockNumber.value)
      return blockNumber.value
    }

    // Classified data
    const categoryList = ref(new Map());
    // Gets a collection of specified accounts
    const getcollectionListPage = async (sendParams: any) => {
      await updateNetwork();
      await updateBlockNumber()
      showConvert.value = false;
      context.emit("changeSwitch", false);
      try {
        const { data, total_count } = await queryOwnerSnftCollections(
          sendParams
        );
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
          const snftList = await Promise.all(proList);
          console.warn("snftList", snftList);
          data.forEach((child: any, idx: number) => {
            const snfts = snftList[idx];
            console.log("snfts--------", snfts);
            snfts.forEach((item: any, index: number) => {
              const { nft_contract_addr, nft_token_id, Exchange, MergeLevel } =
                item;
              item.loaded = false;
              console.warn("MergeLevel", MergeLevel);
              switch (MergeLevel) {
                case 1:
                  break;
                case 0:
                  break;
              }
              snftchipList.push({
                nft_contract_addr,
                nft_token_id,
                index,
                idx,
                Exchange: Exchange || null,
              });
            });
            child.children = toRaw(snfts);
            child.FullNFTs = toRaw(snfts);
            child.img_url = child.img;
            child.total_hold = child.chipcount;
            child.Chipcount = child.chipcount;
            child.address = snfts[0].nft_address.substr(0, 40);
            child.nft_address = child.address;
            child.pledgestate =
              chooseType.value.value === "1" ? "Pledge" : "NoPledge";
            if(child.pledgestate === 'Pledge') {
              if(network.value.chainId === 51888){
                child.isUnfreeze = blockNumber.value - child.BlockNumber > 72 ? true : false
              } else {
                child.isUnfreeze = blockNumber.value - child.BlockNumber > 6307200 ? true : false
              }
              child.disabled = child.isUnfreeze ? false : true
            }
 
          });
          console.log('snftchipList', snftchipList)
          for await (const params of snftchipList) {
            try {
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
                .map((item: any) => item.nft_address)
              data[idx].children[index].snfts = addList;
              data[idx].children[index].loaded = true;
            } catch (err) {
              console.error(err);
              // Toast(JSON.stringify(err));
            }
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
      const { createaddr, name, owner_addr } = params;
      let delList = [];
      try {
        const { data }: any = await querySnftByCollection(params);
        console.log("snfts data", data);
        if (data.length < 16) {
          const { data: data2 } = await queryCollectionAllSnft({
            createaddr,
            name,
          });
          const nftAddrList = data.map((item: any) => item.nft_address.toUpperCase())
          console.log('nftAddrList', nftAddrList)
          delList = data2.filter(item => {
            if(!nftAddrList.includes(item.nft_address.toUpperCase())) {
              return item
            }
          })
          .filter((item: any, index: number) => {
            item.Chipcount = 0;
              item.snfts = [];
              item.index = data.length + index;
              item.loaded = true;
              item.actionType = chooseType.value.value;
              return item;
          });
        }
        console.warn("delList", delList);
        data.push(...delList);
        data.forEach((item: any) => {
          const { BlockNumber, nft_address, Chipcount } = item;
          // console.warn('nowBlockNumber', nowBlockNumber)
          // console.warn('BlockNumber', BlockNumber, network.value.chainId )
          if (BlockNumber) {
            item.isUnfreeze =
              blockNumber.value - BlockNumber >
              (network.value.chainId === 51888 ? 72 : 6307200)
                ? true
                : false;
          }
          item.address = nft_address.substr(0, 40);
          item.actionType = chooseType.value.value;
          item.select = false;
          item.id = nft_address.substr(39);
          item.total_hold = Chipcount;
        });
        return data
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

    // The list load event updates the current Snft list each time the account is switched
    eventBus.on("changeAccount", (address) => {
      params.owner_addr = address;
      reLoading();
    });
    // Selected data
    const checkObjs = reactive({ data: {} });
    const changeSelect = async (data: any) => {
      console.warn("data", data);
      const { address, children, MergeLevel } = data;
      if (address && typeof address !== "undefined") {
        if (MergeLevel === 2) {
          if (children.length) {
            const nft_address = children[0].nft_address.substr(0, 40);
            checkObjs.data[address] = [{ ...data }];
          } else {
            checkObjs.data[address] = [];
          }
          return;
        }
        checkObjs.data[address] = children;
      }
      let time = setTimeout(() => {
        console.log('selectList', selectList.value)
        clearTimeout(time)
      },1000)
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
      // According to the number of each collection selected, 16 all selected according to 0.225, otherwise according to 0.15 fragments 0.1
      Object.keys(checkObjs.data).forEach((key) => {
        const len = checkObjs.data[key].length;
        if (len) {
          // If the collection is not full
          checkObjs.data[key].forEach((item: any) => {
            const { Chipcount, MergeLevel, MergeNumber,snfts } = item;
            switch (MergeLevel) {
              case 0:
                add = new BigNumber(snfts.length)
                  .multipliedBy(0.095)
                  .plus(add)
                  .toNumber();
                break;
              case 1:
                add = new BigNumber(MergeNumber)
                  .multipliedBy(0.143)
                  .plus(add)
                  .toNumber();
                break;
              case 2:
                add = new BigNumber(MergeNumber)
                  .multipliedBy(0.271)
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
        isUnfreeze,
        DeletedAt,
        MergeLevel,
      } = item;
      const { status } = props;
      if (status == "3") {
        return disabled ? "disabled" : "";
      }
      if (status == "2") {
        if (pledgestate == "Pledge" || !Chipcount) {
          return "disabled";
        }
      }
      if (status == "1") {
        if (
          pledgestate == "NoPledge" ||
          (typeof isUnfreeze != "undefined" && isUnfreeze === false) ||
          DeletedAt ||
          MergeLevel !== 1
        ) {
          return "disabled";
        }
      }
      return "";
    };
    const selectedText = computed(() => {
      const { value } = chooseType.value;
      let totalSnft = 0;
      let totalColl = 0;
      if (value == "1" || value == "3") {
        Object.keys(checkObjs.data).forEach((key) => {
          if (key && key != "undefined") {
            checkObjs.data[key].forEach((child) => {
              const { MergeLevel } = child;
              if (MergeLevel === 2) {
                totalColl += 1;
              }
              if (MergeLevel === 1) {
                totalSnft += 1;
              }
            });
          }
        });
        return `${totalColl}(C)/${totalSnft}(N)/0(F)`;
      }
      if (value == "2") {
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
        return `${totalColl}(C)/${totalSnft}(N)/${totalChip}(F)`;
      }
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
      selectAll.value = select;
    };

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
      let total = 0
      let am = 0
      const selectAddrs = checkObjs.data
      Object.keys(selectAddrs).forEach(key => {
        const list = selectAddrs[key]
        if(list && list.length) {
          list.forEach((item:any) => {
            total = total+1
            const { MergeLevel } = item
            switch(MergeLevel){
              case 2:
              am += 0.271
                break;
              case 1:
              am += 0.143
                break;
              case 0:
              am += 0.095
                break;
            }
          })
        }
      })
      return parseFloat(new BigNumber(am).div(total).toFixed(5))
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
      t,
    };
  },
});
</script>
<style lang="scss" scoped>
.nft-list-box {
  margin-bottom: 70px;
}
:deep() {
  .van-switch {
    background: #b3b3b3;
  }
  .van-switch--on {
    background: #037cd6;
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
      color: #037cd6;
      i {
        color: #037cd6;
      }
    }
  }
  .transferBtn {
    width: 35px;
    height: 18px;
    line-height: 18px;
    background: #037cd6;
    color: #fff;
    text-align: center;
    border-radius: 9px;
    &.outline {
      background: #fff;
      border: 1px solid #037cd6;
      padding: 0 4px;
      display: inline-block;
      color: #037cd6;
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