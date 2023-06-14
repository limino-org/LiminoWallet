<template>
  <div>
    <NavHeader
        :title="t('sendSNFT.collTit')"
        backUrl="wallet"
        :hasRight="route.name == 'snftcollection-step1' ? false : true"
      >

      </NavHeader>
    <div class="snft-album flex">
      <div class="snft-collection" v-for="(item, i) in compData.children" :key="item.address">
        <van-image
          width="100%"
          height="100%"
          fit="cover"
          :src="`${metaDomain}${compData.children[i].source_url}`"
        ></van-image>
      </div>
    </div>
    <div>
      <div class="album-icon flex center">
        <img :src="`${metaDomain}${compData.img}`" alt="" />
      </div>
      <div class="albu-name f-10">{{compData.name}}</div>
      <div class="albu-title">
        {{compData.desc}}
      </div>
      <div class="albu-snft flex around">
        <div
          class="snft hover"
          v-for="item in compData.children"
          :key="item.address"
          @click="toDetail(item)"
        >
          <div class="snft-img">
            <van-image
              width="100%"
              height="100%"
              fit="cover"
              :src="`${metaDomain}${item.source_url}`"
            ></van-image>
          </div>
          <div class="snft-name f-12">{{ item.name }}</div>
          <div class="snft-address f-12">{{ addressMask(item.nft_address) }}</div>
        </div>
        <div class="snft" style="height:50px;opacity:0;"></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { onActivated, ref } from "vue";
import { addressMask } from "@/popup/utils/filters";
import { Image } from "vant";
import { useRoute, useRouter } from "vue-router";
import { Sticky } from "vant";
import NavHeader from "@/popup/components/navHeader/index.vue";
import { VUE_APP_METAURL } from '@/popup/enum/env';
import { useI18n } from 'vue-i18n';
export default {
  name: " snftcollcetion",
  components: {
    [Image.name]: Image,
    [Sticky.name]: Sticky,
    NavHeader,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const pageData = ref(JSON.parse(sessionStorage.getItem("compData")));
    const compData = ref(pageData || {});
    const {t} = useI18n()
    
    const metaDomain = ref(`${VUE_APP_METAURL}`);
    const toDetail = (data) => {
      router.push({ name: "coll-detail", query: data });
    };

    onActivated(() => {
        pageData.value = JSON.parse(sessionStorage.getItem("compData"))

    })
    return {
      compData,
      addressMask,
      metaDomain,
      route,
      t,
      toDetail,
    };
  },
};
</script>

<style lang="scss" scoped>

.snft-album {
  flex-wrap: wrap;
  align-content: space-between;
  justify-content: space-between;
  height: 200px;
  overflow: hidden;
  .snft-collection {
    width:25%;
    height: 93px;
  }
  .other {
    background-color: skyblue;
  }
}
.album-icon {
  height: 143px;
  position: absolute;
  left: 0;
  right: 0;
  top: 137px;
  background:  linear-gradient(180deg, rgba(255, 255, 255, 0) 10%, rgba(255, 255, 255, 0.9) 50%, #FFFFFF 80%);
  img {
    display: block;
      width: 60px;
  height: 60px;
  border-radius: 50%;
    object-fit: cover;
    border-radius: 50%;
  }
}
.albu-name {
  position: absolute;
  left: 15px;
  top: 250px;
  right:15px;
  font-weight: 700;
}
.albu-title {
  margin: 50px 15px 0;
  font-size: 9px;
  color: #848484;
}
.albu-snft {
  flex-wrap: wrap;
  align-content: space-between;
  justify-content: space-around;
  margin-top: 14px;
  .snft {
    width: 48%;
    height: 205px;
    border: 0.5px solid #e4e7e8;
    border-radius: 5px;
    margin-bottom: 10px;
    :deep(.van-image){
  border-radius: 7.5px;
  overflow: hidden;
}
    .snft-img {
      // margin: 7px auto;
      padding: 7px;
      box-sizing: border-box;
      // width: 150px;
      height: 165px;
      // background-color: pink;
      border-radius: 6px;
    }
    .snft-name {
      margin-left: 7px;
    }
    .snft-address {
      margin-left: 7px;
      color: #e4e7e8;
    }
  }
}
</style>