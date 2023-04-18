<template>
    <NavHeader :title="name" :hasRight="route.name =='transactionDetails-step1' ? false : true" backUrl="wallet">
    </NavHeader>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
<script lang="ts">
import { Icon, Button, Sticky, Field } from "vant";
import NavHeader from "@/popup/components/navHeader/index.vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import Vue, { computed } from "vue";
import { useStore } from 'vuex';
export default {
  name: "pageMnemonic",
  components: {
    [Icon.name]: Icon,
    [Button.name]: Button,
    [Sticky.name]: Sticky,
    NavHeader,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { t } = useI18n();
    const {state} = useStore()
    const clickLeft = () => {
      router.back();
    };
    const coinType = computed(() => state.account.coinType)
    const name = computed(() => {
      if(coinType.value.value == 0) {
        return route.query.name
      }
      if(coinType.value.value == 1) {
        return coinType.value.name
      }
    })
    return {
      route,
      name,
      clickLeft,
      t,
    };
  },
};
</script>