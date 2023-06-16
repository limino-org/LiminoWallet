<template>
  <div>
    <div>
      <van-dialog
        v-model:show="showModal"
        teleport="#page-box"
        :showConfirmButton="false"
        :showCancelButton="false"
        class="guideModalGetStart"
        closeOnClickOverlay
        :before-close="beforeClose"
        :title="''"
      >
        <div class="title text-center text-bold van-hairline--bottom">{{t('bootstrapwindow.welcome')}}</div>
        <div class="flex center">
          <WormTransition size="small">
            <template v-slot:t1>
              <img class="icon" src alt />
            </template>
            <template v-slot:t2>
              <img class="icon" src alt />
            </template>
            <template v-slot:t3>
              <img class="icon" src alt />
            </template>
            <template v-slot:icon>
              <span class="wromIcon">
                <img class="wromIcon" src="@/assets/logo1.png" alt />
              </span>
            </template>
          </WormTransition>
        </div>

        <div class="small-tit text-center text-bold f-24">{{t('bootstrapwindow.wormHoles')}}</div>
        <div class="tip f-12 lh-16 text-center pl-24 pr-24 mt-12 mb-12">{{t('bootstrapwindow.wormHolesMessage')}}</div>
        <div class="flex center pb-30 pl-14 pr-14 mt-20">
          <van-button type="primary" @click="handleClick(0)">{{t('bootstrapwindow.getStared')}}</van-button>
        </div>
      </van-dialog>
    </div>
    <div>
      <van-dialog
        v-model:show="showModal2"
        teleport="#page-box"
        :showConfirmButton="false"
        :showCancelButton="false"
        closeOnClickOverlay
        :title="''"
      >
        <div class="title text-center  bold van-hairline--bottom">{{t('bootstrapwindow.welcome')}}</div>

        <div class="flex center">
          <WormTransition size="small">
            <template v-slot:icon>
              <span class="wromIcon">
                <img class="wromIcon" src="@/assets/logo1.png" alt />
              </span>
            </template>
          </WormTransition>
        </div>
        <div class="small-tit text-center text-bold f-24">{{t('bootstrapwindow.wormHoles')}}</div>
        <div class="tip f-12 lh-16 text-center pl-24 pr-24 mt-12 mb-12">{{t('bootstrapwindow.wormHolesMessageEnd')}}</div>
        <div class="flex center pb-30 pl-14 pr-14 mt-20">
          <van-button type="primary" @click="complete">{{t('bootstrapwindow.okay')}}</van-button>
        </div>
      </van-dialog>
    </div>
  </div>
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
      default: 0
    }
  },
  setup(props: any, context: SetupContext) {
    const { t } = useI18n()
    const showModal: Ref<boolean> = ref(false)
    const showModal2: Ref<boolean> = ref(false)
    const { state, dispatch, getters, commit } = useStore()
    // commit('system/UPDATE_GUIDEFLAG', false)
    const show0 = computed(() => getters['system/getGuideModal'])
    const show16 = computed(() => state.system.show16)
    watch(
      () => show0,
      n => {
        showModal.value = n.value
      },
      {
        immediate: true,
        deep: true
      }
    )
    watch(
      () => show16,
      n => {
        showModal2.value = n.value
      },
      {
        immediate: true,
        deep: true
      }
    )
    const handleClick = (v: number) => {
      dispatch('system/showDialog', v)
      if (v == 0) {
        showModal.value = false
      }
    }
    const complete = () => {
      dispatch('system/showDialog', 16)
      showModal2.value = false
    }

    const beforeClose = async () => {
      console.log(Dialog.confirm)
      //   debugger

      try {
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
      } catch (err) {
        console.error(err)
      }
    }
    return {
      t,
      showModal,
      show0,
      handleClick,
      showModal2,
      complete,
      beforeClose
    }
  }
})
</script>
<style lang="scss" scoped>
.title {
  color: #000;
  font-size: 15px;
  line-height: 62px;
  background: #F8F3F9;
  font-weight: bold;

}
.tip {
  color: #848484;
}
.small-tit {
  margin-top: 20px;
}
.savebtn {
  width: 250px;
  background: #F8F3F9;
  border-radius: 30px;
  color: #9F54BA;
  i {
    font-size: 12px;
  }
  &:hover {
    background: #F8F3F9;
  }
}
:deep(.icon-box) {
  margin-top: 20px;
}

.wromIcon {
  width: 18px;
}
</style>