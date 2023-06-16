<template>
  <van-popover
    v-model:show="showModal"
    @click-overlay="beforeClose"
    :close-on-click-overlay="false"
    trigger="manual"
    class="popover-dialog step1"
    placement="bottom-start"
    teleport="#page-box"
    overlay
  >
    <div class="dialog-box" v-if="show1">
      <div class="serial-number">
        <span class="left">1</span>
        <span>/</span> 12
      </div>
      <div class="title">{{t('bootstrapwindow.accout')}}</div>
      <div class="small-tit pl-30 pr-30 mt-20">{{t('bootstrapwindow.accountMessage')}}</div>
      <div class="flex center">
        <van-button type="primary" @click="handleClick(1)">{{t('bootstrapwindow.next')}}</van-button>
      </div>
      <span class="tip2 f-12">{{t('bootstrapwindow.exitprompt')}}</span>
    </div>
  </van-popover>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, watch, SetupContext, computed } from 'vue'
import { Popover, Dialog, Button } from 'vant'
import WormTransition from '@/popup/components/wromTransition/index.vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
export default defineComponent({
  name: 'guide-modal',
  components: {
    [Popover.name]: Popover,
    [Dialog.Component.name]: Dialog.Component,
    [Button.name]: Button,
    WormTransition
  },
  props: {
    type: {
      type: Number,
      default: 1
    }
  },
  setup(props: any, context: SetupContext) {
    const { t } = useI18n()
    const { state, dispatch } = useStore()
    const showModal = ref(false)
    const show1 = computed(() => state.system.show1)
    watch(
      () => show1,
      n => (showModal.value = n.value),
      { immediate: true, deep: true }
    )
    const handleClick = (v: number) => {
      dispatch('system/showDialog', v)
    }
    const beforeClose = async () => {
      const flag = await Dialog.confirm({
        className: 'closeGuideModal',
        allowHtml: true,
        message: `<div class="icon-inner flex center mb-14"><i class="van-badge__wrapper van-icon van-icon-warning" style="font-size:44px;color:#f7bf03;"></i></div><div class="unboot">${t('bootstrapwindow.unboot')}</div>`

      })
        .then(() => true)
        .catch(() => false)
      console.log('flag', flag)
      if (flag) {
        dispatch('system/closeGuide')
        showModal.value = false
      }
    }
    return {
      t,
      show1,
      handleClick,
      showModal,
      beforeClose
    }
  }
})
</script>
<style lang="scss" scoped>
.dialog-box {
  // max-width: 340px;
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
    bottom: -100px;
    color: #fff;
  }

  .title {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    line-height: 30px;
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