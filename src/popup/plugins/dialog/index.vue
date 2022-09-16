<template>
<transition name="fade">
  <div class="dialog-mask flex center" v-if="isShow">
    <div class="wormholes-dialog">
      <div>
        <div class="flex center icon-box"><Icon name="warning" /></div>
        <div class="text text-center mt-8 pl-20 pr-20">{{ message }}</div>
        <div class="flex center mt-26">
          <Button @click="hide" class="okbtn">{{i18n.global.t('bootstrapwindow.okay')}}</Button>
        </div>
      </div>
    </div>
  </div>
  </transition>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { Dialog, Icon, Button } from "vant";
import i18n from "@/popup/language";
// import 
console.warn('i18n-------',i18n)

enum DialogType {
  success = "success",
  warn = "warn",
  fail = "fail",
}
interface DialogOpt {
  type?: DialogType;
  message: string;
}
// const {t} = useI18n()
const type = ref(DialogType.success);
const isShow = ref(false);
const message = ref(
  "Ooops！something went wrong You need to enter your private key."
);
const show = () => {
  isShow.value = true;
};
const hide = () => {
  isShow.value = false;
  message.value = "";
};
const open = (_opt: DialogOpt) => {
  show();
  const defaultOpt: DialogOpt = {
    type: DialogType.success,
    ..._opt,
  };
  const opt = { ...defaultOpt, ..._opt };
  const { type: newType, message: newMsg } = opt;
  type.value = newType;
  message.value = newMsg;

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
  z-index: 1000;
  background: rgba($color: #000000, $alpha: 0.5);
  .okbtn {
    min-width: 100px;
  }
  .wormholes-dialog {
    width: 340px;
    min-height: 230px;
    max-height: 500px;
    background: #fff;
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
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .2s ease-in;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>