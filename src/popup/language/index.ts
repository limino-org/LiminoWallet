
//@ts-nocheck
import en from './en/index.json5'
import zh from './zh/index.json5'
import { createI18n } from 'vue-i18n'
import { Locale } from 'vant';
import enUS from 'vant/es/locale/lang/en-US';
import zhCN from 'vant/es/locale/lang/zh-CN';
import storeObj from '../store';
import localforage from 'localforage';
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
  fallbackLocale,
  globalInjection: false,
  locale: fallbackLocale,
  legacy: false, 
  messages,
});
console.log('i18n 0', i18n)
localforage.getItem('vuex').then(store => {
  const fallbackLocale = store ? store.system.language : 'en'
  console.log('fallbackLocale', fallbackLocale)
  storeObj.dispatch('system/setLanguage', fallbackLocale)
  Locale.use(vantLangs[fallbackLocale].value, vantLangs[fallbackLocale]['package']);
  i18n.global.locale = fallbackLocale
  console.log('i18n 1', i18n)
})

export default i18n