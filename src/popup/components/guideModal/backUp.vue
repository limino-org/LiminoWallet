<template>
      <van-dialog
        v-model:show="showModal"
        class="guideBackupModal"
        teleport="#page-box"
        :showConfirmButton="false"
        :showCancelButton="false"
        closeOnClickOverlay
        :title="''"
      >
        <div class="title text-center text-bold van-hairline--bottom">
          {{t('backup.safetyTips')}}
        </div>
        <div class="flex center icon-box m-20">
          <i class="iconfont icon-yk_gantanhao_fill" style="color: #eccb1d"></i>
        </div>
        <div class="small-tit text-center text-bold f-24">{{t('backup.warn')}}</div>
        <div class="tip f-12 lh-16 text-center pl-24 pr-24 mt-12 mb-12">
         {{t('backup.warn1')}}
        </div>
        <div class="flex center">
          <span class="remindLater hover" @click="remindLater">{{t('backup.remindMeLater')}}</span>
        </div>
        <div class="flex center pb-30 pl-14 pr-14 mt-20">
          <van-button type="primary" @click="backUp"
            >{{t('backup.backup')}}</van-button
          >
        </div>
      </van-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, watch, SetupContext, computed } from "vue";
import { Popover, Dialog, Button } from "vant";
import WormTransition from "@/popup/components/wromTransition/index.vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
export default defineComponent({
  name: "backup-mnemonic",
  components: {
    [Popover.name]: Popover,
    [Dialog.Component.name]: Dialog.Component,
    [Button.name]: Button,
    WormTransition,
  },
  props: {
    type: {
      type: Number,
      default: 15,
    },
  },
  setup(props: any, context: SetupContext) {
    const {t}=useI18n()
    const router = useRouter()
    const showModal: Ref<boolean> = ref(false);
    const { state, dispatch,getters ,commit} = useStore();
    const show15 = computed(() => state.system.show15);
    watch(
      () => show15,
      (n) => {
          showModal.value = n.value;
      },
      {
        immediate: true,
        deep: true,
      }
    );
    
    const backUp = () => {
      dispatch("system/showDialog", props.type);
      dispatch("system/closeGuide");
      // showModal.value = false
      router.push({name:'mnemonic'})
    };
    
    const remindLater = () => {
      dispatch("system/showDialog", props.type);
      dispatch("system/closeGuide");
    }
    return {
      t,
      showModal,
      show15,
      backUp,
      remindLater
    };
  },
});
</script>
<style lang="scss" scoped>
.title {
  color: #000;
  font-size: 15px;
  line-height: 62px;
  background: #F8F3F9;
  font-weight: bold;

}
.small-tit {
  font-size: 15px;
}
.tip {
  color: #848484;
}
.savebtn {
  width: 250px;
  background: #F8F3F9;
  border-radius: 30px;
  color: #9F54BA;
  i {
    font-size: 12px;
  }
  &:hover {
    background: #F8F3F9;
  }
}
.icon-box i {
  font-size: 36px;
  color: #9F54BA;
}
.remindLater {
  line-height: 12px;
  font-weight: bold;
  margin-top: 30px;
  text-decoration: underline;
}
</style>