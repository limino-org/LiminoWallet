<template>
  <div class="modif-name-modal">
    <van-dialog
      v-model:show="showModal"
      teleport="#page-box"
      class="modifNameModal"
      :showConfirmButton="false"
      :showCancelButton="false"
      closeOnClickOverlay
      :title="''"
    >
      <div class="title text-center text-bold van-hairline--bottom">{{ $t('account.accountNameModific') }}</div>

      <div class="ml-14 mr-14 mt-20">
        <van-form @submit="onSubmit">
          <div class="label">{{t('account.accountname')}} ({{name.length}} / 25)</div>
          <div class="position relative">
            <van-field
            v-model="name"
            maxlength="25"
            :placeholder="t('account.placeholder')"
            :rules="[{ required: true, message: t('account.message') }]"
            ref="ipt"
          />
            <van-icon name="cross" v-show="name" class="closeIcon" @click="name = ''" />
          </div>
          <div class="flex between btn-box mb-30 mt-20">
            <van-button plain @click="cancel">{{ t("network.cancel") }}</van-button>
            <van-button type="primary" native-type="submit">{{ t("network.confirm") }}</van-button>
          </div>
        </van-form>
      </div>
    </van-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, Ref, watch, SetupContext, reactive, onMounted } from 'vue'
import { Dialog, Field, Form, Button, Toast,Icon } from 'vant'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { useBroadCast } from '@/popup/utils/broadCost'

export default defineComponent({
  name: 'modif-name-modal',
  components: {
    [Dialog.Component.name]: Dialog.Component,
    [Field.name]: Field,
    [Form.name]: Form,
    [Button.name]: Button,
    [Icon.name]:Icon
  },
  props: {
    title: {
      type: String,
      default: 'Account Name Modific'
    },
    modelValue: {
      type: Boolean,
      default: false
    },
    // qr code data
    data: {
      type: Object,
      default: {}
    }
  },
  setup(props: any, context: SetupContext) {
    const { emit }: any = context
    const showModal: Ref<boolean> = ref(false)
    const { t } = useI18n()
    const { dispatch } = useStore()
    const name = ref(props.data.name)
    const ipt = ref(null)
    // Listen to the broadcast of the same source window
    const { handleUpdate } = useBroadCast()

    watch(
      () => props.modelValue,
      n => {
        showModal.value = n
        if (n) {
          name.value = props.data.name
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
    const onSubmit = async() => {
      await dispatch('account/setAccountName', {
        address: props.data.address,
        name: name.value
      })
      handleUpdate()
      Toast(t('account.successful'))
      cancel()
    }

    const cancel = () => {
      showModal.value = false
    }
    return {
      showModal,
      name,
      cancel,
      onSubmit,
      t,
      ipt
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
.closeIcon {
  position: absolute;
  right: 10px;
  top: 12px;
  font-size: 14px;
  &:hover{
    color: #9F54BA !important;
  }
}
.label {
  font-size: 12px;
  line-height: 16px;
  margin-bottom: 10px;
  color: #B3B3B3;
}
.btn-box {
  padding: 0 35px;
  button {
    width: 100px;
  }
}
:deep(.van-field__label) {
  display: none;
}
:deep(.van-field__error-message) {
  margin-bottom: 12px;
}
:deep(.van-cell:after) {
  display: none;
}
:deep(.van-cell) {
  padding: 0;
}
:deep(.van-field__body) {
  height: 38px;
  border: 1PX solid #adb8c5;
  margin-bottom: 10px;
  padding: 0 10px;
  border-radius: 5px;
  transition: ease 0.3s;
  &:hover {
    border: 1PX solid #9F54BA;
  }
}
</style>
