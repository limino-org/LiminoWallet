
<template>
  <van-popover
    @click-overlay="beforeClose"
    :close-on-click-overlay="false"
    v-model:show="showModal"
    trigger="manual"
    class="popover-dialog step10"
    placement="bottom-end"
    teleport="#page-box"
    overlay
  >
    <div class="dialog-box">
      <div class="serial-number">
        <span class="left">9</span> <span>/</span> 12
      </div>
      <div class="title">
        {{ t("bootstrapwindow.identifier") }}
      </div>
      <div class="small-tit pl-30 pr-30 mt-20">
        {{ t("bootstrapwindow.identifierMessage") }}
      </div>
      <span class="tip4">
        <i class=" user iconfont icon-fangwujianzhuwugoujianbeifen"></i>
        <!-- <img class="user" src="@/popup/views/home/imgs/smallhome.png" alt="" /> -->
      </span>
      <div class="flex center">
        <van-button type="primary" @click="handleClick(10)">{{
          t("bootstrapwindow.next")
        }}</van-button>
      </div>
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
      default: 10,
    },
  },
  setup(props: any, context: SetupContext) {
    const { t } = useI18n();
    const { state, dispatch } = useStore();
    const show10 = computed(() => state.system.show10);
    const handleClick = (v: number) => {
      dispatch("system/showDialog", v);
    };
    const showModal = ref(false);
    watch(
      () => show10,
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
      show10,
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
  .title {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    line-height: 30px;
    margin-top: 22px;
  }
  .tip4 {
    position: absolute;
    top: -20px;
    height: 12px;
    right: 20px;
    .user {
      font-size: 12px;
      color: #fff;
    }
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