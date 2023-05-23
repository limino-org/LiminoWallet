<template>
  <div class="guide-page">
    <van-swipe class="my-swipe" :autoplay="13000" indicator-color="#9F54BA">
      <van-swipe-item>
        <div>
          <WormTransition>
            <template v-slot:t1>
              <img class="icon" src="../imgs/symbol2.png" />
            </template>
            <template v-slot:t2>
              <img class="icon" src="../imgs/symbol3.png" />
            </template>
            <template v-slot:t3>
              <img class="icon t3icon" src="../imgs/symbol4.png" />
            </template>
            <template v-slot:t4>
              <img class="icon" src="../imgs/symbol5.png" />
            </template>
            <template v-slot:t5>
              <img class="icon" src="@/assets/blacklogo.png" />
            </template>
            <template v-slot:icon>
              <img class="logo" src="@/assets/logo1.png" />
            </template>
          </WormTransition>
          <div class="title tit-big text-center f-24">{{ t("introductorypage.bootstrap1") }}</div>
          <div class="title-center tit-small text-center f-12">{{ t("introductorypage.bootstrap1title") }}</div>
        </div>
      </van-swipe-item>
      <van-swipe-item>
        <div>
          <WormTransition>
            <template v-slot:t1>
              <img class="icon" src="../imgs/symbol2.png" />
            </template>
            <template v-slot:t2>
              <img class="icon" src="../imgs/symbol3.png" />
            </template>
            <template v-slot:t3>
              <img class="icon t3icon" src="../imgs/symbol4.png" />
            </template>
            <template v-slot:t4>
              <img class="icon" src="../imgs/symbol5.png" />
            </template>
            <template v-slot:t5>
              <img class="icon" src="@/assets/blacklogo.png" />
            </template>
            <template v-slot:icon>
              <img src="../imgs/shakehands.png" />
            </template>
          </WormTransition>
          <div class="title tit-big text-center f-24">{{ t("introductorypage.bootstrap2") }}</div>
          <div class="title-center tit-small text-center f-12">{{ t("introductorypage.bootstrap2title") }}</div>
        </div>
      </van-swipe-item>
      <van-swipe-item>
        <div>
          <WormTransition>
            <template v-slot:t1>
              <img class="icon" src="../imgs/symbol2.png" />
            </template>
            <template v-slot:t2>
              <img class="icon" src="../imgs/symbol3.png" />
            </template>
            <template v-slot:t3>
              <img class="icon t3icon" src="../imgs/symbol4.png" />
            </template>
            <template v-slot:t4>
              <img class="icon" src="../imgs/symbol5.png" />
            </template>
            <template v-slot:t5>
              <img class="icon" src="@/assets/blacklogo.png" />
            </template>
            <template v-slot:icon>
              <img src="../imgs/upload.png" />
            </template>
          </WormTransition>
          <div class="title tit-big text-center f-24">{{ t("introductorypage.bootstrap3") }}</div>
          <div class="title-center tit-small text-center f-12">{{ t("introductorypage.bootstrap3title") }}</div>
        </div>
      </van-swipe-item>
      <van-swipe-item>
        <div>
          <WormTransition>
            <template v-slot:t1>
              <img class="icon" src="../imgs/symbol2.png" />
            </template>
            <template v-slot:t2>
              <img class="icon" src="../imgs/symbol3.png" />
            </template>
            <template v-slot:t3>
              <img class="icon t3icon" src="../imgs/symbol4.png" />
            </template>
            <template v-slot:t4>
              <img class="icon" src="../imgs/symbol5.png" />
            </template>
            <template v-slot:t5>
              <img class="icon" src="@/assets/blacklogo.png" />
            </template>
            <template v-slot:icon>
              <img src="../imgs/shield.png" />
            </template>
          </WormTransition>
          <div class="title tit-big text-center f-24">{{ t("introductorypage.bootstrap4") }}</div>
          <div class="title-center tit-small text-center f-12">{{ t("introductorypage.bootstrap4title") }}</div>
        </div>
      </van-swipe-item>
    </van-swipe>
  </div>

  <!-- Log in to create a new account -->
  <div class="btn-groups">
    <div class="container pl-22 pr-22 flex between f-12">
      <van-button round block plain  class="mr-10" @click="tologin">
        {{
        t("createAccountpage.mnemonicBtn")
        }}
      </van-button>
      <van-button round block type="primary" @click="tocreate">
        {{
        t("introductorypage.create")
        }}
      </van-button>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { createApp } from 'vue'
import { Swipe, SwipeItem, Button } from 'vant'
import { useRoute, useRouter } from 'vue-router'
import WormTransition from '@/popup/components/wromTransition/index.vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'guide-step1',
  components: {
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
    [Button.name]: Button,
    WormTransition
  },
  setup() {
    const { t } = useI18n()
    const router = useRouter()
    const tologin = () => {
      router.push({
        name: 'loginAccount-export-mnemonic'
      })
    }
    const tocreate = () => {
      router.push({
        name: 'loginAccount-create-step1'
      })
    }
    return {
      t,
      tologin,
      tocreate
    }
  }
}
</script>
<style lang="scss" scoped>
.guide-page {
  width: 375px;
  margin: 0 auto;
  .tit-big {
    font-weight: bold;
  }
  .tit-small {
    padding-left: 70px;
    padding-right: 70px;
  }
}
.my-swipe .van-swipe-item {
  margin-top: 20px;
  color: #000;
  font-size: 14px;
  height: 550px;
  text-align: center;
  background-repeat: no-repeat;
  .iconele {
    width: 180px;
    height: 180px;
    margin: 0 auto;
    // border-radius: 50%;
    overflow: hidden;
    background-size: cover;
    background-repeat: no-repeat;
    // background-image: url('../imgs/background.png');
    background-position: left 0 top 0 right 0 bottom 0;
    .iconinner {
      width: 175px;
      height: 175px;
      background-size: cover;
      background-repeat: no-repeat;
      background-position: left 0 top 0 right 0 bottom 0;

      img {
        display: block;
        width: 175px;
      }
    }
  }
  .title {
    line-height: 20px;
    margin-top: 44px;
    margin-bottom: 15px;
  }
  .title-center {
    color: #b3b3b3;
    line-height: 16px;
  }
  .icon {
    width: 30px;
    // height: 30px;
  }
  .t3icon {
    width: 24px;
  }
  .logo {
    width:56px !important;
  }
}

.form-button {
  display: flex;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 50px;
  button {
    font-size: 12px;
    padding: 0;
  }
  button:nth-of-type(1) {
    margin-right: 20px;
  }
}
</style>