<template>
  <div class="loading-bg">
    <div class="tit-big text-center f-16">
      {{ t("createAccountpage.creating") }}
    </div>
    <div class="loading pt-28">
      <van-progress
        :percentage="percentage"
        stroke-width="5"
        color="#9F54BA"
        :show-pivot="false"
      />
      <div class="text-center mt-16 process">{{ percentage }}%</div>
    </div>
  </div>
  <div class="icon-box flex center">
    <div
      class="iconele flex center"
      :style="{
        backgroundImage: `url(${require('@/popup/views/createAccount/imgs/circle.png')})`,
      }"
    >
      <div
        class="iconinner flex center"
        :style="{
          backgroundImage: `url(${require('@/popup/views/createAccount/imgs/circle1.png')})`,
        }"
      >
        <!-- <img v-if="percentage != 100" src="./../imgs/loading.png" alt /> -->
        <img src="./../imgs/success.png" />
      </div>
    </div>
  </div>

  <div class="tip">
    <div class="lh-30 text-bold text-center f-21 mt-8 label">
      {{ t("exchange.congratulations") }}
    </div>
    <i18n-t
      keypath="createAccountpage.successfullyCreated"
      tag="div"
      class="f-12 lh-16 mt-8 tip-info text-center"
    >
      <template v-slot:br><br /></template>
    </i18n-t>
  </div>
</template>
<script lang="ts">
import { useStore } from "vuex";
import { Button, Progress } from "vant";
import { encryptPrivateKey, EncryptPrivateKeyParams } from "@/popup/utils/web3";
import { ref, onMounted, watch, nextTick } from "vue";
import { web3 } from "@/popup/utils/web3";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useBroadCast } from "@/popup/utils/broadCost";

export default {
  name: "loginAccount-create-step2",
  components: {
    [Button.name]: Button,
    [Progress.name]: Progress,
  },
  setup() {
    const percentage = ref(0);
    const { dispatch, commit } = useStore();
    const { handleUpdate } = useBroadCast();
    const { t } = useI18n();
    const router = useRouter();
    const { query } = useRoute();
    onMounted(async () => {
      nextTick(() => {
        let setValue = setInterval(() => {
          if (percentage.value < 100) {
            percentage.value += 1;
          }
          if (percentage.value === 100) {
            clearInterval(setValue);
          }
        });
      });
    });
    watch(
      () => percentage.value,
      (n) => {
        if (n == 100) {
          let time = setTimeout(() => {
            router.replace({
              name: "loginAccount-start-page",
            });
            clearTimeout(time);
          }, 200);
        }
      }
    );
    return {
      percentage,
      t,
    };
  },
};
</script>
<style lang="scss" scoped>
.loading-bg {
  background: #F8F3F9;
  height: 135px;
  padding: 25px 0 0;
  .tit-big {
    line-height: 20px;
    font-size: 15px;
    color: #9F54BA;
  }
  .loading {
    margin: 0 62px;
  }
  .process {
    color: #9F54BA;
  }
}
.icon-box {
  margin-top: 50px;
  .iconele {
    width: 175px;
    height: 175px;
    border-radius: 50%;
    overflow: hidden;
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
.tip {
  .label {
    font-size: 15px;
  }
}
.tip-info {
  width: 255px;
  margin: 0 auto;
  color: #848484;
}
</style>