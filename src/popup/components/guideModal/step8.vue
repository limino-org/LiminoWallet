
<template>
  <van-popover
    v-model:show="showModal"
    @click-overlay="beforeClose"
    :close-on-click-overlay="false"
    trigger="manual"
    class="popover-dialog step8"
    placement="bottom-end"
    teleport="#page-box"
    overlay
  >
    <div class="dialog-box">
      <div class="serial-number">
        <span class="left">7</span> <span>/</span> 12
      </div>
      <div class="title">
        {{ t("bootstrapwindow.sNFTs") }}
      </div>
      <div class="small-tit pl-30 pr-30 mt-20">
        {{ t("bootstrapwindow.sNFTsMessage") }}
      </div>
      <div class="flex center">
        <van-button type="primary" @click="handleClick(8)">{{
          t("bootstrapwindow.next")
        }}</van-button>
      </div>
<!--      <span class="tip2 f-12">-->
<!--        {{ t("bootstrapwindow.displaymethod") }}-->
<!--      </span>-->
<!--      <span class="circle"></span>-->
<!--      <span class="tip4"></span>-->
<!--      <span class="tip3">-->
<!--        <i class="iconfont icon-modular"></i>-->
<!--      </span>-->
      <span class="tip3"></span>
      <span class="tip2"></span>
      <span class="tip4"></span>
      <span class="tip5"></span>
    </div>
  </van-popover>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, watch, SetupContext, computed } from "vue";
import { Popover, Dialog, Button } from "vant";
import WormTransition from "@/popup/components/wromTransition/index.vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
export default defineComponent({
  name: "guide-modal",
  components: {
    [Popover.name]: Popover,
    [Dialog.Component.name]: Dialog.Component,
    [Button.name]: Button,
    WormTransition,
  },
  props: {
    type: {
      type: Number,
      default: 8,
    },
  },
  setup(props: any, context: SetupContext) {
    const { t } = useI18n();
    const { state, dispatch } = useStore();
    const show8 = computed(() => state.system.show8);
    const handleClick = (v: number) => {
      dispatch("system/showDialog", v);
    };
    const showModal = ref(false);
    watch(
      () => show8,
      (n) => (showModal.value = n.value),
      { immediate: true, deep: true }
    );
    const beforeClose = async () => {
      const flag = await Dialog.confirm({
        className: "closeGuideModal",
        allowHtml: true,
        message: `<div class="icon-inner flex center mb-14"><i class="van-badge__wrapper van-icon van-icon-warning" style="font-size:44px;color:#f7bf03;"></i></div><div class="unboot">${t(
          "bootstrapwindow.unboot"
        )}</div>`,
      })
        .then(() => true)
        .catch(() => false);
      console.log("flag", flag);
      if (flag) {
        dispatch("system/closeGuide");
        showModal.value = false;
      }
    };
    return {
      t,
      show8,
      beforeClose,
      handleClick,
      showModal,
    };
  },
});
</script>
<style lang="scss" scoped>
.dialog-box {
  // width: 340px;
  padding-bottom: 25px;
  position: relative;
  .serial-number {
    display: flex;
    justify-content: flex-end;
    text-indent: 10px;
    padding-bottom: 14px;
    padding-right: 14px;
    font-size: 12px;
    .left {
      color: #9F54BA;
    }
  }
  .tip2 {
    position: absolute;
    top: -57px;
    height: 45px;
    padding:0 30px;
    width: 105%;
    border: 1px dashed #fff;
    border-radius: 5px;
    right:-8px;
    //left: -10px;
    border-top: none;

  }
  .tip4 {
    position: absolute;
    top: -56px;
    height: 1px;
    //padding:0 20px;
    width: 53px;
    border-bottom:  1px dashed #fff;
    border-radius: 5px;
    right: -7px;
    //left: 75px;

    border-top: none;
  }
  .tip5 {
    position: absolute;
    top: -56px;
    height: 1px;
    padding:0 20px;
    width: 245px;
    border-bottom:  1px dashed #fff;
    border-radius: 510px;
    //right: -10px;
    left: -10px;
    border-top: none;
  }
  .tip3 {
    position: absolute;
    top: -86px;
    width: 60px;
    height: 30px;
    padding:0 20px;
    // width: 320px;
    border: 1px dashed #fff;
    border-radius: 5px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    right: 45px;
    //left: 0;
    z-index: 100;
    //background: RGBA(126, 126, 126, .5);
    border-bottom: none;
  }
  @media screen and (min-width: 1000px) {
    .tip5 {
      top:-66px;
      width: 530px;
      left: -475px;

    }
    .tip2 {
      top:-67px;
      width: 740px;
      right: -15px;
      //left: 0;
    }
    .tip3 {
      top: -96px;
      right: 135px;

    }
    .tip4 {
      width: 148px;
      top:-66px;
      right: -12px;

    }
  };

  .circle {
    position: absolute;
    top: -58px;
    right: 1px;
    width: 5px;
    height: 5px;
    border-radius: 5px;
    border: 1px solid #fff;
    background: #fff;
  }
  .title {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    line-height: 30px;
    margin-top: 22px;
  }
  .small-tit {
    text-align: center;
    margin-bottom: 30px;
    font-size: 12px;
    color: #848484;
  }
  :deep {
    button {
      min-width: 100px;
    }
  }
  :deep(.van-popover__wrapper) {
    height: 0;
  }
}
</style>