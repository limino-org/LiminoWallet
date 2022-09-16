
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
        <span class="left">8</span> <span>/</span> 13
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
      <span class="tip2 f-12">
        {{ t("bootstrapwindow.displaymethod") }}
      </span>
      <span class="circle"></span>
      <span class="tip4"></span>
      <span class="tip3">
        <i class="iconfont icon-modular"></i>
      </span>
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
    font-size: 12px;
    .left {
      color: #037cd6;
    }
  }
  .tip2 {
    position: absolute;
    top: -69px;
    color: #fff;
    right: 10px;
  }
  .tip3 {
    border: 1px dashed #fff;
    width: 35px;
    height: 35px;
    position: absolute;
    top: -45px;
    color: #fff;
    right: -10px;
    border-radius: 5px;
    line-height: 30px;
    text-align: center;
  }
  .tip4 {
    position: absolute;
    top: -55px;
    height: 12px;
    right: 2px;
    color: #fff;
    border: 1px solid #fff;
  }
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
    margin-top: 44px;
  }
  .small-tit {
    text-align: center;
    margin-bottom: 50px;
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