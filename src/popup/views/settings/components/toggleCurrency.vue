<template>
  <div class="toggle-currency-modal">
    <van-dialog
      v-model:show="showModal"
      teleport="#page-box"
      :showConfirmButton="false"
      :showCancelButton="false"
      closeOnClickOverlay
      :title="''"
    >
      <div class="title text-center text-bold van-hairline--bottom">{{ $t('setting.currencyConversion') }}</div>
      <div class="languages-list">
        <div
          class="language-card flex between border-bottom clickActive"
          v-for="item in langs"
          :key="item.value"
          @click="setLanguage(item)"
        >
          <div class="flex">
            <div class="net-status flex center">
              <i :class="`iconfont ${
                lang == item.value ? 'icon-xuanzhong1' : 'icon-danxuanxuanzhong'
              }`"></i>
            </div>

            <div class="net-name">{{ item.label }}</div>
          </div>

          <div class="flex center">
            <i class="iconfont icon-duihao" v-show="lang == item.value"></i>
          </div>
        </div>
      </div>
      <div class="pl-14 pr-14 mt-20">
        <div class="btn-groups">
          <div class="container flex cenetr pl-28 pr-28">
            <van-button plain @click="cancel" block>{{t('send.cancel')}}</van-button>
          </div>
        </div>
      </div>
    </van-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, Ref, watch, SetupContext, reactive, computed } from 'vue'
import { Dialog, Field, Form, Button, Toast } from 'vant'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { Language, languages } from '@/popup/enum/language'
import { vantLangs } from '@/popup/language/index'
import { Locale } from 'vant'

export default defineComponent({
  name: 'toggle-currency-modal',
  components: {
    [Dialog.Component.name]: Dialog.Component,
    [Field.name]: Field,
    [Form.name]: Form,
    [Button.name]: Button
  },
  props: {
    title: {
      type: String,
      default: 'Currency Conversion'
    },
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  setup(props: any, context: SetupContext) {
    const { emit }: any = context
    const showModal: Ref<boolean> = ref(false)
    const { t } = useI18n()
    const { locale } = useI18n()
    const store = useStore()
    const { dispatch, state } = store
    const lang = computed(() => state.system.language)
    const setLanguage = (item: Language) => {
      const { value } = item
      locale.value = value
      // @ts-ignore
      Locale.use(vantLangs[value].value, vantLangs['package'])
      dispatch('system/setLanguage', value)
    }
    const langs = reactive(languages)

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
    const onSubmit = () => {
      Toast(t('account.successful'))
      cancel()
    }

    const cancel = () => {
      showModal.value = false
    }

    const handleClick = () => {}
    return {
      showModal,
      cancel,
      onSubmit,
      langs,
      setLanguage,
      lang,
      handleClick,
      t
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
.label {
  font-size: 12px;
  line-height: 16px;
  margin-bottom: 10px;
}
.btn-groups {
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
.language-card {
  padding: 0 13px;
  height: 52px;
  transition: ease 0.3s;
  &:hover {
    background: #F8F3F9;
  }
  .net-status {
    width: 20px;
    color: #ccc;
    i {
      color: #9F54BA;
      font-size: 16px;
    }
    i.icon-xuanzhong1 {
      font-size: 18px;
    }
  }
  .net-name {
    line-height: 52px;
    margin-left: 13px;
    font-size: 13px;
  }
  .net-icon {
    margin-left: 18px;
    &-box {
      width: 13px;
      height: 13px;
      border-radius: 50%;
    }
  }
  .icon-duihao {
    color: #0dd70d;
    font-size: 16px;
  }
}
</style>
