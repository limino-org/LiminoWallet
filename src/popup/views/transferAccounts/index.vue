<template>
  <div class>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>
<script lang="ts">
import Vue, { computed, ref } from 'vue'
import { Icon, Toast, Button, Sticky, Field, Dialog } from 'vant'
import NavHeader from '@/popup/components/navHeader/index.vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

export default {
  name: 'pagetransferAccounts',
  components: {
    [Sticky.name]: Sticky,
    [Icon.name]: Icon,
    [Button.name]: Button,
    [Dialog.Component.name]: Dialog.Component,
    NavHeader
  },
  setup() {
    const { t } = useI18n()
    
    return {
      t
    }
  }
}
</script>