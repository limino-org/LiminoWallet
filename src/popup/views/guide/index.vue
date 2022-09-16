<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
<script lang="ts">
import Vue from "vue";
export default {
  name: "pagetransferAccounts",
};
</script>