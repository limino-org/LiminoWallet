
//@ts-nocheck
import en from './en-US/index.json5'
import zh from './zh_CN/index.json5'
import { createI18n } from 'vue-i18n'
import { useStore } from 'vuex';
import { Locale } from 'vant';
import { ref } from 'vue'
import enUS from 'vant/es/locale/lang/en-US';
import zhCN from 'vant/es/locale/lang/zh-CN';
import storeObj from '../store';
import localforage from 'localforage';
// Locale.use('en-US', enUS);
// const store = localforage.getItem('vuex') ? JSON.parse(localStorage.getItem('vuex') || '') : null
// localforage.getItem('vuex').then()
const messages = {
    zh,
    en,
}

const fallbackLocale = 'en'

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


const i18n = createI18n({
  silentFallbackWarn: true,
  fallbackLocale,
  globalInjection: true,
  locale: fallbackLocale,
  messages,
});
console.warn('i18n----------------', i18n.global.t('wallet.cancel'))
console.warn('messages----------------', messages)
localforage.getItem('vuex').then(store => {
  // @ts-ignore
  const fallbackLocale = store ? store.system.language : 'en'
  sessionStorage.setItem('systemLang',fallbackLocale)
  storeObj.dispatch('system/setLanguage', fallbackLocale)
  Locale.use(vantLangs[fallbackLocale].value, vantLangs[fallbackLocale]['package']);
  i18n.global.locale = fallbackLocale
})

export default i18n