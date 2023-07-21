<template>
  <van-overlay class="switch-network-modal flex center" :show="showModalNetwork" @click="showModalNetwork = false">
    <div class="switch-net-con">
      <div class="title text-center text-bold">{{ t("internet.title") }}</div>
      <div class="activited-net">
        <div class="main-tit">{{ t("common.mainNetwork") }}</div>
        <NetWorkCard :data="mainNetwork" @handleClick="handleChooseComfirm(mainNetwork)" />
      </div>
      <div class="other-list" v-if="netWorkList.length">
        <div class="other-list-tit">{{ t("internet.othertitle") }}</div>
        <div class="other-list-box scrollBar">
          <NetWorkCard v-for="item in netWorkList" :select="item.select" :key="item.value" :data="item" @handleClick="handleChooseComfirm(item)" />
        </div>
      </div>
      <div class="flex center pt-24 pb-24 btn-box">
        <van-button plain @click="emitClose">{{ t('network.close') }}</van-button>
      </div>
    </div>

  </van-overlay>
</template>

<script lang="ts">
import { Dialog, Button, Overlay } from 'vant'
import NetWorkCard from '../netWorkCard/index.vue'
import { defineComponent, Ref, ref, watch, SetupContext } from 'vue'
import { useNetWork } from '@/popup/components/navHeader/hooks/netWork'
import { useI18n } from 'vue-i18n'
export default defineComponent({
  name: 'switchnetwork',
  components: {
    [Button.name]: Button,
    [Dialog.Component.name]: Dialog.Component,
    [Overlay.name]: Overlay,
    NetWorkCard
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  setup(props: any, context: SetupContext) {
    const { t } = useI18n()
    const { emit } = context
    const { netWorkList, currentNetwork, showModalNetwork, chooseNetWork, handleChooseComfirm, mainNetwork, networkLoading } = useNetWork()
    watch(
      () => props.modelValue,
      n => {
        showModalNetwork.value = n
      }
    )
    watch(
      () => showModalNetwork.value,
      n => {
        if (!n) {
          emit('update:modelValue', false)
        }
      }
    )
    const emitClose = () => {
      emit('update:modelValue', false)
    }
    return {
      t,
      netWorkList,
      currentNetwork,
      chooseNetWork,
      handleChooseComfirm,
      showModalNetwork,
      emitClose,
      networkLoading,
      mainNetwork
    }
  }
})
</script>

<style lang="scss" scoped>
.switch-net-con {
  background: #fff;
  width: 320px;
  max-height: 520px;
  border-radius: 12px;
  overflow: hidden;
}

.title {
  border-bottom: 1px solid #E4E7E8;
}

.title {
  color: #000;
  font-size: 15px;
  line-height: 62px;
  background: #F8F3F9;
  font-weight: bold;

}

.main-tit {
  font-size: 12px;
  padding: 0 18px;
  line-height: 40px;
  color: #8F8F8F;
}

:deep(.van-button) {
  width: 100px;
  margin: 2px 0 0;
}
</style>