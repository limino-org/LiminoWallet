<template>
  <NavHeader :title="t('sendNFT.sendNFT')" :hasRight="route.name =='false' ? false : true"></NavHeader>
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
import Vue from "vue";
export default {
  name: "pageNft",
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
    const clickLeft = () => {
      router.back();
    };
    return {
      route,
      clickLeft,
      t,
    };
  },
};
</script>