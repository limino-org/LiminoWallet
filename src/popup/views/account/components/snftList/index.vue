<template>
  <!-- <van-pull-refresh v-model="loadNft" @refresh="onRefresh"> -->
  <van-list v-model:loading="loadNft" :finished="finished" @load="handleOnLoad" v-model:error="nftErr">
    <van-sticky :offset-top="91">
      <div>
        <div class="flex between nfttransfer-box center-v pl-14 pr-14">
          <span class="tit lh-30 f-12 hover text-bold">
            {{ t("createNft.converttoERB") }} {{ t('createExchange.convert') }}
          </span>
          <van-switch v-model="showConvert" size="17" @change="handleChangeSwitch" v-if="newList.length" />
        </div>
      </div>
    </van-sticky>
    <div :class="`nft-list-box ${!loadNft && newList.length ? 'mb-90' : ''}`">
      <div :class="`nft-list ${layoutType} ${showConvert ? 'pb' : ''}`" v-show="newList.length">

        <div class="snft-card" v-for="(item, index) in newList" :key="item.nft_address">
          <div class="snft-card-tit flex between">
            <span class="tit">{{ item.collections }}</span>
            <span class="more">{{ t("sendSNFT.more") }}</span>
          </div>
          <div class="snft-card-list flex">
            <div class="coll-card hover" v-for="(child, idx) in item.children" :key="child.nft_address" @mouseover="handleMouseOver({ index, item, child, idx })" @mouseleave="handleMouseOut({ index, item, child, idx })">
              <i class="iconfont icon-duihao2 check-icon" v-if="child.checked && showConvert" @click="handleSelect({ index, item, child, idx, checked: false })"></i>
              <img src="./select-white.svg" class="check-icon-default no-select" alt="" v-if="showConvert && !child.checked" @click="handleSelect({ index, item, child, idx, checked: true })" />
              <img loading="lazy" :src="`${metaDomain}${child.source_url}`" class="snft-img" />
              <span class="arrow-top" v-if="child.children && child.children.length"></span>
            </div>
          </div>
          <Transition name="fade">
            <div v-if="item.load && item.showDetails" :class="['snft-list-out', showSNFTIdx > 8 ? 'sec' : '']" @mousemove="handleSNFTSMouseOver" @mouseleave="handleSNFTSMouseLeave({ item, index })">
              <div class="snft-list">
                <div class="flex center" v-show="item.load == 'loading'">
                  <van-loading size="28" color="#9F54BA"></van-loading>
                </div>
                <div v-for="sun in showSNFTList" class="snft-child" :key="sun.nft_address">
                  <img loading="lazy" :src="`${metaDomain}${sun.source_url}`" class="snft-img" />
                </div>
              </div>
            </div>

          </Transition>
          <div class="process-bar">
            <div class="tit">Ratio(1:1.5)</div>
            <div class="animate-bar">
              <div class="animate-bar-scale" v-for="i in 9"></div>
              <div class="animate-bar-track"></div>
            </div>
            <div class="flex right total-poss">
              <div class="text-right">200/256</div>
            </div>
          </div>
          <div class="select-all flex center-v" v-if="showConvert">
            <i :class="`iconfont hover ${item.checked ? 'icon-duihao2' : 'icon-check_line'}`" @click="handleAllSelect({ index, item })"></i>
             {{ t('common.all') }} {{ item.selectedStr }}
          </div>
        </div>
      </div>
      <!-- no data -->
      <div class="flex center no-list pt-30" v-show="!newList.length && !nftErr && finished">
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
      <div class="load-tip-con flex-1 flex center"><van-loading color="#9F54BA" size="13" /> <span class="ml-4">{{ t('common.loading') }}</span></div>
    </div>
  </Transition>

  <!-- </van-pull-refresh> -->
  <SliderBottom>
    <i18n-t keypath="wallet.buySnft" tag="div" class="text-center f-12">
      <template v-slot:link><a :href="VUE_APP_OFFICIAL_EXCHANGE" target="__blank">{{ t('wallet.findMore') }}</a></template>
    </i18n-t>
  </SliderBottom>
  <!-- nft snft -->
  <TransferNFT v-model="showConvert" @handleConfirm="handleConfirmNFT" @handleAll="handleAll" :selectNumber="selectLength" :selectTotal="selectTotal" :ratio="ratio" :selectedText="selectedText" />
  <!-- nft snft Conversion of pop-ups -->
  <!-- <TransferNFTModal
    :selectNumber="selectedText"
    :selectTotal="selectTotal"
    :selectList="selectList"
    v-model="showNFTModal"
    :ratio="ratio"
    :txtype="chooseType.value"
    type="2"
    @success="reLoading"
    @fail="reLoading"
  /> -->
  <SnftModal v-model="showModal" :loading="loadNft" @change="handleChoose" />
</template>

<script lang="ts">
import SNftCard from "./snftCard.vue";
import {
  queryOwnerSnftCollections,
  QuerySnftChip,
  queryAllSnftByCollection,
  queryAllSnftByStage,
  queryOwnerStage
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
import { VUE_APP_METAURL, VUE_APP_OFFICIAL_EXCHANGE } from "@/popup/enum/env";
import SliderBottom from "@/popup/components/sliderBottom/index.vue";
import { debounce } from "@/popup/utils/utils";
import { useToast } from "@/popup/plugins/toast";

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
    SliderBottom,
  },
  emits: ["onLoad", "changeSwitch"],
  setup(props: any, context: SetupContext) {
    const store = useStore();
    const { t } = useI18n();
    const layoutType = computed(() => store.state.system.layoutType);
    const accountInfo = computed(() => store.state.account.accountInfo);
    const metaDomain = ref(`${VUE_APP_METAURL}`);
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

    const getCollects = (stage_addr: string) => {
      return queryAllSnftByStage({
        stage_addr,
        start_index: '0',
        count: '16',
        snfttype: "collect"
      })
    }

    const stagesparams = {
      start_index: '0',
      count: '4'
    }

    const getStages = () => {
      const owner_addr = accountInfo.value.address.toString()
      // 0xac12a0b4a038abbe609613eb7634a04abf302c06
      return queryOwnerStage({
        owner_addr,
        ...stagesparams
      })
    }

    const showSNFTList = ref([])
    const showSNFTIdx = ref(null)

    let timer: any = null
    const handleMouseOut = ({ item, index, child, idx }) => {
      timer = setTimeout(() => {
        console.warn('handleMouseOut', index, idx)
        const myEle = newList.value[index]
        const currentCollection = newList.value[index].children[idx]
        myEle.showDetails = false
        showSNFTList.value = []
        showSNFTIdx.value = null
        clearTimeout(timer)
      }, 10)
    }
    const handleMouseOver = ({ item, index, child, idx }) => {
      if (timer) {
        clearTimeout(timer)
      }
      const myEle = newList.value[index]
      const currentCollection = newList.value[index].children[idx]
      console.warn('handleMouseOver', index, idx, currentCollection.loaded)
      if (newList.value[index].children[idx].children) {
        showSNFTList.value = [...newList.value[index].children[idx].children]
        showSNFTIdx.value = idx
        let t = setTimeout(() => {
          myEle.showDetails = true
          clearTimeout(t)
        })
      }

    }
    const handleSNFTSMouseOver = () => {
      if (timer) {
        clearTimeout(timer)
      }
    }

    const handleSNFTSMouseLeave = ({ index }) => {
      const myEle = newList.value[index]
      showSNFTList.value = []
      myEle.showDetails = false
    }

    const handleSelect = async ({ item, index, child, idx, checked }) => {
      console.log('get', item, child)
      showSNFTIdx.value = idx
      const currentCollection = newList.value[index].children[idx]
      const parentEle = newList.value[index]
      if (checked) {
        item.showDetails = true
        if (currentCollection.children) {
          const allChild = [...currentCollection.children]
          showSNFTList.value = [...allChild]
          parentEle.load = "loaded"
          currentCollection.checked = true
          // newList.value[index].
          nextTick(() => {
            item.showDetails = true
            //TODO:  
            item.selectAssets = []
            item.selectedStr = 0
          })
          return
        }

        currentCollection.checked = true
        parentEle.load = 'loading'
        const { collection_creator_addr, collections } = child

        const owner_addr = accountInfo.value.address.toUpperCase()
        // get collDetail
        const params = {
          createaddr: collection_creator_addr,
          name: collections,
          owner_addr
        }
        const res = await queryAllSnftByCollection(params)
        console.log('res', res.data)
        const { snftChips, snfts } = res.data
        
        currentCollection.children = [...snfts]
        console.warn('snftChips', snftChips)
        const chips = snftChips.filter(s => s.ownaddr.toUpperCase() == owner_addr).map(a => a.nft_address)
        const mysnfts = snfts.filter(s => s.ownaddr.toUpperCase() == owner_addr).map(a => a.nft_address)
        
        currentCollection.snfts = chips
        currentCollection.myOwnerAssets = [...chips, ...mysnfts]
        parentEle.load = 'loaded'
        showSNFTList.value = [...currentCollection.children]
        let total = 0
        currentCollection.myOwnerAssets.forEach(child => {
          const {mergelevel, mergenumber} = child
          if(mergelevel > 0) {
            total += mergenumber
          } else {
            total += 1
          }
        })
        nextTick(() => {
          item.showDetails = true
          item.myOwnerAssets && item.myOwnerAssets.length ? item.myOwnerAssets.push(...chips, ...mysnfts) : item.myOwnerAssets = [...chips, ...mysnfts]
          item.selectedStr += total
        })
        console.warn('selected ', currentCollection.snfts)
      } else {
        currentCollection.checked = false
        //TODO:  
      }

    }
    const {$toast} = useToast()

    const handleAllSelect = async ({ item, index }) => {
      let toast = null
      if (!newList.value[index].checked) {
        let myOwnerAssets = []
        try {
          toast = Toast.loading({
          duration: 0,
          forbidClick: true,
          message: t('common.loading'),
        });
        const owner_addr = accountInfo.value.address.toUpperCase()
        // get my snft/ship/ of the collection
        for await (const child of item.children) {
          const { collection_creator_addr, collections } = child
          // get collDetail
          const params = {
            createaddr: collection_creator_addr,
            name: collections,
            owner_addr
          }
          const res = await queryAllSnftByCollection(params)

          const {snftChips,snfts} = res.data
          const mychips = snftChips.filter((it: any) => it.ownaddr.toUpperCase() == owner_addr)
          const mysnfts = snfts.filter((it: any) => it.ownaddr.toUpperCase() == owner_addr)
          console.warn('get my mychips', mychips)
          console.warn('get my mysnfts', mysnfts)
          myOwnerAssets.push(...mychips,...mysnfts)
        }
        item.checked = true
        item.children.forEach(child => child.checked = true)
        console.warn('myOwnerAssets', myOwnerAssets)
        item['selectAssets'] = myOwnerAssets
        let total = 0
        myOwnerAssets.forEach(child => {
          const {mergelevel, mergenumber} = child
          if(mergelevel > 0) {
            total += mergenumber
          } else {
            total += 1
          }

        })
        item['selectedStr'] = total
        }catch(err){
          $toast.fail(JSON.stringify(err))
        }finally {
          toast.clear()
        }
      } else {
        item.checked = false
        item.children.forEach(child => child.checked = false)
        item['selectAssets'] = []
        item['selectedStr'] = 0
      }
    }

    // Classified data
    const categoryList = ref(new Map());
    // Gets a collection of specified accounts
    const getcollectionListPage = async (sendParams: any) => {

    };
    // Check SNFT of collection according to name
    const getSnfts = async (params: any) => {

    };

    const newList = ref([])
    // List loading event
    const handleOnLoad = async () => {
      loadNft.value = true;
      try {
        const { data: stages } = await getStages()

        console.warn('stages', stages)
        for await (const item of stages) {
          const { data: { snfts } } = await getCollects(item.nft_address.replace('mmm', ''))
          console.warn('snfts', snfts)
          newList.value.push({
            ...item,
            load: false,
            checked: false,
            children: [...snfts].map(child => ({ ...child, checked: false }))
          })
        }
        if (!stages || stages.length < 4) {
          finished.value = true
        }
        stagesparams.start_index = Number(stagesparams.count) + (Number(stagesparams.start_index)) + ''
        console.warn('newList', newList)
      } catch (err) {
        console.warn('err')
        nftErr.value = true;
        Toast(JSON.stringify(err));
      } finally {
        loadNft.value = false;
      }
    };
    // The list load event updates the current Snft list each time the account is switched
    eventBus.on("changeAccount", (address) => {
      // loadNft.value = true;
      // showConvert.value = false;
      // checkObjs.data = {};
      // nftErr.value = false;
      // params.start_index = "0";
      // params.currentPage = 0;
      // finished.value = false;
      // pageData.nftList = [];
      // let time = null;
      // if (time) {
      //   clearTimeout(time);
      // }
      // isChangeAccount = true;
      // params.owner_addr = address;
      // time = setTimeout(() => {
      //   isChangeAccount = false;
      //   reLoading();
      //   clearTimeout(time);
      // }, 1000);
    });
    // Selected data
    const checkObjs = reactive({ data: {} });
    const changeSelect = async (data: any) => {
      // console.warn("data", data);
      // const { address, children, MergeLevel } = data;
      // if (address && typeof address !== "undefined") {
      //   if (MergeLevel === 2) {
      //     if (children.length) {
      //       checkObjs.data[address] = [{ ...data }];
      //     } else {
      //       checkObjs.data[address] = [];
      //     }
      //     return;
      //   }
      //   checkObjs.data[address] = children;
      // }
      // let time = setTimeout(() => {
      //   console.log("selectList", selectList.value);
      //   clearTimeout(time);
      // }, 1000);
    };
    // Error, retry
    const reLoading = () => {
      // showConvert.value = false;
      // checkObjs.data = {};
      // nftErr.value = false;
      // params.start_index = "0";
      // params.currentPage = 0;
      // finished.value = false;
      // pageData.nftList = [];
      // handleOnLoad();
    };

    // Selected length
    const selectLength = computed(() => {
      // if (!pageData.nftList.length) {
      //   return 0;
      // }
      // let len = 0;
      // Object.keys(checkObjs.data).forEach((key) => {
      //   checkObjs.data[key]
      //     .filter((item) => item.select)
      //     .forEach((item: any) => {
      //       len += item.Chipcount;
      //     });
      // });
      // return len;
      return 0
    });

    // Select the amount of data
    const selectTotal = computed(() => {
      // console.warn("checkObjs.data", checkObjs.data);
      // // if (!selectLength.value) {
      // //   return 0;
      // // }
      // let add = 0;
      // const { t0, t1, t2, t3 } = store.state.configuration.setting.conversion
      // // According to the number of each collection selected, 16 all selected according to 0.225, otherwise according to 0.15 fragments 0.1
      // Object.keys(checkObjs.data).forEach((key) => {
      //   const len = checkObjs.data[key].length;
      //   if (len) {
      //     // If the collection is not full
      //     checkObjs.data[key].forEach((item: any) => {
      //       const { Chipcount, MergeLevel, MergeNumber, snfts } = item;
      //       // if(MergeLevel === 2) {
      //       //   add += new BigNumber(MergeNumber)
      //       //  .multipliedBy(0.271)
      //       //   .plus(add)
      //       //   .toNumber();
      //       // }
      //       switch (MergeLevel) {
      //         case 0:
      //           add = new BigNumber(snfts.length)
      //             .multipliedBy(t0)
      //             .plus(add)
      //             .toNumber();
      //           break;
      //         case 1:
      //           add = new BigNumber(MergeNumber)
      //             .multipliedBy(t1)
      //             .plus(add)
      //             .toNumber();
      //           break;
      //         case 2:
      //           add = new BigNumber(MergeNumber)
      //             .multipliedBy(t2)
      //             .plus(add)
      //             .toNumber();
      //           break;
      //       }
      //     });
      //   }
      // });
      // return add;
      return 0
    });
    const getDisabled = (item: any) => {
      // const {
      //   pledgestate,
      //   Chipcount,
      //   disabled,
      //   snfts,
      //   isUnfreeze,
      //   DeletedAt,
      //   MergeLevel,
      //   ownaddr
      // } = item;

      // if (MergeLevel == 0 && !snfts.length) {
      //     return "disabled";
      // }
      // if (MergeLevel > 0 && ownaddr.toUpperCase() != accountInfo.value.address.toUpperCase()) {
      //     return "disabled";
      // }
      // return "";
    };
    const selectedText = computed(() => {
      // let totalChip = 0;
      // let totalSnft = 0;
      // let totalColl = 0;
      // Object.keys(checkObjs.data).forEach((key) => {
      //   if (key && key != "undefined") {
      //     checkObjs.data[key].forEach((child) => {
      //       if (getDisabled(child) == "") {
      //         const { MergeLevel, Chipcount, pledgestate } = child;
      //         if (MergeLevel == 0 && Chipcount && pledgestate == "NoPledge") {
      //           totalChip += child.snfts.length;
      //         }
      //         if (MergeLevel == 1 && Chipcount && pledgestate == "NoPledge") {
      //           totalSnft += 1;
      //         }
      //         if (MergeLevel == 2 && Chipcount && pledgestate == "NoPledge") {
      //           totalColl += 1;
      //         }
      //       }
      //     });
      //   }
      // });
      // return `${totalColl}(L2)/${totalSnft}(L1)/${totalChip}(L0)`;
      return ''
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
      // if (!selectLength.value) {
      //   Toast(t("sendSNFT.pleasechoose"));
      //   return;
      // }
      // showNFTModal.value = true;
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

    const handleChoose = (e: any) => {
      finished.value = false;
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
      // let total = 0;
      // let am = 0;
      // const { t0, t1, t2, t3 } = store.state.configuration.setting.conversion

      // const selectAddrs = checkObjs.data;
      // Object.keys(selectAddrs).forEach((key) => {
      //   const list = selectAddrs[key];
      //   if (list && list.length) {
      //     list.forEach((item: any) => {
      //       total = total + 1;
      //       const { MergeLevel } = item;
      //       switch (MergeLevel) {
      //         case 2:
      //           am += t2;
      //           break;
      //         case 1:
      //           am += t1;
      //           break;
      //         case 0:
      //           am += t0;
      //           break;
      //       }
      //     });
      //   }
      // });
      // return parseFloat(new BigNumber(am).div(total).toFixed(5));
    });

    return {
      ratio,
      handleChoose,
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
      metaDomain,
      newList,
      handleSelect,
      handleMouseOut,
      handleMouseOver,
      showSNFTList,
      handleSNFTSMouseOver,
      handleSNFTSMouseLeave,
      showSNFTIdx,
      handleAllSelect
    };
  },
});
</script>
<style src="./index.scss" lang="scss" scoped></style>