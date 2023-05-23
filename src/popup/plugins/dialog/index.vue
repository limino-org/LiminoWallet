<template>
 <Transition name="modal">
    <div :class="`dialog-mask flex center ${theme}`" v-show="isShow">
      <div class="wormholes-dialog modal-container">
        <div>
          <div class="title" v-if="title">{{title}}</div>
          <div class="flex center icon-box"><Icon name="warning" /></div>
          <div class="text text-center mt-8 pl-20 pr-20">{{message}}</div>
          <div
            :class="`flex mt-26 btn-box ${
              hasCancelBtn && hasConfirmBtn ? 'between' : 'center'
            }`"
          >
            <Button @click="cancelCall" v-if="hasCancelBtn" :plain="theme == 'light' ? false : true">{{
              cancelText
            }}</Button>
            <Button
              @click="confirmCall"
              v-if="hasConfirmBtn"
              type="primary"
              :plain="hasCancelBtn == false ? true : false"
              class="okbtn"
              >{{ confirmText }}</Button
            >
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script lang="ts" setup>
import { Ref, ref } from "vue";
import { Dialog, Icon, Button } from "vant";
import i18n from "@/popup/language";
// import
console.warn("i18n-------", i18n);

enum DialogType {
  success = "success",
  warn = "warn",
  fail = "fail",
};
interface DialogOpt {
  type?: DialogType;
  title?: string;
  message: string;
  theme?: string;
  hasCancelBtn?: boolean;
  hasConfirmBtn?: boolean;
  callBack?: Function;
  confirmBtnText?:string;
  cancelBtnText?:string
}
const confirmText = ref(i18n.global.t("sign.confirm"))
const cancelText = ref(i18n.global.t("createminerspledge.cancel"))
const hasCancelBtn: Ref<boolean> = ref(true);
const hasConfirmBtn: Ref<boolean> = ref(true);
let confirmCallBack: any = () => {}
let cancelCallBack:any = () =>{} 
let confirmCall = () => {
  hide()
  confirmCallBack ? confirmCallBack() : ''
}
let cancelCall = () => {
  hide()
  cancelCallBack ? cancelCallBack() :''
}
// const {t} = useI18n()
const type = ref(DialogType.success);
const isShow = ref(false);
const message = ref(
  "Ooops！something went wrong You need to enter your private key."
);
const title = ref('')
// dark light
const theme = ref("light");
const show = () => {
  isShow.value = true;
};
const hide = () => {
  isShow.value = false;
  let time = setTimeout(() => {
   confirmText.value = i18n.global.t("sign.confirm")
   cancelText.value = i18n.global.t("createminerspledge.cancel")
   clearTimeout(time)
  },300)
  // message.value = "";
};
const open = (_opt: DialogOpt) => {
  show();
  const defaultOpt = {
    type: DialogType.success,
    theme: "light",
    hasCancelBtn: true,
    hasConfirmBtn: true,
    callBack: confirmCallBack,
    cancelBack: cancelCallBack,
    confirmBtnText: confirmText.value,
    cancelBtnText: cancelText.value,
    title:"",
    ..._opt,
  };
  const opt = { ...defaultOpt, ..._opt };
  const {
    type: newType,
    theme: newTheme,
    hasCancelBtn: newCancel,
    hasConfirmBtn: newConfirm,
    message: newMsg,
    title: newTit,
    callBack,
    cancelBack,
    cancelBtnText,
    confirmBtnText,
  } = opt;
  confirmCallBack = callBack
  cancelCallBack = cancelBack
  confirmText.value = confirmBtnText
  cancelText.value = cancelBtnText
  type.value = newType;
  message.value = newMsg;
  theme.value = newTheme;
  hasCancelBtn.value = newCancel;
  hasConfirmBtn.value = newConfirm;
  title.value = newTit || '';
};
const success = (msg: string) => {
  open({
    type: DialogType.success,
    message: msg,
  });
};
const warn = (msg: string) => {
  open({
    type: DialogType.warn,
    message: msg,
  });
};
const fail = (msg: string) => {
  open({
    type: DialogType.fail,
    message: msg,
  });
};
defineExpose({
  isShow,
  show,
  hide,
  open,
  success,
  warn,
  fail,
});
</script>
<style lang="scss" scoped>
.dialog-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 5000;
  transition: all 0.3s ease;
  &.light {
    background: rgba($color: #000000, $alpha: 0.5);
    .wormholes-dialog {
      overflow: hidden;
      background: #fff;
      .text {
        color: #000;
      }
    }
  }
  &.dark {
    // background: rgba($color: #fff, $alpha: 0.2);
    .wormholes-dialog {
      overflow: hidden;
      background: rgba($color: #000000, $alpha: 0.7);
      .text {
        color: #fff;
      }
    }
    :deep(.van-button--plain) {
      background: none;
      color: #fff;
      border: 1px solid #fff;
    }
  }
  .title {
    line-height: 60px;
    text-align: center;
    background: #F8F3F9;
    font-weight: bold;
    font-size: 15px;
    box-shadow: 0 1px 1px rgb(135 134 134 / 10%);
  }
  .okbtn {
    min-width: 100px;
  }
  .wormholes-dialog {
    width: 340px;
    min-height: 230px;
    max-height: 500px;
    border-radius: 7px;
    padding-bottom: 35px;
    .icon-box i {
      font-size: 44px;
      color: #f7bf03;
      margin-top: 50px;
    }
    .text {
      font-size: 15px;
      line-height: 20px;
    }
  }
  .btn-box {
    padding: 0 50px;
    button {
      width: 100px;
    }
  }
}
// .fade-enter-active,
// .fade-leave-active {
//   transition: opacity 0.2s ease-in;
// }

// .fade-enter-from,
// .fade-leave-to {
//   opacity: 0;
// }
</style>