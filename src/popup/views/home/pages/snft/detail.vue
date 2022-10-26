<template>
  <NavHeader :hasRight="true" :title="t('nftDetail.title')"></NavHeader>

  <div class="snft-detail">
    <div class="flex between mt-14 snft-list pl-22 pr-22">
      <div
        :class="`img-box flex center van-hairline--surround hover   flex center ${
          item.select ? 'active' : ''
        }`"
        v-for="(item, idx) in pageData.children"
        :key="item.address"
        @click="hancleClick(item, idx)"
      >
        <img
          :src="`${metaDomain}${item.source_url}`"
          :class="`flex center ${item.select ? 'active' : ''}`"
          fit="cover"
        />
      </div>
    </div>
    <div class="swipe-box">
      <i class="iconfont icon-fangda hover" @click="showImg"></i>
      <van-icon name="arrow-left hover" @click="to('prev')" />
      <van-swipe
        @change="onChange"
        ref="swipe"
        lazy-render
        :initial-swipe="swiperIdx"
      >
        <van-swipe-item
          class="flex center position relative swipe-slider"
          v-for="item in pageData.children"
          :key="item"
        >
          <div class="swipe-img mt-10 position relative">
            <img
              :class=" imgGary
                  ? 'gray'
                  : ''
              "
              :src="`${metaDomain}${item.source_url}`"
              alt
            />
            <!-- Transfer -->
            <div
              class="check-list flex"
              v-show="chooseSnftData.Chipcount && actionType == '2'"
            >
              <div
                :class="`fg van-hairline--right van-hairline--bottom ${disabled(
                  item
                )} ${item.select ? 'select' : ''}`"
                v-for="(item, idx) in mySnfts"
                :key="item"
                @click.stop="selectSnft(item, idx)"
              ></div>
            </div>
            <!-- Staking -->
            <div
              :class="`staking-mask ${chooseSnftData.selectFlag ? 'selected' : ''}`"
              @click.stop="selectSingleSnft"
              v-show="actionType == '1' || actionType == '3'"
            ></div>
            <!-- lock -->
            <div class="lock-img-box" v-if="actionType === '1' && !canRedeem && disabled(item) == ''">
              <div class="flex center">
                <svg t="1666159609780" class="lock-img" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3307" width="200" height="200"><path d="M785.07008 409.6H716.8V273.07008C716.8 178.80064 640.39936 102.4 546.12992 102.4h-68.25984C383.60064 102.4 307.2 178.80064 307.2 273.07008V409.6h-68.27008c-37.5296 0-68.25984 30.74048-68.25984 68.27008v375.47008c0 37.5296 30.73024 68.25984 68.25984 68.25984h546.14016c37.5296 0 68.25984-30.73024 68.25984-68.25984V477.87008c0-37.5296-30.73024-68.27008-68.25984-68.27008zM546.12992 673.19808v111.872h-68.25984V673.19808c-20.33664-11.79648-34.14016-33.59744-34.14016-58.79808 0-37.66272 30.5664-68.25984 68.27008-68.25984s68.27008 30.59712 68.27008 68.25984c0 25.20064-13.80352 47.0016-34.14016 58.79808z m102.4-263.59808H375.47008V273.07008c0-56.53504 45.86496-102.4 102.4-102.4h68.25984c56.53504 0 102.4 45.86496 102.4 102.4V409.6z" p-id="3308" fill="rgba(255,255,255,.7)"></path></svg>
              </div>
            </div>
          </div>
        </van-swipe-item>
      </van-swipe>
      <van-icon name="arrow hover" @click="to('next')" />
    </div>
    <!-- Selected -->
    <div class="select-box">
      {{ t("sendSNFT.selected") }} {{ chooseNum }}/{{ hasChooseNum }}
    </div>
    <!-- 3.speed of progress -->
    <div class="progress-box pl-10 pr-10 mt-10">
      <ProgressBar
        :value="chooseSnftData.Chipcount"
        :own="hasChooseNum"
        :total="16"
        :ratio="ratio"
        :maxRadio="0.143"
      />
    </div>
    <!-- snft- info -->
    <div class="snft-form van-hairline--surround m-14">
      <div class="card van-hairline--bottom">
        <div class="name">{{ t("sendSNFT.name") }}</div>
        <div class="value">{{ chooseSnftData.name }}</div>
      </div>
      <div class="card van-hairline--bottom mt-8">
        <div class="name">{{ t("sendSNFT.amount") }}</div>
        <div class="value">
          <span>{{ totalAmount }}ERB</span>
          <span class="usd">≈$ {{ toUsd(totalAmount, 2) }}</span>
        </div>
      </div>
      <div class="card mt-8 card-last">
        <div class="name">{{ t("sendSNFT.address") }}</div>
        <div class="value">{{ chooseSnftData.nft_address.substr(0, 41) }}</div>
      </div>
    </div>
    <!-- Button group -->
    <div class="flex center">
      <div class="btn-box flex evenly">
        <div
          :class="`btn ${!canRedeem && actionType == '1' ? 'disabled' : ''}`"
          @click="toSend"
          v-if="showSendBtn"
        >
          <div class="flex center">
            <div class="icon-in flex center">
              <i class="iconfont icon-teshujiantouzuoxiantiao-copy"></i>
            </div>
          </div>
          <div class="btn-txt text-center">{{ t("sendSNFT.send") }}</div>
        </div>
        <div
          :class="`btn`"
          @click="handleConvert"
          v-if="showConvertBtn"
        >
          <div class="flex center">
            <div class="icon-in flex center">
              <i class="iconfont icon-icon-"></i>
            </div>
          </div>
          <div class="btn-txt text-center">{{ t("sendSNFT.convert") }}</div>
        </div>
        <div
          class="btn"
          @click="handleStaking"
          v-if="showStakingBtn"
        >
          <div class="flex center">
            <div class="icon-in flex center">
              <i class="iconfont icon-044chuizi"></i>
            </div>
          </div>
          <div class="btn-txt text-center">{{ t("createExchange.stake") }}</div>
        </div>
        <div
          :class="`btn ${!canRedeem ? 'disabled' : ''}`"
          @click="handleReStaking"
          v-if="showReStakingBtn"
        >
          <div class="flex center">
            <div class="icon-in flex center">
              <i class="iconfont icon-key"></i>
            </div>
          </div>
          <div class="btn-txt text-center">
            {{ t("createExchange.redemption") }}
          </div>
        </div>

        <div class="btn disabled">
          <div class="flex center">
            <div class="icon-in flex center">
              <i class="iconfont icon-wendang"></i>
            </div>
          </div>
          <div class="btn-txt text-center">{{ t("sendSNFT.more") }}</div>
        </div>
      </div>
    </div>
  </div>
  <!-- Transfer Erb -->
  <TransferNFTModal
    :selectNumber="chooseNum"
    :selectName="chooseName"
    :selectAddress="chooseAddress"
    :selectTotal="totalAmount"
    :selectList="selectList"
    txtype="2"
    type="1"
    v-model="showModal"
    @success="reLoading"
    @fail="reLoading"
  />
  <TransferSingleSNFTModal
    :txtype="actionType"
    :selectNumber="1"
    :selectTotal="stakingTotalAmount"
    :selectList="selectStakingList"
    v-model="showStakingModal"
    @success="handleSuccess"
  />
</template>
<script lang="ts">
import {
  Image,
  Swipe,
  SwipeItem,
  Icon,
  SwipeInstance,
  Toast,
  ImagePreview,
  Sticky,
} from "vant";
import {
  computed,
  defineComponent,
  onActivated,
  onMounted,
  Ref,
  ref,
} from "vue";
import ProgressBar from "@/popup/views/account/components/snftList/progressBar.vue";
import { useRouter, useRoute } from "vue-router";
import TransferNFTModal from "@/popup/views/home/components/transferNFTModal.vue";
import { snftGroup, QuerySnftChip } from "@/popup/http/modules/nft";
import { getWallet } from "@/popup/store/modules/account";
import { useStore } from "vuex";
import { addressMask, snftToErb, toUsd } from "@/popup/utils/filters";
import BigNumber from "bignumber.js";
import NavHeader from "@/popup/components/navHeader/index.vue";
import { useI18n } from "vue-i18n";
import { VUE_APP_METAURL } from "@/popup/enum/env";
import TransferSingleSNFTModal from "@/popup/views/home/components/transferSingleSNFTModal.vue";
import { fa } from 'element-plus/es/locale';
import { show } from "@/popup/components/navHeader/hooks/slider";
const disabledChip = {
  address: null,
  select: false,
  index: null,
  ownaddr: null,
  Chipcount: 0,
  MergeLevel: 0,
  disabled: true,
};

export default {
  name: "snft-detail",
  components: {
    [Image.name]: Image,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
    [Sticky.name]: Sticky,
    [Icon.name]: Icon,
    ProgressBar,
    TransferNFTModal,
    NavHeader,
    TransferSingleSNFTModal,
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const route = useRoute();
    const { state } = useStore();
    const swipe: Ref = ref(null);
    const pageData = ref(JSON.parse(sessionStorage.getItem("compData")));
    console.warn("pagedata", pageData.value);
    const { query } = route;
    const { nft_address } = query;
    //Query the subscript of the swiper according to the address
    const idx = pageData.value.children.findIndex(
      (item: any) =>
        item.nft_address.toUpperCase() == nft_address?.toString().toUpperCase()
    );

    const actionType = computed(
      () => pageData.value.children[0].actionType || "1"
    );
    const swiperIdx = ref(idx || 0);
    pageData.value.children.forEach((item) => (item.select = false));
    pageData.value.children[idx].select = true;
    const metaDomain = ref(`${VUE_APP_METAURL}`);
    const accountInfo = computed(() => state.account.accountInfo);
    // Currently selected snft fragments
    let selectList = computed(() => {
      return mySnfts.value.filter((item) => item.select);
    });
    const mySnfts = ref([]);

    // Query NFT fragment details
    const getNft256 = (params = {}) => {
      Toast.loading({ message: t("sendSNFT.loading") });
      const allList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
      return QuerySnftChip(params)
        .then(({ data }) => {
          const address = accountInfo.value.address;
          const currentData = pageData.value.children[swiperIdx.value];
          data.forEach((item: any) => {
            const { nft_address } = item;
            item.select = false;
            item.address = nft_address;
            item.index = parseInt(
              nft_address.substr(nft_address.length - 1, 1),
              16
            );
            if (
              getDisabled(currentData) == "" &&
              item.ownaddr.toUpperCase() == address.toUpperCase()
            ) {
              item.disabled = false;
            } else {
              item.disabled = true;
            }
            // if (item.ownaddr.toUpperCase() == address.toUpperCase()) {
            //   item.disabled = false
            // } else {
            //   item.disabled = true
            // }
          });
          let data3 = [];
          if (!data.length) {
            allList.forEach((sun: any) => {
              data3.push(disabledChip);
            });
          }

          if (data.length < 16 && data.length > 0) {
            const data2 = data.map((item: any) => item.index);
            const filterList = allList.filter((sun2) => !data2.includes(sun2));
            allList.forEach((sun: any, idx: number) => {
              if (filterList.includes(idx)) {
                data.splice(idx, 0, disabledChip);
              }
            });
          }

          debugger;
          mySnfts.value = [...data, ...data3];
          console.warn("mySnfts.value", mySnfts.value);
        })
        .catch((err) => {
          mySnfts.value = [];
        })
        .finally(() => {
          Toast.clear();
        });
    };
    const canRedeem = ref(false)
    const getAddressInfo = async(address) => {
      canRedeem.value = false
      const wallet = await getWallet()
      const blockNumber = await wallet.provider.getBlockNumber()
      const res = await wallet.provider.send('eth_getAccountInfo', [address, "latest"])
      const { NFTPledgedBlockNumber } = res
      if(NFTPledgedBlockNumber && (blockNumber - NFTPledgedBlockNumber) > 6307200) {
        // You can redeem
        canRedeem.value = true
      }
      console.warn('res', res,blockNumber)
    }
    const { nft_token_id, nft_contract_addr } = route.query;
    // First query
    const params = {
      nft_contract_addr,
      nft_token_id,
      start_index: "0",
      count: "16",
    };
    getNft256(params);
    getAddressInfo(pageData.value.children[0].nft_address)
    const hancleClick = (e, i) => {
      console.log(e, i);
      swipe.value?.swipeTo(i);
    };
    // change
    const onChange = (e) => {
      console.log(e);
      pageData.value.children.forEach((item:any) => item.selectFlag = false)
      swiperIdx.value = e;
      pageData.value.children.forEach((item) => (item.select = false));
      pageData.value.children[e].select = true;
      // Query 256nft fragment information according to the current ID
      const { nft_contract_addr, nft_token_id } = pageData.value.children[e];
      const params = {
        nft_contract_addr,
        nft_token_id,
        start_index: "0",
        count: "16",
      };
      getNft256(params);
      if(actionType.value == '1') {
        const snftAddress = pageData.value.children[e].nft_address
        getAddressInfo(snftAddress)
      }
    };

    
    const showImg = () => {
      const idx = pageData.value.children.findIndex((item) => item.select);
      const arr2 = pageData.value.children.map(
        (item) => metaDomain.value + item.source_url
      );
      ImagePreview({
        images: [...arr2],
        startPosition: idx,
        closeable: true,
        showIndicators: true,
      });
    };
    const hasDisabled = computed(() => {
      return chooseSnftData.value.disabled ? true : false;
    });

    const showConvertBtn =  computed(() => {
      let flag = false
      switch(actionType.value){
        case '1':
        flag = false
          break;
        case '2':
        flag = chooseSnftData.value.snfts.length ? true : false
          break;
        case '3':
        flag = false
          break;
      }
      return flag
    })
    const showSendBtn =  computed(() => {
      let flag = false
      switch(actionType.value){
        case '1':
        flag = !hasDisabled.value
          break;
        case '2':
        flag = chooseSnftData.value.snfts.length ? true : false
          break;
        case '3':
        flag = !hasDisabled.value
          break;
      }
      return flag 
    })
    const showStakingBtn =  computed(() => {
      let flag = false
      switch(actionType.value){
        case '1':
        flag = false
          break;
        case '2':
        flag = false
          break;
        case '3':
        flag = !hasDisabled.value
          break;
      }
      return flag
    })
    const showReStakingBtn = computed(() => {
      let flag = false
      switch(actionType.value){
        case '1':
        flag = !hasDisabled.value
          break;
        case '2':
        flag = false
          break;
        case '3':
        flag = false
          break;
      }
      return flag
    })
    
    const imgGary =  computed(() => {
      let flag = ''

      switch(actionType.value){
        case '1':
          !showReStakingBtn.value ? flag = 'gary' : ''
          break;
        case '2':
         !chooseSnftData.value.snfts.length ? flag = 'gary' : ''
          break;
        case '3':
         !showStakingBtn.value ? flag = 'gary' : ''
          break;
      }
      return flag
    })
    const getDisabled = (item: any) => {
      const { pledgestate, Chipcount, disabled } = item;
      const status = actionType.value;
      if (status == "3") {
        return disabled ? "disabled" : "";
      }
      if (status == "2") {
        if (pledgestate == "Pledge" || !Chipcount) {
          return "disabled";
        }
      }
      if (status == "1") {
        if (pledgestate == "Pledge" && Chipcount != 16) {
          return "disabled";
        }
        if (pledgestate == "NoPledge") {
          return "disabled";
        }
      }
      return "";
    };
    const disabled = (v) => {
      return v.disabled ? "disabled" : "";
    };

    const toSend = () => {
      if(actionType.value == '1' && !canRedeem.value) return
      if (actionType.value == "2") {
        if (!chooseNum.value) {
          Toast(t("sendSNFT.pleaseselect"));
          return;
        }
        if (selectList.value.length == 16) {
          const address = selectList.value[0].address.substr(0, 40);
          sessionStorage.setItem("sendSnftList", JSON.stringify([{ address }]));
                // Determine whether there are selected snft fragments
      router.push({ name: "sendSnft-step2" });
        } else {
          sessionStorage.setItem(
            "sendSnftList",
            JSON.stringify(selectList.value)
          );
                // Determine whether there are selected snft fragments
      router.push({ name: "sendSnft-step2" });
        }
      } else {
        
        const data = chooseSnftData.value; 
        console.log("data-----------------", data);
        const { MergeLevel, snfts, pledgestate, nft_address,selectFlag } = data;
        if(selectFlag) {
          sessionStorage.setItem(
          "sendSnftList",
          JSON.stringify([{ address: nft_address.substr(0, 41) }])

        );
              // Determine whether there are selected snft fragments
      router.push({ name: "sendSnft-step2" });
        } else {
          Toast(t("sendSNFT.notselected"));
          return
        }

      }


    };

    // Select snft event
    const selectSnft = (v, idx) => {
      console.log("start:", v, idx, mySnfts.value[idx].select);
      console.log(v.select);
      if (v.disabled) {
        return;
      }
      mySnfts.value[idx].select = !v.select;
    };

    // Exchange pop-up event
    const handleConvert = () => {
      if (!chooseNum.value) {
        Toast(t("sendSNFT.notselected"));
        return;
      }
      showModal.value = true;
    };

    // Event of successful redemption
    const reLoading = () => {
      onChange(swiperIdx.value);
    };
    // Optional quantity
    const hasChooseNum = computed(() => {
      return mySnfts.value.filter((item) => !item.disabled).length;
    });

    // Amount of data currently selected
    const chooseNum = computed(() => {
      return mySnfts.value.filter((item) => item.select).length;
    });
    // Currently selected fragment name
    const chooseName = computed(() => {
      return chooseSnftData.value.name;
    });
    // Currently selected fragment address
    const chooseAddress = computed(() => {
      return chooseSnftData.value.address;
    });
    // Currently selected snft
    const chooseSnftData = computed(
      () => pageData.value.children[swiperIdx.value]
    );
    const showModal = ref(false);

    // Total amount
    const totalAmount = computed(() => {
      if((showReStakingBtn.value || showStakingBtn.value)&& chooseSnftData.value.selectFlag){
        const data = chooseSnftData.value;
      const { MergeLevel, snfts, pledgestate,selectFlag } = data;
       return parseFloat(
          new BigNumber(snfts.length).multipliedBy(0.143).toFixed(6)
        );
      }
      if (!selectList.value.length) {
        return 0;
      }

     

      // If 256 direct incoming aggregate addresses are selected
      if (selectList.value.length == 16) {
        const erb = snftToErb(selectList.value[0].nft_address.substr(0, 40));
        return parseFloat(
          new BigNumber(chooseNum.value).multipliedBy(erb).toFixed(5)
        );
      }
      // Fragment address
      return parseFloat(
        new BigNumber(chooseNum.value)
          .multipliedBy(snftToErb(selectList.value[0].nft_address))
          .toFixed(5)
      );
    });

    const to = (type: string) => {
      if (type == "next") {
        swipe.value?.next();
      }
      if (type == "prev") {      
        swipe.value?.prev();
      }
    };

    // Exchange rate by selected quantity 256 by single snft
    const ratio = computed(() => {
      return 0.095;
    });

    const selectStakingList = ref([]);
    const showStakingModal = ref(false);
    const stakingTotalAmount = ref(0);
    const handleStaking = () => {
      // Check whether the SNFT is in the pledgeable state
      const data = chooseSnftData.value;
      console.log("data-----------------", data);
      const { MergeLevel, snfts, pledgestate,selectFlag } = data;
      if (selectFlag) {
        selectStakingList.value.push(data);
        stakingTotalAmount.value = parseFloat(
          new BigNumber(snfts.length).multipliedBy(0.143).toFixed(6)
        );
        showStakingModal.value = true;
      } else {
        Toast(t("sendSNFT.notselected"));
        return;
      }
    };

    const handleReStaking = () => {
      if(!canRedeem.value) return
      // Check whether the current SNFT is callable
      const { MergeLevel, snfts, pledgestate ,selectFlag} = chooseSnftData.value
      if (selectFlag) {
        selectStakingList.value.push(chooseSnftData.value);
        stakingTotalAmount.value = parseFloat(
          new BigNumber(snfts.length).multipliedBy(0.143).toFixed(6)
        );
        // stakingTotalAmount.value = new BigNumber(snfts.length).multipliedBy(0.143).toFixed(6)
        showStakingModal.value = true;
      } else {
        Toast(t("sendSNFT.notselected"));
      }
    };

    const handleSuccess = () => {
      router.replace({ name: "wallet" });
    };
    // select single SNFT
    const selectSingleSnft = () => {
      if(!chooseSnftData.value.disabled) {
        chooseSnftData.value.selectFlag = !chooseSnftData.value.selectFlag
      }
    }
   
    return {
      handleReStaking,
      selectSingleSnft,
      imgGary,
      canRedeem,
      showConvertBtn,
      showStakingBtn,
      showReStakingBtn,
      showSendBtn,
      hasDisabled,
      handleStaking,
      handleSuccess,
      showStakingModal,
      selectStakingList,
      stakingTotalAmount,
      t,
      to,
      hancleClick,
      selectSnft,
      actionType,
      totalAmount,
      reLoading,
      onChange,
      addressMask,
      swipe,
      chooseNum,
      chooseName,
      chooseAddress,
      showImg,
      disabled,
      toSend,
      showModal,
      pageData,
      metaDomain,
      swiperIdx,
      mySnfts,
      toUsd,
      hasChooseNum,
      chooseSnftData,
      selectList,
      handleConvert,
      ratio,
    };
  },
};
</script>
<style lang="scss" scoped>
:deep(.progress-bar) {
  background: none;
}
.lock-img-box {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  &>div {
    width: 100%;
    height: 100%;
  }
  .lock-img {
    width: 80px;
  }
}
.snft-detail {
  width: 375px;
  margin: 0 auto;
  .snft-list {
    flex-wrap: wrap;

    .img-box {
      width: 38px;
      height: 38px;
      margin-bottom: 5px;
      padding: 1px;
      &::after {
        border-color: #fff;
        border-radius: 12px;
        display: none;
      }
      &.active {
        border: 1px solid #037cd6;
        border-radius: 7px;

        &::after {
          border-color: #037cd6;
        }
      }
      img {
        width: 34px;
        height: 34px;
        border-radius: 5px;
        // overflow: hidden;
        //   height: 34px;
        background: #e9eff4;
        object-fit: cover;
        display: flex;
        justify-content: center;
        align-items: center;

        :deep(img) {
          width: 33px;
          height: 33px;
          border-radius: 5px;
        }
        .van-image__error {
          &::before {
            background: rebeccapurple;
          }
        }
      }
    }
  }
  .swipe-box {
    position: relative;
    i {
      color: #037cd6;
      font-size: 18px;
      position: absolute;
      top: 120px;
      z-index: 10;
    }
    .van-icon-arrow {
      right: 21px;
    }
    .van-icon-arrow-left {
      left: 21px;
    }
    .icon-fangda {
      top: 10px;
      right: 22px;
      font-size: 16px;
      color: #b3b3b3;
    }
  }
  .swipe-img {
    border-radius: 8px;
    overflow: hidden;
    img {
      width: 256px;
      height: 256px;
      display: block;
      background: #f1f2f3;
      object-fit: cover;
    }
  }
  :deep(.van-swipe__indicators) {
    display: none;
  }
  .select-box {
    width: 255px;
    height: 25px;
    margin: 25px auto 0;
    background: #e9f5fe;
    font-size: 12px;
    text-align: center;
    line-height: 25px;
    border-radius: 12.5px;
  }
  .snft-form {
    // height: 156px;
    padding: 15px;
    border-radius: 5px;
    &::after {
      border-color: #e4e7e8;
      border-radius: 5px;
    }
    .card {
      font-size: 12px;
      padding-bottom: 10px;
      .name,
      .value {
        line-height: 14px;
        height: 14px;
        .usd {
          transform: translateY(1px) scale(0.8);

          line-height: 10px;
          display: inline-block;
        }
      }
      .name {
        color: #9a9a9a;
        line-height: 16px;
        height: 16px;
      }
    }
    .card-last {
      padding-bottom: 0;
    }
  }  .btn-box {
    width: 170px;
    padding-bottom: 30px;

    .btn {
      cursor: pointer;
      &.disabled {
        .icon-in {
          background: #bbbbbb;
        }
        .btn-txt {
          color: #bbbbbb;
        }
      }
      .icon-in {
        background: #037cd6;
        width: 35px;
        border-radius: 50%;
        height: 35px;
        text-align: center;
        i {
          font-size: 16px;
          color: #fff;
        }
        .icon-icon- {
          font-size: 22px;
        }
        .icon-wendang {
          font-size: 20px;
        }
      }
      &-txt {
        font-size: 12px;
        line-height: 16px;
        font-weight: bold;
        color: #037cd6;
        margin-top: 2px;
      }
    }
  }
  .check-list {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    flex-wrap: wrap;
    .fg {
      width: 64px;
      height: 64px;
      cursor: pointer;
      &::after {
        border-color: #fff;
      }
      &.disabled {
        background: rgba($color: #dbdddd, $alpha: 0.1);
        backdrop-filter: saturate(80%) blur(0px);
        filter: grayscale(100%);
        // background-image: linear-gradient(135deg,#f5f7fa,#c3cfe2);
        // opacity: 0.5;
        cursor: no-drop;
      }
      &.select {
        background: rgba($color: #037cd6, $alpha: 0.6);
        &::after {
          border-bottom-width: 0;
          border-right-width: 0;
        }
      }
    }
  }
  
  .staking-mask {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      &.selected {
        background: rgba($color: #037cd6, $alpha: 0.6);
      }
    }
}
</style>