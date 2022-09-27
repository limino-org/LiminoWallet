<template>
  <!-- <van-sticky>
    <NavHeader title="LiminoWallet" :hasRight="false" :hasLeft="hasLeft">
    </NavHeader>
  </van-sticky> -->
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
<script lang="ts">
import { Icon, Toast, Button, Sticky, Field } from "vant";
import NavHeader from "@/popup/components/navHeader/index.vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import Vue, { computed } from "vue";
export default {
  name: "pageCreateAccount",
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
    const hasLeft = computed(() => {
      if(route.name == 'loginAccount-step1' || route.name == 'loginAccount-start-page'){
        return false
      }
      return true
    })
    return {
      route,
      t,
      hasLeft
    };
  },
};
</script>