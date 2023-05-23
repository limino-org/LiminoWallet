<template>
  <div
    class="netword-card flex clickActive"
    @click.stop="handleClick"
  >
    <div class="dot flex center" v-if="hasDot">
    <div class="circle"></div></div>
    <div class="net-status flex center mr-6" v-if="hasSelect">
      <i
        :class="`iconfont f-14 ${
          select ? 'icon-danxuan' : 'icon-danxuan1'
        }`"
      ></i>
    </div>

    <div class="net-name flex between">
      <div :class="`flex center-v ${!hasSelect ? 'between full' : ''}`">
        <span>{{ data.label }} {{ t("networklist.network") }}</span>
      <i
        v-if="hasModif"
        @click.stop="handleModif"
        class="iconfont icon-changyonggoupiaorenbianji"
      ></i>
      </div>
      <div class="flex center-v right rightIcon" v-show="select && hasSelect">
        <i class="iconfont icon-duihao"></i>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {
  toRefs,
  defineComponent,
  SetupContext,
  watch,
  Ref,
  ref,
  computed,
} from "vue";
import { Icon } from "vant";
import { getRandomColor } from "@/popup/utils";
import { useI18n } from "vue-i18n";
import { useStore } from "vuex";
export default defineComponent({
  components: {
    [Icon.name]: Icon,
  },
  emits: ["handleClick", "handleModif"],
  props: {
    data: {
      type: Object,
      default: {},
    },
    // Is there a selection ICON
    hasSelect: {
      type: Boolean,
      default: true,
    },
    // Whether there is an edit icon
    hasModif: {
      type: Boolean,
      default: false,
    },
    hasDot:{
      type: Boolean,
      default: false
    }
  },
  setup(props, context: SetupContext) {
    const { t } = useI18n();
    const store = useStore();
    const { emit } = context;
    const handleClick = () => {
      emit("handleClick", props.data);
    };

    const handleModif = () => {
      emit("handleModif", props.data);
    };
    const select = computed(() => {
      const currentNetwork = store.state.account.currentNetwork;
      if (currentNetwork.id == props.data.id) {
        return true;
      }
      return false;
    });
    return {
      t,
      getRandomColor,
      handleClick,
      handleModif,
      select,
    };
  },
});
</script>
<style lang="scss">
.netword-card {
  padding: 0 15px;
  height: 52px;
  transition: ease 0.3s;
  border-bottom: 1px solid #E4E7E8;
  .dot {
    margin-right: 6px;
    .circle {
      width: 4px;
      height: 4px;
      border-radius: 2px;
      background:#9F54BA;
    }
  }
  .full {
    width: 100%;
  }
  &:hover {
    background: #F8F3F9;
  }
  .net-status {
    width: 20px;
    color: #ccc;
    i {
      color: #9F54BA;
      font-size: 16px;
    }
    i.icon-xuanzhong1 {
      font-size: 18px;
    }
  }
  .net-name {
    line-height: 52px;
    width: 100%;
    font-size: 12px;
    i {
      color: #8f8f8f;
      font-size: 14px;
      padding: 5px;
    }
  }
  .net-icon {
    margin-left: 18px;
    &-box {
      width: 13px;
      height: 13px;
      border-radius: 50%;
    }
  }
  .rightIcon i{
    color: rgb(13, 215, 13);
    font-size: 14px;
  }
}
</style>
