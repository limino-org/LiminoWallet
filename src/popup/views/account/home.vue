<template>
  <div class="home">
    <div class="container" id="container">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { Button, Sticky } from 'vant'
import { onBeforeRouteUpdate } from 'vue-router'
import NavHeader from '@/popup/components/navHeader/index.vue'
import { Ref, ref } from 'vue'
export default {
  name: 'index',
  components: {
    NavHeader,
    [Button.name]: Button,
    [Sticky.name]: Sticky
  },
  setup() {
    onBeforeRouteUpdate((to, form, next) => {
      next()
    })

    return {
    }
  }
}
</script>
<style lang="scss">
.home {
  overflow-y: none;
}
.page-container {
  min-height: calc(100vh - 48px);
  // scrollbar-width: none;
  overflow-y: scroll;
  position: relative;
  box-sizing: border-box;
  padding-bottom: 30px;
  // &::-webkit-scrollbar {
  //   display: none;
  //   /* Chrome Safari */
  // }
}
:deep(.van-popup) {
  position: absolute;
}


</style>
