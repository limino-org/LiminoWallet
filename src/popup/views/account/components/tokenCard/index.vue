<template>
  <div class="token-card flex between van-hairline--bottom " @mouseover="isMouse = true" @mouseout="isMouse = false" @click="toTokenHome">
    <div class="token-card-left flex between">
      <div class="token-icon flex center">
        <div class="icon-box flex center">
          <img src="@/assets/icon_black.svg" v-show="!isMouse" />
          <img src="@/assets/token/logowallet.png" v-show="isMouse" />
          
        </div>
      </div>
      <div class="token-info flex center f-12">{{ data.name }}</div>
    </div>
    <div class="token-card-right flex center">
      <!-- <van-icon name="arrow" /> -->
      <slot name="right">
        <div>
          <div v-show="amountType != 'mask' ">
          <div class="name text-right">{{ decimal(data.balance) }} {{ data.symbol }}</div>
        </div>
        <div class="flex center-v right f12" v-show="amountType == 'mask'">******</div>
        </div>
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import { SetupContext, Ref, ref, reactive, defineComponent, computed } from 'vue'
import { Icon, Image } from 'vant'
import { useRouter } from 'vue-router'
import { decimal } from '@/popup/utils/filters'
import { useStore } from 'vuex'
export default defineComponent({
  name: 'tokenCard',
  components: {
    [Icon.name]: Icon,
    [Image.name]: Image
  },
  props: {
    data: {
      type: Object,
      default: null
    },
    // Yes No Network icon
    networkIcon: {
      type: Boolean,
      default: false
    },
    toName: {
      type: String,
      default: 'currencyHome'
    }
  },
  setup(props: any, context: SetupContext) {
    const isMouse = ref(false)
    const store = useStore()
    const { commit } = store
    const currentNetwork = computed(() => store.state.account.currentNetwork)
    // Balance display type
    const amountType = computed(() => store.state.system.amountType)
    const router = useRouter()
    const { emit } = context
    const toTokenHome = () => {
      // Stores data for token selection
      commit('transfer/UPDATE_CHOOSETOKEN', props.data)
      router.replace({
        name: props.toName,
        query: props.data
      })
      emit('handleClick')
    }
    return {
      toTokenHome,
      decimal,
      currentNetwork,
      amountType,
      isMouse
    }
  }
})
</script>

<style lang="scss" scoped>
.token-card {
  height: 62px;
  padding-right: 14px;
  .usd-amount {
    color: #848484;
  }
  &:hover {
    transition: ease 0.3s;
    cursor: pointer;
    background: #F8F3F9;
    color:#9F54BA;
  }
  &-left {
    .token-icon {
      width: 70px;
      height: 100%;
      .icon-box {
        border-radius: 50%;
        width: 36px;
        box-sizing: border-box;
        img {
          width: 100%;
        }
      }
    }
  }
  &-right {
    font-size: 16px;
    padding: 0 0 0 16px;
    .name {
      font-size: 12px;
      line-height: 12px;
    }
    .amount {
      font-size: 12px;
      line-height: 12px;
      color: #848484;
      margin-top: 5px;
    }
  }
}
</style>
