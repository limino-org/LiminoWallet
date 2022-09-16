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
          <span class="tit lh-30 f-12 hover text-bold" @click="handleShowModal"> {{ t("createNft.converttoERB") }} {{chooseType.label}}  <i :class="`iconfont ${showModal ? 'icon-shangjiantou' : 'icon-xiajiantou'}`"></i></span>
          <van-switch v-model="showConvert" size="17" @change="handleChangeSwitch" v-if="pageData.nftList.length" />
        </div>
      </div>
    </van-sticky>

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
    <div class="flex center noTokenBox" v-show="finished && !loadNft">
      <div>
        <div class="text-center tip1">
          {{ t("wallet.notoken", { type: "SNFTs" }) }}
          <span class="tip2 hover">{{ t("createNft.findMore") }}</span>
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
  <!-- nft snft -->
  <TransferNFT
    v-model="showConvert"
    @handleConfirm="handleConfirmNFT"
    @handleAll="handleAll"
    :selectNumber="selectLength"
    :selectTotal="selectTotal"
    :type="chooseType.value"
  />
  <!-- nft snft Conversion of pop-ups -->
  <TransferNFTModal
    :selectNumber="selectLength"
    :selectTotal="selectTotal"
    :selectList="selectList"
    v-model="showNFTModal"
    :txtype="chooseType.value"
    type="2"
    @nftConverSuccess="reLoading"
  />
  <SnftModal v-model="showModal" @change="handleChoose" />
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
} from "@/popup/http/modules/nft";

import eventBus from "@/popup/utils/bus";
import BigNumber from "bignumber.js";
import SnftModal from './snftModal.vue'
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
} from "vue";
import TransferNFT from "@/popup/views/home/components/transferNft.vue";
import TransferNFTModal from "@/popup/views/home/components/transferNFTModal.vue";

import { useStore } from "vuex";
import { List, Toast, Button, Sticky, PullRefresh, Switch } from "vant";
import { useI18n } from "vue-i18n";
import { emit } from "process";
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
    SnftModal
  },
  emits: ["onLoad",'changeSwitch'],
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
      owner: accountInfo.value.address,
      status: "3",
      page_size: "3",
      page: "1",
 
    };
    // Classified data
    const categoryList = ref(new Map());
    // Gets a collection of specified accounts
    const getcollectionListPage = async (params: any) => {
      try {
        // STEP1 查合集
        const { collections, total } = await collectionListPage(params);
        console.warn("collections", collections);
        console.warn("total", total);
        // Load the SNFT data of the collection
        const proList = [];
        const snftchipList = [];
        if (collections && collections.length) {
          collections.forEach((item: any) => {
            const { creator, name, id } = item;
            const num = parseInt(id.substr(3,36),16)
            const newName = `${num}-${name}`
            proList.push(
              getSnfts({
                name: newName,
                createaddr: creator,
                owner_addr: accountInfo.value.address,
              })
            );
          });
          // STEP2 查SNFT
          const snftList = await Promise.all(proList);
          console.warn('snftList', snftList)
          collections.forEach((child: any, idx: number) => {
            const snfts = snftList[idx];
            snfts.forEach((item: any, index: number) => {
              const { nft_contract_addr,nft_token_id } = item;
              item.loaded = false;
              snftchipList.push({
                nft_contract_addr,
                nft_token_id,
                index,
                idx,
              });
            });
            
            child.children = snfts;
            child.FullNFTs = snfts;
            child.address = snfts[0].nft_address.substr(0, 39);
          });
          console.warn('snftchipList', snftchipList)

          // STEP3 查SNFT碎片
          for await (const params of snftchipList) {
            try {
              const { nft_contract_addr, nft_token_id, index, idx } = params;
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
              console.log("idx", idx);
              console.log("index", index);
              
              try {
                debugger
                collections[idx].children[index].snfts = addList;
                collections[idx].children[index].loaded = true;
              } catch (err) {
                console.error(collections[idx].children)
                console.error(index)
                console.error(err);
              }
            } catch (err) {
              console.error(err);
              Toast(JSON.stringify(err));
            }
          }
          pageData.nftList.push(...collections);
          console.log("pageData.nftList", pageData.nftList);
        }
        return collections;
      } catch (err) {
        console.error(err);
      }
    };
    // Check SNFT of collection according to name
    const getSnfts = async (params: any) => {
      try {
        const { data }: any = await querySnftByCollection(params);
        data.forEach((item: any) => {
          item.address = item.nft_address.substr(0, 40);
          item.select = false;
          item.id = item.nft_address.substr(39);
          item.total_hold = item.Chipcount;
          // item.children = item.snft;
        });
        return data;
      } catch (err) {
        console.error(err);
      }
    };

    // List loading event
    const handleOnLoad = async () => {
      try {
        const { owner, page, page_size, status } = params;
        const list = await getcollectionListPage({
          page,
          page_size,
          status,
          owner,
        });
        if (!list || !list.length) {
          finished.value = true;
        }
        params.page = Number(params.page) + 1 + '';
      } catch (err) {
        nftErr.value = true;
        Toast(JSON.stringify(err));
      } finally {
        loadNft.value = false;
      }
    };

    // The list load event updates the current Snft list each time the account is switched
    eventBus.on("changeAccount", (address) => {
      params.owner = address;
      reLoading();
    });
    // Selected data
    const checkObjs = reactive({ data: {} });
    const changeSelect = async (data: any) => {
      debugger
      const { address, children } = data;
      checkObjs.data[address] = children;
    };
    // Error, retry
    const reLoading = () => {
      showConvert.value = false;
      checkObjs.data = {};
      nftErr.value = false;
      params.page = "1";
      finished.value = false;
      pageData.nftList = [];
      handleOnLoad();
    };
    // Selected length
    const selectLength = computed(() => {
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
      if (!selectLength.value) {
        return 0;
      }
      let add = 0;
      // According to the number of each collection selected, 16 all selected according to 0.225, otherwise according to 0.15 fragments 0.1
      Object.keys(checkObjs.data).forEach((key) => {
        const len = checkObjs.data[key].length;
        if (len) {
          const hasunfull = checkObjs.data[key].find(
            (item: any) => item.Chipcount != 16
          );
          const hasFull = !hasunfull && len == 16;
          if (!hasFull) {
            // 如果未集满合集
            checkObjs.data[key].forEach((item: any) => {
              // 是否集满单个snft
              if (item.Chipcount == 16) {
                add = new BigNumber(item.Chipcount)
                  .multipliedBy(0.15)
                  .plus(add)
                  .toNumber();
              } else {
                add = new BigNumber(item.Chipcount)
                  .multipliedBy(0.1)
                  .plus(add)
                  .toNumber();
              }
            });
          } else {
            // 如果集满一个合集
            add = new BigNumber(16 * 16)
              .multipliedBy(0.225)
              .plus(add)
              .toNumber();
          }
        }
      });
      return add;
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

    const showModal = ref(false)
    const handleShowModal = () => {
      showModal.value = !showModal.value
    }
            /**
     * status
     * 2 兑换
     * 3 质押
     * 1 赎回transfer-nft-con
     */

     const params2 = {
      owner: accountInfo.value.address,
      page: "1",
      page_size: "60",
      status: "3",
    };
    const chooseType = ref({label:t('createminerspledge.stake'),value:'3',desc:t('createExchange.desc1'),select: true},)
    const handleChoose = (e: any) => {
      list.value = []
      chooseType.value = e
      params.page = '1'
      params.status = e.value
      params2.page = '1'
      pageData.nftList = []
      handleOnLoad()
    }

    const handleChangeSwitch = (v: boolean) => {
      context.emit('changeSwitch', v)
    }

    const list = ref([])
    const onLoad = async () => {
      params2.status = chooseType.value.value;
      loadNft.value = true
      try {
        const { nfts } = await snft_com_page(params2);
        const nftAddList = nfts.map((item: any) => {
          const len = item.address.length;
          let str = item.address;
          switch (len) {
            case 39:
              str = str + "000";
              break;
            case 40:
              str = str + "00";
              break;
            case 41:
              str = str + "0";
              break;
            case 42:
              break;
          }
          return str;
        });
        if (!nfts || !nfts.length) {
          finished.value = true;

        }
        const { data: nftInfoList } = await queryArraySnft({
          array: `${JSON.stringify(nftAddList)}`,
        });

        nfts.forEach((item: any) => {
          const reallen = item.address.length;
          let str = item.address;
          switch (reallen) {
            case 39:
              str = str + "000";
              item.tag = "P";
              break;
            case 40:
              str = str + "00";
              item.tag = "C";
              break;
            case 41:
              str = str + "0";
              item.tag = "N";
              break;
            case 42:
             item.tag = "F";
              break;
          }
          item.realAddr = str;
          item.flag = false;
          item.nft_address = item.address;
  
          const str1 = item.nft_address.substr(item.nft_address.length - 2);
          // snft中的位置 最后2位转十六进制+1
          item.position = hex2int(str1) + 1;
          // convert
          const str2 = item.nft_address.substr(item.nft_address.length - 4);
          // 期中的位置  最后四位转十六进制+1
          item.number = hex2int(str2) + 1;
          nftInfoList.forEach((child: any) => {
            if (
              item.realAddr.toUpperCase() == child.nft_address.toUpperCase()
            ) {
              item.metaData = { ...child };
              item.source_url = child.source_url;
              item.collections = child.name;
            }
          });
        });
        params2.page = (Number(params2.page) + 1).toString();
        list.value.push(...nftInfoList)

        if (!nfts.length) {
          finished.value = true;
        }
      } catch (err) {
        console.error(err);
        finished.value = true;
      } finally {
        loadNft.value = false
      }
    };

    /**
     * 查询列表数据
     * 1 可兑换
     *    数据：snft碎片，snft， 合集
     *    碎片  -> 通过地址查 snft -> 通过snft查合集
     *    
     * 2 可质押
     * 3 可赎回
     */



    return {
      handleChoose,
      chooseType,

      handleShowModal,
      showModal,
      onRefresh,
      layoutType,
      handleOnLoad,
      onLoad,
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

const hex2int = (hex: any) => {
      let len = hex.length,
        a = new Array(len),
        code;
      for (let i = 0; i < len; i++) {
        code = hex.charCodeAt(i);
        if (48 <= code && code < 58) {
          code -= 48;
        } else {
          code = (code & 0xdf) - 65 + 10;
        }
        a[i] = code;
      }

      return a.reduce(function (acc, c) {
        acc = 16 * acc + c;
        return acc;
      }, 0);
    };
</script>
<style lang="scss" scoped>
  :deep(){
    .van-switch {
      background: #B3B3B3;
    }
    .van-switch--on {
      background: #037CD6;
    }
  }
.nft-list {
  &.pb {
    padding-bottom: 35px;
  }
  &.card {
    padding: 15px;
  }
  &.list {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    padding: 15px;
  }
}

.nfttransfer-box {
  background: #F1F3F4;
  height: 30px;
  .tit {
   
    i {
      font-size: 12px;
    }
    &:hover {
      color: #037CD6;
      i {
        color: #037CD6;
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
      border: 1PX solid #037cd6;
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