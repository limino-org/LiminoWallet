<template>
  <div class="setting-class  van-hairline--bottom">
    <div class="label pl-12 pr-10 f-18 f-12 lh-24 pt-18 pb-8"> 
        <slot name="icon"></slot>
         {{ label }}</div>
    <slot></slot>
  </div>
</template>
<script lang="ts">
import { defineComponent, SetupContext } from "vue";

export default defineComponent({
  name: "setting-class",
  emits: ["handleClick"],
  props: {
    label: {
      type: String,
      default: "label",
    },
    value: {
      type: String || Number || Boolean,
      default: null,
    },
  },
  setup(props: any, context: SetupContext) {
    const { emit } = context;
    const handleClick = () => {
    emit("handleClick");
    }
    return {
        handleClick
    }
  },
});
</script>
<style lang="scss" scoped>
.setting-class {
  .label {
      color: #B3B3B3;
      font-size: 18px;
      i {
          font-size: 20px;
      }
      :deep(i){
          font-size: 18px;
      }
  }
  
}
</style>
