<template>
  <!-- <van-sticky>
    <NavHeader title="Close" :hasRight="hasRight" :hasLeft="true" backUrl="backUrl" :backReplaceName="replaceBackUrl" cancelRouteName="wallet">
      <template v-slot:title>
        <div class="flex center title">{{t('receive.receive')}}</div>
      </template>
    </NavHeader>
  </van-sticky> -->
  <div class="">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>
<script lang="ts">
import Vue, { computed, ref } from "vue";
import { Icon, Toast, Button, Sticky, Field } from "vant";
import NavHeader from "@/popup/components/navHeader/index.vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

export default {
  name: "page-receive",
  components: {
    [Sticky.name]: Sticky,
    [Icon.name]: Icon,
    NavHeader,
  },
  setup() {
    const { t } = useI18n();
    const route: any = useRoute();
    // Filter out pages that do not display on the right
    const filter = ["receive-choose-code", "receive-choose"];
    // The Cancel button on the right is displayed dynamically according to the route
    const hasRight = computed(() => {
      if (filter.includes(route.name || "")) {
        return true;
      }
      return false;
    });

    // Click the return button to jump to the route name
    const { query } = useRoute()
    const { clickBackUrl } = query
    const replaceBackUrl = ref(clickBackUrl || '')

    return {
      replaceBackUrl,
      t,
      hasRight,
    };
  },
};
</script>