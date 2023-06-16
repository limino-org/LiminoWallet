<template>
  <div class="setting-card flex between hover" @click="handleClick">
    <div class="label lh-24 f-12 lh-16 text-bold">{{ label }}</div>
    <div class="value-box lh-24 flex ceter-v right">
      <div class="value f-12 mr-10 lh-24">{{ value }}</div>
      <div class="flex center">
        <van-icon name="arrow" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, SetupContext } from "vue";
import { Icon } from "vant";
export default defineComponent({
  name: "setting-card",
  emits: ["handleClick"],
  components: {
    [Icon.name]: Icon,
  },
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
    };
    return {
      handleClick,
    };
  },
});
</script>
<style lang="scss" scoped>
.setting-card {
  padding: 8px 10px 8px 12px;
  &:hover {
    color: #9F54BA;
    .value,i {
      color: #9F54BA !important;
    }
  }
  .label {
    width: 250px;
  }
  .value-box {
    .value {
      text-align: right;
    }
    i {
      font-size: 16px;
      color: #3d3d3d;
    }
  }
}
</style>
