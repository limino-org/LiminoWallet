<template>
  <div class="resetpopup">
    <van-dialog
      v-model:show="showModal"
      teleport="#page-box"
      :showConfirmButton="false"
      :showCancelButton="false"
      closeOnClickOverlay
      :title="''"
    >
      <div class="title text-center text-bold van-hairline--bottom">{{ $t('restWallet.restWallet') }}</div>
      <div class="text-center">
        <div class="warn">
          <van-icon name="fail" />
        </div>
        <div class="content">
          <div class="tosure">
            <div>{{$t('restWallet.areyousure')}}</div>
            <div>{{$t('restWallet.eraseyourwallet')}}</div>
          </div>
          <div class="notice">
            <div>{{$t('restWallet.yourcurrentwallet')}}</div>
            <div>{{$t('restWallet.accountsandassetswillbe')}}</div>
            <div class="ft-big">{{$t('restWallet.removedfromthisapppermanently')}}</div>
            <div>{{$t('restWallet.thisactioncannotbeundone')}}</div>
          </div>
          <div class="notice">
            <div class="f-15">{{$t('restWallet.youcanONLYrecoverthiswallet')}}</div>
            <div class="f-15">
              {{$t('restWallet.withyour')}}
              <span class="ft-big">{{$t('restWallet.secretRecoveryPhrase')}}</span>
            </div>
            <div class="f-15">{{$t('restWallet.metaMaskdoesnothave')}}</div>
            <div class="f-15">{{$t('restWallet.yourSecretRecoveryPhrase')}}</div>
          </div>
        </div>
      </div>
      <div class="flex evenly pb-30 pl-16 pr-16 btn-group">
        <van-button @click="cancel">{{$t('restWallet.cancel')}}</van-button>
        <van-button color="#D73A49" :disabled="disabled" @click="handleComfirm">{{$t('restWallet.confirm')}} <span v-if="!countDownEnd">({{current.seconds}})</span></van-button>
      </div>
    </van-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, Ref, watch, SetupContext, reactive, computed, nextTick } from 'vue'
import { Dialog, Button, Field, NumberKeyboard, Toast, Icon } from 'vant'
import localforage from "localforage";
import { useCountDown } from '@vant/use';
import { useBroadCast } from '@/popup/utils/broadCost'

export default defineComponent({
  name: 'resetpopup',
  emits: ['cancel'],
  components: {
    [Dialog.Component.name]: Dialog.Component,
    [Button.name]: Button,
    [Field.name]: Field,
    [NumberKeyboard.name]: NumberKeyboard,
    [Icon.name]: Icon
  },
  props: {
    title: {
      type: String,
      default: 'Rest Wallet'
    },
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  setup(props: any, context: SetupContext) {
    const { handleUpdate } = useBroadCast()
    const { emit }: any = context
    const showModal: Ref<boolean> = ref(false)
    const ipt = ref(null)
    const amount: Ref<string> = ref('0.0')
    const countDownEnd = ref(false)
    const countDown = useCountDown({
      time: 3000,
      onFinish(){
        countDownEnd.value = true
      }
    });
    watch(
      () => props.modelValue,
      n => {
        showModal.value = n
        console.log('props', props.defaultAmount)
        amount.value = props.defaultAmount
        if(n){
          countDown.start()
        }
      },
      {
        immediate: true
      }
    )

    watch(
      () => showModal.value,
      n => {
        if (!n) {
          emit('update:modelValue', false)
        }
      }
    )
    const disabled = computed(() => {
      if(!countDownEnd.value) {
        return true
      }
      return false
    })
    const cancel = () => {
      emit('cancel')
    }
    // Reset the wallet
    const handleComfirm = async () => {
      try {
        await localforage.clear()
        handleUpdate()
        // setCookies('password','')
        location.reload()
      }catch(err) {
        console.log(err)
      }

    }
    return {
      showModal,
      amount,
      ipt,
      cancel,
      handleComfirm,
      countDownEnd,
      current:countDown.current,
      disabled
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
.warn {
  margin: 26px auto 8px;
  width: 40px;
  height: 40px;
  background-color: #d73a49;
  border-radius: 50%;
  color: #ffffff;
  font-size: 38px;
}
.btn-group {
  button {
    width: 103px;
  }
}
.content {
  padding: 0 37px;
  font-size: 15px;
  .tosure {
    font-weight: 700;
    margin-bottom: 20px;
    line-height: 22px;
  }
  .notice {
    margin-bottom: 20px;
    line-height: 20px;
    .ft-big {
      font-weight: 700;
    }
  }
}
</style>
