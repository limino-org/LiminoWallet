<template>
  <div class="startpages flex center">
    <div class="startcotop flex between column">
      <div class="startcontop_img flex center">
        <img src="@/assets/token/logowallet.png" alt="" id="container" />
      </div>
      <div class="startcotop_txt">{{ t("introductorypage.bootstrap1") }}</div>
    </div>
  </div>
</template>
  <script lang="ts" setup>
import { onMounted } from "@vue/runtime-core";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
const router = useRouter();
const { t } = useI18n();
onMounted(() => {
  let time = setTimeout(() => {
    router.replace({ name: "wallet" });
    clearTimeout(time);
  }, 4000);
});
</script>
  <style lang="scss" scoped>
.startpages {
  height: calc(100vh - 48px);
  overflow: hidden;
  .startcotop {
    width: 250px;
    height: 180px;
    animation: startcontop_img 4s linear;
    .startcontop_img {
      img {
        height: 60px;
      }
    }
    .startcotop_txt {
      color: #000;
      font-weight: bold;
      font-size: 20px;
      text-align: center;
      line-height: 30px;
    }
  }
}
@keyframes startcontop_img {
  0% {
    transform: scale(1);
    opacity: .1;
  }
  50% {
    transform: scale(1.5);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>