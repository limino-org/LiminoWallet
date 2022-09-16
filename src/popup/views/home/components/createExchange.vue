<template>
  <van-dialog
    v-model:show="showExchange"
    show-cancel-button
    teleport="#page-box"
    :showConfirmButton="false"
    :showCancelButton="false"
  >
    <div class="exchange-container">
      <div
        class="exchange-modal-title text-bold van-hairline--bottom text-center"
      >
        {{ t("createExchange.anto_exchange") }}
      </div>
      <!-- 加载图标 -->
      <img
        class="exchange-welcome-icon"
        src="@/popup/assets/exchange/SketchPngd639df730ff6d003324f6bb2b005d2a46f1f8b4b97a5840681e048ee15e4f94b.png"
      />
      <div class="echange-slogan1 text-bold">
        {{ t("createExchange.wait") }}
      </div>
      <div class="text-center please">{{t('createExchange.please')}}</div>
      <!-- 添加进度图 -->
      <van-circle
        class="progress-bar"
        v-model:current-rate="currentRate"
        layer-color="#fafafa"
        :speed="speed"
        :rate="rate"
        :stroke-width="60"
        :color="gradientColor"
        :text="text"
      ></van-circle>
      <!-- <div v-if="ready" style="padding: 20px">
          <div>一键生成交易所成功！</div>
        </div>-->
    </div>
    <van-dialog
      v-model:show="showExchange1"
      show-cancel-button
      teleport="#page-box"
      :showConfirmButton="false"
      :showCancelButton="false"
    >
      <div class="exchange-container">
        <div
          class="
            exchange-modal-title
            text-bold
            van-hairline--bottom
            text-center
          "
        >
          {{ t("createExchange.anto_exchange") }}
        </div>
        <!-- 加载图标 -->
        <img
          class="exchange-welcome-icon"
          src="@/popup/assets/exchange/SketchPng6487f59e1a3e4adec886c6b63f8c41c4aa0d61ebfe43fcaad735b3ff5ca97e8d.png"
        />
        <div class="echange-slogan1 text-bold">
          {{ t("createExchange.opensuccessfully") }}
        </div>
        <!-- 交易所信息 -->
        <div>
          <div class="exchange-create">
            <div class="table">
              <div class="top">
                <div class="left">{{ t("createExchange.cms") }}</div>
                <div @click="toCopyCMS" class="right">
                  <img
                    src="@/popup/assets/exchange/SketchPngf56604d8c09a75451ced5b63a941cd3aafccd0e5af65a41e737864095639c7d5.png"
                    alt
                  />
                </div>
              </div>
              <div @click="toGoCMS" class="down">{{ adminUrl }}</div>
            </div>
            <!-- 分割线 -->
            <div class="exchange-line"></div>
            <div class="table">
              <div class="top">
                <div class="left">{{ t("createExchange.exchange") }}</div>
                <div @click="toCopyAmount" class="right">
                  <img
                    src="@/popup/assets/exchange/SketchPngf56604d8c09a75451ced5b63a941cd3aafccd0e5af65a41e737864095639c7d5.png"
                    alt
                  />
                </div>
              </div>
              <div @click="toGoAmount" class="down">{{ exchangeUrl }}</div>
            </div>
          </div>
          <!-- 标语 -->
          <div class="echange-slogan2">
            <span class="left">{{ t("createExchange.confirm") }}</span>
            <span class="right">{{ t("createExchange.terms") }}</span>
          </div>
          <!-- 控制按钮 -->
          <div class="exchange-button" style="margin: auto">
            <van-button size="normal" @click="tohome">{{
              t("createExchange.close")
            }}</van-button>
          </div>
        </div>
      </div>
    </van-dialog>
  </van-dialog>
</template>
<script lang="ts">
import {
  defineComponent,
  Ref,
  ref,
  watch,
  SetupContext,
  computed,
  toRaw,
  onMounted,
  ComputedRef,
  nextTick,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { ethers, utils } from "ethers";
import { useStore, mapState } from "vuex";
import { useExchanges } from "@/popup/views/home/hooks/useExchange";
import BigNumber from "bignumber.js";
import { ExchangeStatus } from "@/popup/store/modules/account";
import {
  Dialog,
  Form,
  Field,
  CellGroup,
  Button,
  Popup,
  Circle,
  Toast,
  Slider,
} from "vant";
import useClipboard from "vue-clipboard3";
import { getWallet, wallet } from "@/popup/store/modules/account";
import { useI18n } from "vue-i18n";
import { VUE_APP_EXCHANGESMANAGEMENT_URL,VUE_APP_EXCHANGES_URL } from "@/popup/enum/env";
export default defineComponent({
  name: "createExchange",
  components: {
    [Dialog.Component.name]: Dialog.Component,
    [Form.name]: Form,
    [Field.name]: Field,
    [CellGroup.name]: CellGroup,
    [Button.name]: Button,
    [Popup.name]: Popup,
    [Circle.name]: Circle,
    [Slider.name]: Slider,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    amount: {
      type: Number,
      default: 0,
    },
    amount2: {
      type: Number,
      default: 0,
    },
    name: {
      type: String,
      default: "",
    },
  },
  setup(props: any, context: SetupContext) {
    const { t } = useI18n();
    const { emit }: any = context;
    const router = useRouter();
    const { dispatch } = useStore();
    const {
      showExchange,
      showExchange1,
      currentRate,
      ready,
      speed,
      rate,
      createExchanges,
    } = useExchanges();
    const store = useStore();

    watch(
      () => props.modelValue,
      (n) => {
        if (n) {
          dispatch("account/getExchangeStatus", (data: any) => {
            const { status, exchanger_flag } = data;
            if (!exchanger_flag) {
              showExchange.value = n;
              createExchanges(props.name, props.amount, props.amount2,1);
            } else {
              Toast(t('createExchange.alreadyopenedanexchange'));
            }
          });
        }
      },
      {
        immediate: true,
      }
    );
    watch(
      () => showExchange.value,
      (n) => {
        if (!n) {
          emit("update:modelValue", false);
        }
      }
    );
      
    const adminUrl = computed(() => {
      const add = store.state.account.accountInfo.address;
      return `${
        VUE_APP_EXCHANGESMANAGEMENT_URL
      }?address=${add.toLowerCase()}&exchangeAddress=${add.toLowerCase()}`;
    });
    const exchangeUrl = computed(() => {
      const add = store.state.account.accountInfo.address;
      return `${VUE_APP_EXCHANGES_URL}/c${add.toLowerCase()}/#/`;
    });

    //环形图
    const text = computed(() => currentRate.value.toFixed(0) + "%");

    // 复制地址
    const { toClipboard } = useClipboard();
    const toCopyCMS = async () => {
      try {
        await toClipboard(`${adminUrl.value}`);
        Toast.success(t("copy.copy"));
      } catch (e) {
        console.error(e);
      }
    };
    const toCopyAmount = async () => {
      try {
        await toClipboard(`${exchangeUrl.value}`);
        Toast.success(t("copy.copy"));
      } catch (e) {
        console.error(e);
      }
    };

    // 跳转到后台
    const toGoCMS = () => {
      window.open(`${adminUrl.value}`);
    };
    // 跳转到交易所
    const toGoAmount = () => {
      window.open(`${exchangeUrl.value}`);
    };
    // 按钮
    const tohome = () => {
      console.log("关闭");
      showExchange1.value = false;
    };

    watch(
      () => currentRate.value,
      async (n) => {
        if (Number(n) == 100) {
          console.warn("watch------ currentRate", n);
          // showExchange.value = false;
          // showExchange1.value = true;
          // 判断是否是发两笔交易
          nextTick(() => {
            const { amount, amount2 } = props;
            if (amount && amount2) {
              router.replace({ name: "createExchangeSuccess",query: {firstTime:'true'} });
              return;
            }
            if (amount) {
              Toast(t("createExchange.oneclickexchangewascreatedsuccessfully"));
            }
            router.replace({ name: "wallet" });

            dispatch("account/getExchangeStatus");
          });
        }
      }
    );

const gradientColor = {
      '0%': '#d0e1ee',
      '100%': '#037CD6',
    };
    return {
      gradientColor,
      t,
      showExchange,
      showExchange1,
      currentRate,
      speed,
      rate,
      ready,
      text,
      toCopyCMS,
      toCopyAmount,
      tohome,
      exchangeUrl,
      toGoCMS,
      adminUrl,
      toGoAmount,
    };
  },
});
</script>
<style lang="scss" scoped>
  .please{
    color: rgba(132, 132, 132, 1);
    font-size: 12px;
  }
  :deep(.van-circle__text){
    font-size: 18px;
font-weight: 400;
color: #037CD6;
line-height: 25px;
  }
.exchange-container1 {
  height: 550px;

  .exchange-modal-title {
    height: 62px;
    font-size: 15px;
    line-height: 62px;
    background-color: #f8fcff;
    color: #b3b3b3;
  }
  .exchange-welcome-icon {
    height: 35px;
    width: 35px;
    margin: 27px auto 0;
    display: block;
  }
  .echange-slogan1 {
    font-size: 15px;
    text-align: center;
    margin: 11px auto 20px;
  }
  .exchange-create-form {
    // border: 1PX solid #e4e7e8;
    width: 315px;
    margin: auto;
    .form-title {
      height: 56px;
      background-color: #ccffff;
      text-align: center;
      line-height: 24px;
    }
  }
  .echange-slogan2 {
    width: 100%;
    height: 17px;
    font-size: 12px;
    line-height: 17px;
    margin: 21px auto 23px;
    text-align: center;
    .right {
      color: #037cd6;
      text-decoration: underline;
    }
  }
  .exchange-button {
    display: flex;
    justify-content: space-evenly;
  }
}
.exchange-container {
  height: 408px;

  .exchange-modal-title {
    height: 62px;
    font-size: 15px;
    line-height: 62px;
    background-color: #f8fcff;
  }
  .exchange-welcome-icon {
    height: 40px;
    width: 40px;
    margin: 27px auto 0;
    display: block;
  }
  .echange-slogan1 {
    font-size: 15px;
    text-align: center;
    margin: 11px auto 20px;
  }
  .exchange-create-form {
    // border: 1PX solid #e4e7e8;
    width: 315px;
    margin: auto;
  }
  .echange-slogan2 {
    width: 100%;
    height: 17px;
    font-size: 12px;
    line-height: 17px;
    margin: 21px auto 23px;
    text-align: center;
    .right {
      color: #037cd6;
      text-decoration: underline;
    }
  }
  .exchange-button {
    display: flex;
    justify-content: space-evenly;
  }
}
.progress-bar {
  margin: 40px auto;
  display: flex;
}

.exchange-create {
  border: 1PX solid #e4e7e8;
  width: 315px;
  height: 116px;
  margin: auto;
  .table {
    height: 37px;
    padding: 10px 13px;
    .top {
      display: flex;
      justify-content: space-between;
      .right {
        width: 12px;
        height: 12px;
        img {
          width: 12px;
          height: 12px;
        }
      }
    }
    .down {
      height: 24px;
      line-height: 24px;
      color: #037cd6;
      text-decoration: underline;
      white-space: nowrap;
      overflow: hidden;
    }
  }
  .exchange-line {
    height: 1px;
    width: 285px;
    background-color: #e4e7e8;
    margin: auto;
  }
}
</style>