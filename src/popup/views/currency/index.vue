<template>
  <div class="currency">
    <van-sticky>
      <NavHeader :hasRight="false">
        <template v-slot:left>
        </template>
        <template v-slot:right></template>
      </NavHeader>
    </van-sticky>
    <router-view />
  </div>
</template>
<script lang="ts">
import NavHeader from "@/popup/components/navHeader/index.vue";
import { Icon, Sticky } from "vant";
import { useRouter } from "vue-router";
export default {
  name:'currency',
  components: {
    [Icon.name]: Icon,
    [Sticky.name]: Sticky,
    NavHeader,
  },
  setup() {
    const router = useRouter();
    const back = () => {
      router.go(-1);
    };
    return {
      back,
    };
  },
};
</script>
<style lang="scss" scoped>
.currency {
  .back-icon {
    color: rgba(3, 125, 214, 1);
    font-size: 22px;
    margin-left: -6px;
  }
}
</style>