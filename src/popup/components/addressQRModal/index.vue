<template>
  <div class="addqrcode-modal">
    <van-dialog
      v-model:show="showModal"
      teleport="#page-box"
      :showConfirmButton="false"
      :showCancelButton="false"
      closeOnClickOverlay
      :title="''"
    >
      <div class="title text-center text-bold van-hairline--bottom">{{ $t('mnemonic.backup') }}</div>
      <div id="qrcode" class="flex center mb-24 mt-20">
        <div class="code-box flex center">
          <qrcode-vue :value="codeData" class="code" :size="size" :level="level" ref="coderef"></qrcode-vue>
        </div>
      </div>
      <div class="flex center pb-24">
        <div class="pl-8 pr-8 clickActive savebtn lh-30 text-center van-ellipsis">{{ data }}</div>
      </div>
      <!-- Copy share button -->
      <div class="flex center mt-20 btn-group">
        <div class="btn-box">
          <div class="flex center">
            <div class="btn flex center" @click="toCopy">
            <i class="iconfont icon-fuzhi2"></i>
          </div>
        </div>
          <div class="text-center text text-bold mt-4">{{t('send.copy')}}</div>
     
        </div>
      </div>
    </van-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, Ref, watch, SetupContext, reactive, computed } from 'vue'
import { Dialog, Toast } from 'vant'
import QrcodeVue from 'qrcode.vue'
import { downloadBase64Img } from '@/popup/utils/utils'
import useClipboard from 'vue-clipboard3'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/popup/plugins/toast'

export default defineComponent({
  name: 'qrcode-modal',
  components: {
    [Dialog.Component.name]: Dialog.Component,
    QrcodeVue
  },
  props: {
    // Popup window title
    title: {
      type: String,
      default: 'Back up QR code'
    },
    // v-model Mode binding open close
    modelValue: {
      type: Boolean,
      default: false
    },
    // qr code data
    data: {
      type: String || Number,
      default: ''
    },
    // complexity
    level: {
      type: String,
      default: 'L'
    },
    // size
    size: {
      type: Number,
      default: 300
    }
  },
  setup(props: any, context: SetupContext) {
    const { emit }: any = context
    const coderef = reactive({})
    const showModal: Ref<boolean> = ref(false)
    const { t } = useI18n()
    const { $toast } = useToast()
    watch(
      () => props.modelValue,
      n => {
        showModal.value = n
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
    // Copy user address
    const { toClipboard } = useClipboard()
    const toCopy = async () => {
      try {
        await toClipboard(`${props.data}`)
        // console.log(accountInfo.value.address)
        $toast.success(t('copy.title'))
      } catch (e) {
        console.error(e)
      }
    }

    const codeData = computed(() => {
      return JSON.stringify({
        data: props.data,
        type: 'address'
      })
    })
    const download = () => {
      downloadBase64Img()
    }
    return {
      codeData,
      t,
      showModal,
      download,
      coderef,
      toCopy
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
.savebtn {
  width: 250px;
  background: #f1f3f4;
  border-radius: 30px;
  box-sizing: border-box;
  font-size: 12px;
  i {
    font-size: 12px;
  }
  &:hover {
    background: #F8F3F9;
    color: #666;
  }
}
.code {
  width: 230px !important;
  height: 230px !important;
}
.code-box {
  width: 250px;
  height: 250px;
  border: 7px solid #000;
  padding: 1px;
}
.btn-group {
  width: 300px;
  margin: 0 auto 20px;
}
.btn-box {
  .btn {
    width: 34px;
    height: 34px;
    box-sizing: border-box;
    border-radius: 17px;
    border: 1PX solid #9F54BA;
    cursor: pointer;
    &:hover {
      background: #9F54BA;
      i {
        color: #fff;
      }
    }
    i {
      font-size: 18px;
      color: #9F54BA;
    }
  }
  .text {
    color: #9F54BA;
    font-size: 12px;
  }
}
</style>
