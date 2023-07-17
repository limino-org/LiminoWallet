<template>
  <div class="flex center svg-out">
    <div class="svg-out-box">
      <svg x="0" y="0" class="svg-box flex center" :style="{ background: data.fill }">
        <rect
          v-for="(item, idx) in data.list"
          :key="idx"
          x="0"
          y="0"
          width="30"
          height="30"
          :transform="`translate(${item.translate.x} ${item.translate.y}) rotate(${item.rotate.a} ${item.rotate.b} ${item.rotate.c})`"
          :fill="item.fill"
        />
      </svg>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'account-svg',
  props: {
    data: {
      type: Object,
      default: {}
    }
  },
  setup() {}
})
</script>
<style lang="scss" scoped>
.svg-out {
  border-radius: 4px;
  overflow: hidden;
  &-box {
    // background: red;
    border-radius: 50%;
    overflow: hidden;
  }
}
.svg-box {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  overflow: hidden;
  transition: ease all 0.3s;
  &:hover {
    transform: scale(1.3);
  }
}
</style>
