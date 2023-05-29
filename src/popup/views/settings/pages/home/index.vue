<template>
  <van-sticky>
    <NavHeader :title="t('sidebar.settings')" :hasNet="false" :hasRight="false"></NavHeader>
  </van-sticky>
  <div class="settings settings-index">
    <SettingClass :label="t('setting.general')">
      <template v-slot:icon>
        <i class="iconfont icon-filter2"></i>
      </template>
      <!-- <setting-card :label="t('setting.currencyConversion')" @handleClick="handleToggleCurrency" value="USD" /> -->
      <setting-card :label="t('setting.languageSelection')" @handleClick="handleToggleLanguage" :value="lang.label" />
    </SettingClass>
    <!-- Switch legal currency -->
    <ToggleCurrencyModal v-model="showCurrency" />
    <!-- Switch language Popup -->
    <ToggleLanguageModal v-model="showLanguage" />
    <SettingClass :label="t('setting.securityandPrivacy')">
      <template v-slot:icon>
        <i class="iconfont icon-suo"></i>
      </template>
      <setting-card
        :label="t('setting.privacySetting')"
        @handleClick="routerPush({name:'resetPwd-step1', query: { toName:'resetPwd-step2' }})"
      />
      <setting-card
        @handleClick="routerPush({name: 'export-privateKey'})"
        :label="t('setting.privateKey')"
      />
      <setting-card @handleClick="routerPush({name: 'recovery-phrase'})" :label="t('setting.walletSecretRecoveryPhrase')" />
    </SettingClass>

    <SettingClass :label="t('setting.networks')">
      <template v-slot:icon>
        <i class="iconfont icon-wangluo"></i>
      </template>
      <setting-card @handleClick="routerPush({name: 'networkList'})" :label="t('setting.addNetworks')" />
    </SettingClass>

    <SettingClass :label="t('setting.contacts')">
      <template v-slot:icon>
        <i class="iconfont icon-tongxunlu1"></i>
      </template>
      <setting-card @handleClick="routerPush({name:'contacts-list'})" :label="t('setting.addEditRemove')" />
    </SettingClass>
<!-- 
    <SettingClass :label="t('setting.aboutWormHoles')" @handleClick="towebsite">
      <template v-slot:icon>
        <i class="iconfont icon-zuanshi_o"></i>
      </template>
      <setting-card :label="t('setting.wormHolesIntroduction')" />
    </SettingClass> -->
    <div class="btn-groups">
      <div class="container flex center  pl-26 pr-26">
        <van-button type="primary" block :loading="loading" @click="handleClearCanche">{{ t('common.clearCanche') }}</van-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue, { computed, ref } from 'vue'
import { Icon, Toast, Button, Sticky, Field, } from 'vant'
import { useRoute, useRouter } from 'vue-router'
import SettingCard from '@/popup/views/settings/components/settingCard.vue'
import SettingClass from '@/popup/views/settings/components/settingClass.vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import NavHeader from '@/popup/components/navHeader/index.vue'
import { Language, languages } from '@/popup/enum/language'
import ToggleLanguageModal from '@/popup/views/settings/components/toggleLanguage.vue'
import ToggleCurrencyModal from '@/popup/views/settings/components/toggleCurrency.vue'
import { useToast } from '@/popup/plugins/toast'
import localforage from "localforage";
import { decode } from 'js-base64'
export default {
  name: 'settings',
  components: {
    NavHeader,
    [Icon.name]: Icon,
    [Sticky.name]:Sticky,
    [Button.name]: Button,
    SettingClass,
    SettingCard,
    ToggleLanguageModal,
    ToggleCurrencyModal
  },
  setup() {
    const { t } = useI18n()
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const {state} = store
    const clickLeft = () => {}
    const lang = computed(() => {
      const language = (navigator.language ? navigator.language : navigator.language).toLowerCase() // @ts-ignore // @ts-ignore
      const langName = language.split('-')[0] != 'zh' ? 'en' : 'zh'
      const newLang = store.state.system.language || langName
      return languages.find((item: any) => item.value == newLang)
    })
    console.warn('lang', lang.value)

    const routerPush = ({ name, query, params }: any) => {
      router.push({ name, query, params })
    }

    // Display switching language pop-up window
    const showLanguage = ref(false)
    const handleToggleLanguage = () => {
      showLanguage.value = true
    }

    // Switch legal currency
    const showCurrency = ref(false)
    const handleToggleCurrency = () => {
      showCurrency.value = true
    }
    const {$toast} = useToast()

    const towebsite = () => {
      window.open(decode('aHR0cHM6Ly93d3cud29ybWhvbGVzLmNvbS8='))
    }
    const loading = ref(false)
    const handleClearCanche = async () => {
      loading.value = true;
      try {
        localforage.iterate((value, key, iterationNumber) => {
          console.log('clear cancel', key)
          if (key !== "vuex") {
            console.log('clear cancel', key)
            localforage.removeItem(key);
          } else {
            [key, value]
          }
        });
        $toast.success(t("common.clearCancheSuccess"));
      } finally {
        loading.value = false;
      }
    };

    return {
      t,
      loading,
      handleClearCanche,
      clickLeft,
      routerPush,
      languages,
      route,
      lang,
      handleToggleLanguage,
      showLanguage,
      handleToggleCurrency,
      showCurrency,
      towebsite
    }
  }
}
</script>
<style lang="scss" scoped>

:deep(){
  .icon-wangluo {
    font-size: 16px !important;
  }
}
.settings-index {
  .settings-card {

    padding: 13px 12px 16px 14px;
    transition: ease 0.3s;
    &:hover {
      background: #F8F3F9;
    }
    .title {
      .label {
        font-size: 18px;

      }
      .icon {
        font-size: 20px;
        color: rgb(138, 133, 133);
      }
    }
    .desc {
      margin-top: 5px;
      font-size: 12px;
      color: #757d87;
      line-height: 18px;
    }
  }
}
</style>