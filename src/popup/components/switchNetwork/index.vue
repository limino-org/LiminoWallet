<template>
  <van-overlay class="switch-network-modal" :show="showModalNetwork" @click="showModalNetwork = false">
    <div class=" flex center switch-network-modal-box">
      <div class="switch-net-con">
      <div class="title text-center text-bold">{{ t("internet.title") }}</div>
    <div class="activited-net">
      <div class="main-tit">{{t("common.mainNetwork")}}</div>
      <NetWorkCard :data="mainNetwork" @handleClick="handleChooseComfirm(mainNetwork)" />
    </div>
    <div class="other-list" v-if="netWorkList.length">
      <div class="other-list-tit">{{ t("internet.othertitle") }}</div>
      <div class="other-list-box">
        <NetWorkCard
          v-for="item in netWorkList"
          :select="item.select"
          :key="item.value"
          :data="item"
          @handleClick="handleChooseComfirm(item)"
        />
      </div>
    </div>

    <div class="flex center pt-24 pb-24 btn-box">
      <van-button plain @click="emitClose">{{t('network.close')}}</van-button>
    </div>
    </div>
    </div>
  </van-overlay>
</template>

<script lang="ts">
import { Button, Overlay } from 'vant'
import {Dialog} from '@vant/compat'
import NetWorkCard from '../netWorkCard/index.vue'
import { defineComponent, Ref, ref, watch, SetupContext, computed } from 'vue'
// @ts-ignore
import { useNetWork } from '@/popup/components/navHeader/hooks/netWork'
import { useI18n } from 'vue-i18n'
import { getNetworkList } from '@/popup/store/db'
import { useStore } from 'vuex'
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
    const { showModalNetwork, chooseNetWork, handleChooseComfirm, networkLoading } = useNetWork()
    const store = useStore()
    const currentNetwork = computed(() => store.state.account.currentNetwork)
    const mainNetwork = ref({})
    const netWorkList = ref([])
    watch(
      () => props.modelValue,
      n => {
        showModalNetwork.value = n
        getNetworkList(store.state.account.coinType.name).then(res => {
          console.log('netlist', res, currentNetwork.value)
          // @ts-ignore
          netWorkList.value = res.filter((item: any) => {
            if(!item.isMain){
              item.id == currentNetwork.value.id ? item.select = true : item.select = false
              return item
            }
          })
          console.log('netWorkList.value', netWorkList.value)
          mainNetwork.value = res.filter((item: any) => {
            if(item.isMain){
              item.id == currentNetwork.value.id ?item.select = true:item.select = false
              return item
            }
          })[0]
          console.log('mainNetwork.value', mainNetwork.value)

          console.warn('res', res)
          console.warn('mainNetwork', mainNetwork.value)
        })
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
.switch-network-modal {
  &-box {
    width: 100vw;
    height: 100vh;
  }
}
.switch-net-con {
  background: #fff;
  width:320px;
  max-height: 420px;
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
  background: #f8fcff;
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