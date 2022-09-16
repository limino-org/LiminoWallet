<template>
  <van-sticky>
    <NavHeader title="Close" :hasRight="true">
      <template v-slot:title>
        <div class="flex center title">{{ $t("castingnft.createNFT") }}</div>
      </template>
    </NavHeader>
  </van-sticky>
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
  name: "pageCreateNFT",
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

    return {
      route,
      t,
    };
  },
};
</script>