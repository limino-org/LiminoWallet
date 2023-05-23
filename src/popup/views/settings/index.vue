<template>
  <div class="settings">
    <div class="">
      <router-view />
    </div>
  </div>
</template>
<script lang="ts">
import Vue, { computed, ref } from "vue";
import { Icon, Toast, Button, Sticky, Field } from "vant";
import NavHeader from "@/popup/components/navHeader/index.vue";
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'
export default {
  name: "settings",
  components: {
    [Sticky.name]: Sticky,
    [Icon.name]: Icon,
    NavHeader,
  },
  setup() {
    const route:any = useRoute()
    const router = useRouter()
    const { t } = useI18n()
    const clickLeft = () => {
      const { name } = route
      if(name == 'settingsHome') {
        router.replace({name:'wallet'})
      } else {
        router.back()
      }
    };
    const filter = ['export-privateKey','resetPwd-step2','contacts-add']
    // The Cancel button on the right is displayed dynamically according to the route
    const hasRight = computed(() => {
      
      if(filter.includes(route.name || '')){
        return true
      }
      return false
    })

    // Click the return button to jump to the route name
    const { query } = useRoute()
    const { clickBackUrl } = query
    const replaceBackUrl = ref(clickBackUrl || '')


    const backUrl = computed(() => {
      return 'wallet'
    })
    return {
      backUrl,
      route,
      clickLeft,
      hasRight,
      replaceBackUrl,
      t
    }
  },
};
</script>
<style lang="scss" scoped>
.settings {
  .cancel {
    font-size: 12px;
    color: #9F54BA;
    i {
      font-size: 20px;
    }
  }
  .title {
    font-size: 17px;
  }
}
</style>