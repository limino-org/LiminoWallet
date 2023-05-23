
<template>
  <van-popover
    v-model:show="showModal"
    @click-overlay="beforeClose"
    :close-on-click-overlay="false"
    trigger="manual"
    class="popover-dialog step6 "
    placement="bottom-start"
    teleport="#page-box"
    overlay
  >
    <div class="dialog-box">
      <div class="serial-number">
        <span class="left">6</span> <span>/</span> 12
      </div>
      <div class="title">
        {{ t("bootstrapwindow.tOKENs") }}
      </div>
      <div class="small-tit pl-30 pr-30 mt-20">
        {{ t("bootstrapwindow.tOKENsMessage") }}
      </div>
      <div class="flex center">
        <van-button type="primary" @click="handleClick(6)">{{
          t("bootstrapwindow.next")
        }}</van-button>
      </div>
            <span class="tip3"></span>
            <span class="tip2"></span>
            <span class="tip4"></span>
            <span class="tip5"></span>
<!--      <span class="tip2 f-12">-->
<!--        {{ t("bootstrapwindow.displaymethod") }}-->
<!--      </span>-->

<!--      <span class="tip3">-->
<!--        <i class="iconfont icon-modular"></i>-->
<!--      </span>-->
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
      default: 6,
    },
  },
  setup(props: any, context: SetupContext) {
    const { t } = useI18n();
    const { state, dispatch } = useStore();
    const show6 = computed(() => state.system.show6);
    const showModal = ref(false);
    const boxWidth = ref("");
    watch(
      () => show6,
      (n) => (showModal.value = n.value),
      { immediate: true, deep: true }
    );

    const handleClick = (v: number) => {
      dispatch("system/showDialog", v);
    };
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
      show6,
      beforeClose,
      handleClick,
      showModal,
    };
  },
});
</script>
<style lang="scss" scoped>
.step6 {
  margin-top: 40px;
}
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
    right: 0;
    left: -10px;
    border-top: none;

  }
  .tip4 {
    position: absolute;
    top: -56px;
    height: 1px;
    //padding:0 20px;
    width: 58px;
    border-bottom:  1px dashed #fff;
    border-radius: 5px;
    right: 0;
    left: -10px;
    border-top: none;
  }
  .tip5 {
    position: absolute;
    top: -56px;
    height: 1px;
    padding:0 20px;
     width: 241px;
    border-bottom:  1px dashed #fff;
    border-radius: 510px;
    right: 1px;
    left: 104px;
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
    right: 0;
    left: 46px;
    z-index: 100;
    //background: RGBA(126, 126, 126, .5);
    border-bottom: none;
  }
  @media screen and (min-width: 1000px) {
    .tip5 {
      top:-66px;
      width: 590px;
      left: 135px;

    }
    .tip2 {
      top:-67px;
      width: 740px;
      left: -15px;
      //right: -15px;
      //left: 0;
    }
    .tip3 {
      top: -96px;
      left: 75px;

    }
    .tip4 {
      width: 90px;
      top:-66px;
      //right: -12px;
      left: -15px;
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