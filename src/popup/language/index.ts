
//@ts-nocheck
import en from './en/index.json5'
import zh from './zh/index.json5'
import { createI18n } from 'vue-i18n'
import { Locale } from 'vant';
import enUS from 'vant/es/locale/lang/en-US';
import zhCN from 'vant/es/locale/lang/zh-CN';
import storeObj from '../store';
import localforage from 'localforage';
import { ref } from 'vue';
const messages = {
    zh,
    en,
}
const fallbackLocale = 'zh'
export const vantLangs = {
  'zh': {
    value: 'zh-CN',
    package: zhCN
  },
  'en': {
    value: 'en-US',
    package: enUS
  }
}

const i18n:any = createI18n({
  silentFallbackWarn: true,
  legacy: false,
  fallbackLocale,
  globalInjection: true,
  locale: ref(fallbackLocale),
  messages,
});
console.log('i18n 0', i18n)
localforage.getItem('vuex').then(store => {
  const fallbackLocale = store ? store.system.language : 'en'
  console.log('fallbackLocale', fallbackLocale)
  storeObj.dispatch('system/setLanguage', fallbackLocale)
  Locale.use(vantLangs[fallbackLocale].value, vantLangs[fallbackLocale]['package']);
  i18n.global.locale.value = fallbackLocale

})

export default i18n