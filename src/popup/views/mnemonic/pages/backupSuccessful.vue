<template>
  <div class="mnemonic-bg pt-24 pb-24">
    <div class="tit-big text-center f-16">
      {{ t("mnemonic.yourRecoveryPhrase") }}
    </div>
    <div class="flex center">
      <div class="tit-small text-center f-12 mt-10 lh-16">
        {{ t("mnemonic.protectYourFunds") }}
      </div>
    </div>
  </div>
  <div class="icon-box flex center">
    <div
      class="iconele flex center"
      :style="{
        backgroundImage: `url(${require('@/popup/views/mnemonic/imgs/circle.png')})`,
      }"
    >
      <div
        class="iconinner flex center"
        :style="{
          backgroundImage: `url(${require('@/popup/views/mnemonic/imgs/circle2.png')})`,
        }"
      >
      <i class="iconfont success icon-duihao2"></i>
        <!-- <img src="./../imgs/success.png" alt="" /> -->
      </div>
    </div>
  </div>
  <div class="tip">
    <div class="lh-20 text-center f-14 mt-8 mb-16">
      {{ t("mnemonic.backUpSuccessful") }}
    </div>
    <div class="f-12 lh-16 tip-info text-center">
      {{ t("mnemonic.backupQRcode") }}
    </div>
  </div>

  <div class="btn-groups">
    <div class="container flex between pl-28 pr-28">
      <van-button block @click="openCode" class="mr-10">
        {{ t("mnemonic.QRCode") }}
      </van-button>
      <van-button type="primary" block @click="toHome">
        {{ t("mnemonic.done") }}
      </van-button>
    </div>
  </div>

  <qrcodeModal v-model="show" :data="data" />
</template>
<script lang="ts">
import Vue, { onMounted } from "vue";
import { Icon, Toast, Button, Sticky, Field } from "vant";
import { useRouter } from "vue-router";
import { ref, Ref } from "vue";
import qrcodeModal from "@/popup/components/qrcodeModal/index.vue";
import { getCookies } from "@/popup/utils/jsCookie";
import { parseMnemonic } from "@/popup/utils/web3";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
export default {
  name: "mnemonic-step1",
  components: {
    [Button.name]: Button,
    [Sticky.name]: Sticky,
    qrcodeModal,
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const show: Ref<boolean> = ref(false);
    const { commit, state } = useStore();
    const toHome = () => {
      router.push({ name: "wallet" });
    };
    const openCode = () => {
      show.value = true;
    };
    const data = ref("");
    onMounted(async () => {
      // Get the decrypted mnemonic
      const password = await getCookies("password");
      data.value = await parseMnemonic(password, state.mnemonic.keyStore);
      commit("system/UPDATE_HASBACKUPMNEMONIC", true);
    });

    return {
      t,
      toHome,
      openCode,
      show,
      data,
    };
  },
};
</script>
<style lang="scss" scoped>
.success {
  font-size: 40px;
  color: #3eae58;
}
.mnemonic-bg {
  background: #F8F3F9;
  .tit-big {
    line-height: 21px;
  }
  .tit-small {
    width: 290px;
    color: rgba(132, 132, 132, 1);
  }
}
.icon-box {
  margin-top: 50px;
  .iconele {
    width: 175px;
    height: 175px;
    border-radius: 50%;
    overflow: hidden;
    // background: url('/@/popup/views/mnemonic/imgs/circle.png') left 0 right 0 top 0 bottom 0 no-repeat ;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: left 0 top 0 right 0 bottom 0;
    .iconinner {
      width: 110px;
      height: 110px;
      background-size: cover;
      background-repeat: no-repeat;
      background-position: left 0 top 0 right 0 bottom 0;

      img {
        display: block;
        width: 40%;
      }
    }
  }
}
.tip-info {
  width: 255px;
  margin: 0 auto;
  color: #848484;
}
.btn-group {
  button:nth-of-type(1) {
    margin-right: 10px;
  }
}
</style>