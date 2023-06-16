<template>
  <van-sticky>
    <NavHeader :title="t('sidebar.settings')" :hasRight="true" :backUrl="backUrl"></NavHeader>
  </van-sticky>
  <div class="language">
    <div class="list flex between">
      <div
        :class="`card clickActive flex between column ${lang == item.value ? 'active' : ''}`"
        v-for="item in langs"
        :key="item.value"
        @click="setLanguage(item)"
      >
        <div class="tit">{{item.info}}</div>
        <div class="tit2">{{item.label}}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue, { computed, reactive } from 'vue'
import { Icon, Toast, Button, Sticky, Field, Dialog } from 'vant'
import { useRoute, useRouter } from 'vue-router'
import { Language, languages } from '@/popup/enum/language'
import { defineComponent, Ref, ref, watch, SetupContext } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { vantLangs } from '@/popup/language/index'
import { Locale } from 'vant'

export default {
  name: 'language',
  components: {
    [Icon.name]: Icon,
    [Button.name]: Button,
    [Dialog.Component.name]: Dialog.Component
  },
  setup(props: any, context: SetupContext) {
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
    return {
      langs,
      setLanguage,
      lang
    }
  }
}
</script>
<style lang="scss" scoped>
.language {
  padding-bottom: 100px;
  .list {
    padding: 15px;
  }
  .card {
    width: 48%;
    padding: 15px;
    height: 80px;
    border: 1PX solid rgba(240, 240, 240, 1);
    box-sizing: border-box;
    transition: ease 0.2s;
    &:hover {
      color: #9F54BA;
    }
    &.active {
      border: 1PX solid #9F54BA;
    }
    .tit {
      font-size: 12px;
      line-height: 14px;
    }
    .tit2 {
      font-size: 16px;
      line-height: 18px;
      font-weight: bold;
    }
  }
}
</style>