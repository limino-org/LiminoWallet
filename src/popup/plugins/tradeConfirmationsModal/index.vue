<template>
  <transition name="fade">
    <div class="trade-dialog-mask flex center" v-if="isShow" @click.self="hide">
      <div class="wormholes-dialog">
        <div class="text-center tit van-hairline--bottom">
          {{i18n.global.t('transactiondetails.tradeTit')}}
        </div>
        <div>
          <div class="info-box">
            <div class="icon">
              <div class="flex">
                <Loading
                  color="#1989fa"
                  v-show="defaultData.status == 'pendding'"
                />
                <i
                  v-show="defaultData.status != 'pendding'"
                  class="iconfont icon-check_fill success"
                ></i>
                <span class="lh-30 ml-10 approve">{{
                  i18n.global.t("bootstrapwindow.approve")
                }}</span>
              </div>
            </div>
            <div class="approve-msg pl-30 ml-8 mb-10">
              {{ defaultData.approveMessage }}
            </div>
          </div>
          <div :class="`info-box ${defaultData.status == 'fail' ? 'fail' : ''}`">
            <div class="icon">
              <div class="flex">
                <div class="flex center">
                  <Loading
                    color="#1989fa"
                    v-show="defaultData.status == 'approve'"
                  />
                  <i
                    v-show="defaultData.status == 'pendding'"
                    class="iconfont icon-check_fill"
                  ></i>
                  <i
                    v-show="defaultData.status == 'success'"
                    class="iconfont icon-check_fill success"
                  ></i>
                  <Icon v-show="defaultData.status == 'fail'" name="clear" class="fail" />
                </div>
                <span
                  class="lh-30 ml-10 approve"
                  v-show="
                    defaultData.status == 'pendding' ||
                    defaultData.status == 'approve'
                  "
                  >{{ i18n.global.t("bootstrapwindow.watting") }}</span
                >
                <span
                  class="lh-30 ml-10 approve"
                  v-show="
                    defaultData.status == 'success' ||
                    defaultData.status == 'fail'
                  "
                >
                  {{
                    defaultData.status == "success"
                      ? i18n.global.t("transactiondetails.success")
                      : i18n.global.t("transactiondetails.fail")
                  }}
                </span>
              </div>
            </div>
            <div
              class="approve-msg pl-30 ml-8 mb-10"
              v-show="
                defaultData.status == 'pendding' ||
                defaultData.status == 'approve'
              "
            >
              {{ defaultData.wattingMessage }}
            </div>
            <div
              class="approve-msg pl-30 ml-8 mb-10"
              v-show="
                defaultData.status == 'success' || defaultData.status == 'fail'
              "
            >
              {{
                defaultData.status == "success"
                  ? defaultData.successMessage
                  : defaultData.failMessage
              }}
            </div>
          </div>
          <div class="flex center mt-26">
            <Button

              @click="callBack"
              :disabled="disabled"
              class="okbtn"
              type="primary"
              >{{ i18n.global.t("returnreceipt.done") }}</Button
            >
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script lang="ts" setup>
import { computed, ref } from "vue";
import { Button, Icon, Loading } from "vant";
import i18n from "@/popup/language";
import { TradeConfirmOpt, TradeStatus } from "./tradeConfirm";
console.warn("i18n-------", i18n);

const getDefaultOpt = () => {
  return ref({
    approveMessage: i18n.global.t('send.approveMessage'),
    successMessage:  i18n.global.t('send.successMessage'),
    wattingMessage:  i18n.global.t('send.wattingMessage'),
    failMessage: i18n.global.t('send.failMessage'),
    status: "pendding",
    callBack: () => {},
    failBack: () => {}
  });
};
const defaultData = getDefaultOpt();

const disabled = computed(() => {
  if (defaultData.value.status == "pendding" || defaultData.value.status == "approve") {
    return true;
  }
  return false;
});
const isShow = ref(false);
const show = (opt: TradeConfirmOpt) => {
  defaultData.value = { ...getDefaultOpt().value, ...opt };
  !isShow.value ? (isShow.value = true) : "";
};
const callBack = () => {
  hide()
  const { callBack: done, failBack } = defaultData.value
  if(defaultData.value.status == 'success') {
    done && typeof done == 'function' ? done() :''
  }
  if(defaultData.value.status == 'fail') {
    failBack && typeof failBack == 'function' ? failBack() :''
  }
}
const hide = () => {
  isShow.value = false;
};

const open = (_opt: TradeConfirmOpt = {status: TradeStatus.pendding}) => {
  const defaultOpt = {
    ..._opt,
  };

  show(defaultOpt);
};
const update = (_opt: TradeConfirmOpt= {status: TradeStatus.approve}) => {
  const defaultOpt: TradeConfirmOpt = {
    ..._opt,
  };
  show(defaultOpt);
};


defineExpose({
  isShow,
  show,
  hide,
  open,
  update,
  callBack
});
</script>
<style lang="scss" scoped>
.success {
  color: #3aae55 !important;
}
.fail {
  color: #d73a49 !important;
}
.trade-dialog-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 3002;
  background: rgba($color: #000000, $alpha: 0.5);
  .okbtn {
    min-width: 100px;
  }
  .wormholes-dialog {
    overflow: hidden;
    .tit {
      line-height: 62px;
      background: #f8fcff;
      font-size: 15px;
      font-weight: 600;
    }
    width: 340px;
    min-height: 230px;
    max-height: 500px;
    background: #fff;
    border-radius: 7px;
    padding-bottom: 25px;
    .approve-msg {
      font-size: 12px;
    }
    .info-box {
      padding: 22px 25px 0;
      &.fail {
        .approve,.approve-msg {
          color:#d73a49;
        }
      }
      .icon i {
        font-size: 26px;
        color: #9a9a9a;
      }
    }
    .approve {
      font-size: 15px;
      font-weight: bold;
    }
    .approve-msg {
      line-height: 18px;
      color: #848484;
    }
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-in;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>