<template>
    <NavHeader backUrl="wallet" :title="t('sendSNFT.collTit')" :hasRight="false"></NavHeader>
  <div id="tabBox">
    <van-tabs v-model:active="active" sticky :offset-top="48" @change="changeTab">
      <van-tab v-for="(item, idx) in categoryList" :key="item.value" :title="item.text">
        <div class="snft-list-con" v-if="item.collList.length">
          <van-tabs
            :ref="`active2Tab${idx}`"
            :class="`coll-icon-tabs ${
              item.collTabList.length - 1 == active2 ? 'coll-list' : ''
            }`"
            v-model="active2"
            sticky
            swipeable
            :offset-top="97"
            @change="changeTa2"
          >
            <van-tab v-for="(child, idx) in item.collTabList" :key="child.name">
              <template #title v-if="!child.type">
                <span class="icon-num">{{ idx + 1 }}</span>
                <van-image :src="`${metaDomain}/${child.img}`" fit="cover"></van-image>
              </template>
              <template #title v-else>
                <div class="flex center ddd" style="height:100%;">
                  <i class="iconfont icon-gengduo1"></i>
                </div>
              </template>
              <div class="coll-content-list mt-24" v-if="!child.type">
                <div v-if="child.snfts" class="flex between list-box">
                  <div
                    class="snft-card van-hairline--surround hover"
                    v-for="sun in child.snfts"
                    type="list"
                    @click="handleDetail(child, sun.nft_address, sun.id,sun)"
                    :key="sun.nft_address"
                  >
                    <div class="flex center">
                      <van-image :src="`${metaDomain}${sun.source_url}`" width="100%" fit="cover"></van-image>
                    </div>
                    <div class="name lh-16">{{ sun.name }}</div>
                    <div class="address lh-16">{{ addressMask(sun.nft_address) }}</div>
                  </div>
                </div>
                <no-data v-else />
              </div>
              <van-list v-else v-model:loading="loading" :finished="finished" @load="handleOnLoad" v-model:error="error">
                <div class="flex between coll-card" v-for="(abc, idx) in item.collList" :key="abc.name" @click="handleCollModal(abc, idx)">
                  <div class="flex">
                    <div class="coll-img">
                      <span class="icon-num van-hairline--surround">
                        {{
                        idx + 1
                        }}
                      </span>
                      <van-image :src="`${metaDomain}/${abc.img}`" fit="cover"></van-image>
                    </div>
                    <div class="flex center">
                      <div class="name-info flex between column ml-10">
                        <div class="name">{{ abc.name }}</div>
                        <div class="hold-num">{{ abc.total_hold }}/256</div>
                      </div>
                    </div>
                  </div>
                  <div class="flex right center-v">
                    <div class="coll-amount">
                      <div class="text-right num lh-16">{{ calcERBNum(abc.total_hold) }} ERB</div>
                    </div>
                  </div>
                </div>
              </van-list>
            </van-tab>
          </van-tabs>
        </div>
        <no-data v-else />
      </van-tab>
    </van-tabs>
  </div>

  <!-- snft Modal -->
  <NftsModal v-model="modalSnft" :data="collModalData" />
</template>
<script lang="ts">
import { computed, defineComponent, getCurrentInstance, onActivated, onMounted, ref } from 'vue'
import { Tabs, Tab, Image, Sticky, Toast, Empty, Icon, List } from 'vant'
import NavHeader from '@/popup/components/navHeader/index.vue'
import { queryOwnerSnftCollections, querySnftByCollection, queryOwnerSnftChipAmount } from '@/popup/http/modules/nft'
import NftsModal from '@/popup/views/home/components/nftsModal.vue'
import SnftCard from '@/popup/views/account/components/snftList/snftCard.vue'
import { useStore } from 'vuex'
import { addressMask } from '@/popup/utils/filters'
import { useRouter } from 'vue-router'
import BigNumber from 'bignumber.js'
import { useI18n } from 'vue-i18n'
import { VUE_APP_METAURL } from '@/popup/enum/env'

export default {
  name: 'page-coll-list',
  components: {
    [Tabs.name]: Tabs,
    [Tab.name]: Tab,
    [Image.name]: Image,
    [Empty.name]: Empty,
    [Icon.name]: Icon,
    [List.name]: List,
    SnftCard,
    NavHeader,
    [Sticky.name]: Sticky,
    NftsModal
  },
  setup() {
    const router = useRouter()
    const active = ref(0)
    const active2 = ref(0)
    const { state } = useStore()
    const active2Tab = ref(null)
    const { t } = useI18n()
    const categoryList: any = ref([
      {
        text: t('snftclassificationcategory.art'),
        value: 'Art',
        collList: [],
        collTabList: [],
        start_index: '0',
        last_len: 0
      },
      {
        text: t('snftclassificationcategory.music'),
        value: 'Music',
        collList: [],
        collTabList: [],

        start_index: '0',
        last_len: 0
      },
      {
        text: t('snftclassificationcategory.domainNames'),
        value: 'Domain_Names',
        collList: [],
        collTabList: [],

        start_index: '0',
        last_len: 0
      },
      {
        text: t('snftclassificationcategory.virtualWorlds'),
        value: 'Virtual_Worlds',
        collList: [],
        collTabList: [],

        start_index: '0',
        last_len: 0
      },
      {
        text: t('snftclassificationcategory.tradingCards'),
        value: 'Trading_Cards',
        collList: [],
        collTabList: [],

        start_index: '0',
        last_len: 0
      },
      {
        text: t('snftclassificationcategory.collectibles'),
        value: 'Collectibles',
        collList: [],
        collTabList: [],

        start_index: '0',
        last_len: 0
      },
      {
        text: t('snftclassificationcategory.sports'),
        value: 'Sports',
        collList: [],
        collTabList: [],

        start_index: '0',
        last_len: 0
      },
      {
        text: t('snftclassificationcategory.utility'),
        value: 'Utility',
        collList: [],
        collTabList: [],

        start_index: '0',
        last_len: 0
      }
    ])
    const accountInfo = computed(() => state.account.accountInfo)
    // Current component instance
    let currentInstance: any = null
    onMounted(() => {
      currentInstance = getCurrentInstance()
    })
    // Parameters of a join set
    const params = {
      owner_addr: accountInfo.value.address,
      categories: '',
      count: '10'
    }
    // Check the parameters of snft
    const params2 = {
      createaddr: '',
      name: '',
      start_index: '1',
      owner_addr: accountInfo.value.address,
      count: '16'
    }

    // According to the classification and search set
    const getCollList = async (params: any) => {
      if (active2.value < 10) {
        Toast.loading({
          message: 'loading...'
        })
      }

      try {
        const { data } = await queryOwnerSnftCollections(params)
        if (data.length) {
          data.forEach((item: any) => (item.total_hold = item.chipcount))
          categoryList.value[active.value].collList.push(...data)
          // First load into colltablist
          const tabLen = categoryList.value[active.value].collTabList.length
          if (!tabLen) {
            categoryList.value[active.value].collTabList.push(...data)
            if (data.length == 10) {
              categoryList.value[active.value].collTabList.push({
                type: 'More'
              })
            }
          }
          categoryList.value[active.value].last_len = data.length
          console.warn(categoryList.value, active.value)
        }
        return data
      } catch (err) {
        console.error(err)
      } finally {
        if (active2.value < 10) {
          Toast.clear()
        }
      }
    }

    // Snft based on name lookup set
    const getSnfts = async (params: any) => {
      Toast.loading({
        message: 'loading...'
      })
      try {
        const { data }: any = await querySnftByCollection(params)
        data.forEach((item: any) => {
          item.address = item.nft_address
          item.select = false
          item.id = item.nft_address.substr(39)
          item.children = item.snft
        })
        categoryList.value[active.value].collList[active2.value].snfts = data
        categoryList.value[active.value].collTabList[active2.value].snfts = data

        console.warn('snft list', categoryList.value)
        return data
      } catch (err) {
        console.error(err)
      } finally {
        Toast.clear()
      }
    }
    onMounted(async () => {
      const newOpt = {
        ...params,
        categories: categoryList.value[0].value,
        start_index: categoryList.value[0].start_index
      }
      await getCollList(newOpt)
      const currentSelect: any = categoryList.value[active.value].collList[active2.value]
      params2.name = currentSelect.name
      params2.createaddr = currentSelect.collection_creator_addr
      await getSnfts(params2)
    })
    
    const metaDomain = ref(`${VUE_APP_METAURL}`)
    // Outer tab switching
    const changeTab = async (i: any) => {
      console.log(i, active2Tab.value)
      active.value = i
      active2.value = 0
      // If the collist length of the current classification is 0, the current collection list is requested
      const currentSelectColl: any = categoryList.value[active.value].collList
      if (!currentSelectColl.length) {
        params.categories = categoryList.value[active.value].value
        try {
          const { start_index, value } = categoryList.value[active.value]
          const newOpt = {
            ...params,
            categories: value,
            start_index: '1'
          }
          await getCollList(newOpt)
        } catch (err) {
          Toast(JSON.stringify(err))
        }
      }

      changeTa2(0)

      // Each time the first layer is scrolled, the second layer is reset to 0

      // @ts-ignore
      if (currentInstance.ctx.$refs && currentInstance.ctx.$refs[`active2Tab${i}`]) {
        const currentRef = currentInstance.ctx.$refs[`active2Tab${i}`]
        console.log('currentRef.ctx', currentRef)

        if (currentRef) {
          currentRef[0].scrollTo(0)
        }
      }
    }
    // Inner tab switching
    const changeTa2 = async (i: any) => {
      console.log(i)
      active2.value = i
      if (i == 10) {
        return
      }
      console.log(i, active2.value)
      const collList: any = categoryList.value[active.value].collList
      if (collList.length && (!collList[active2.value].snfts || !collList[active2.value].snfts.length)) {
        params2.name = collList[active2.value].name
        params2.createaddr = collList[active2.value].collection_creator_addr
        getSnfts(params2)
      }

    }

    // Snft Popup
    const modalSnft = ref(false)
    const collModalData = ref({})
    const handleCollModal = async (data: any, idx: number) => {
      console.log('dategory', categoryList.value)
      console.log('data', data)
      const { snfts, name, collection_creator_addr } = data
      // No collection to query collection
      if (!snfts || !snfts.length) {
        const params = {
          name,
          createaddr: collection_creator_addr,
          start_index: '1',
          count: '16'
        }
        try {
          Toast.loading({ message: 'loading...' })
          const { data: newData }: any = await querySnftByCollection(params)
          console.warn('get adata.', data)
          newData.forEach((item: any) => {
            item.address = item.nft_address
            item.select = false
            item.id = item.nft_address.substr(39)
            item.children = item.snft
          })
          data.snfts = newData
        } catch (err) {
          console.error(err)
        } finally {
          Toast.clear()
        }
      }
      collModalData.value = data
      modalSnft.value = true
    }

    // Jump to snft details
    const handleDetail = (data: any, address: string, id: string, sun) => {
      // Reassemble the data to keep consistent with the first page
      data.meta_url = data.img
      const { snfts } = data

      data.FullNFTs = snfts
      const params = {
        children: snfts,
        total_hold: 29,
        address: ''
      }
      sessionStorage.setItem('compData', JSON.stringify({ ...data, ...params }))
      // Jump to details page
      router.push({ name: 'coll-detail', query: sun })
    }

    // Load collection
    const loading = ref(false)
    const finished = ref(false)
    const error = ref(false)
    const handleOnLoad = async () => {
      const { start_index, value } = categoryList.value[active.value]
      const currentPage = Number(start_index) + 1
      const newOpt = {
        ...params,
        categories: value,
        start_index: currentPage * 10 + ''
      }
      try {
        const list = await getCollList(newOpt)
        if (!list.length) {
          finished.value = true
        }
        categoryList.value[active.value].start_index = currentPage
      } catch (err) {
        Toast(JSON.stringify(err))
      } finally {
        loading.value = false
      }
    }

    // Calculate the total number of ERBS based on the number of fragments held
    const calcERBNum = (total_hold: any) => {
      return new BigNumber(total_hold).multipliedBy(0.1).toNumber()
    }
    return {
      t,
      calcERBNum,
      categoryList,
      active,
      active2,
      changeTa2,
      metaDomain,
      changeTab,
      active2Tab,
      addressMask,
      modalSnft,
      handleCollModal,
      collModalData,
      handleDetail,
      handleOnLoad,
      loading,
      error,
      finished
    }
  }
}
</script>
<style lang="scss" scoped>
.ddd i {
  font-size: 36px;
}
#tabBox {
  width: 375px;
  margin: 0 auto;
}
:deep(.van-tabs__line) {
  display: none;
}
:deep(.van-tab) {
  line-height: 19px;
  height: 19px;
  width: 80px;
  padding: 0 5px;
  border-radius: 9.5px;
  border: 1PX solid #9F54BA;
  margin-right: 12.5px;
  flex: none;
  color: #9F54BA;
  span {
    font-size: 12px;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

:deep(.van-tab--active) {
  background: #9F54BA;
  color: #fff;
}
:deep(.van-tabs__wrap) {
  background: #F8F3F9;
  padding: 15px 0;
  height: auto;
  // width: 375px
}
:deep(.van-sticky--fixed) {
  z-index: 1001;
  // height: 32PX;
}
:deep(.van-tabs__nav--line) {
  padding-bottom: 0;
  height: auto;
  padding-left: 14px;
  padding-right: 14px;
}
.snft-list-con {
  //   height: 800px;
}
:deep(.coll-icon-tabs) {
  &.coll-list {
    .van-sticky {
      display: none;
    }
  }
  .van-sticky--fixed,
  .van-tabs__wrap {
    height: auto;
  }
  .van-tab {
    width: 60px;
    height: 60px;
    background: #9F54BA;
    border: 1PX solid #e4e7e8;
    border-radius: 50%;
    color: #9F54BA;
    padding: 0;
    position: relative;
    &.van-tab--active {
      background: #fff;
      border: 1PX solid #9F54BA;
      border-radius: 50%;
      color: #9F54BA;
      .van-tab__text .icon-num {
        border: 1PX solid #9F54BA;
        color: #9F54BA;
      }
    }
    .More {
      width: 60px;
      line-height: 60px;
      text-align: center;
      font-size: 14px;
    }
    .van-tab__text {
      display: block;
      height: 100%;
      width: 60px;
      .icon-num {
        min-width: 15px;
        height: 15px;
        line-height: 15px;
        border: 1PX solid #e4e7e8;
        border-radius: 50%;
        text-align: center;
        font-size: 12px;
        position: absolute;
        background: #fff;
        color: #e4e7e8;
        bottom: 0px;
        left: 0px;
        z-index: 9;
      }
    }
  }
  .van-image {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    overflow: hidden;
  }
}
.coll-content-list {
  padding: 0 15px;
  .list-box {
    flex-wrap: wrap;
  }
  .snft-card {
    width: 48%;
    font-size: 12px;
    cursor: pointer;
    padding: 7.5px;
    margin-bottom: 15px;
    &::after {
      border-radius: 7.5px;
    }
    .van-image {
      width: 150px;
      height: 150px;
      border-radius: 7.5px;
      overflow: hidden;
    }
    .name {
      margin-top: 6px;
    }
    .address {
      color: rgba(154, 154, 154, 1);
    }
  }
}
.coll-card {
  padding: 0 15px;
  margin-bottom: 16px;
  cursor: pointer;
  .name-info {
    font-size: 12px;
    height: 32px;
    .name {
    }
    .hold-num {
      color: #acacac;
    }
  }
}
.coll-img {
  width: 60px;
  height: 60px;
  position: relative;
  .icon-num {
    position: absolute;
    font-size: 12px;
    &::after {
      border-radius: 16px;
      border-color: #acacac;
    }
    color: #acacac;
    min-width: 16px;
    padding: 0 4px;
    box-sizing: border-box;
    line-height: 16px;
    border-radius: 16px;
    text-align: center;
    z-index: 100;
    background: #fff;
    bottom: 0;
  }
}
.coll-amount {
  font-size: 12px;
  height: 32px;
  .num {
  }
  .toUsd {
    color: #acacac;
  }
}
</style>