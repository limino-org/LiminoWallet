<template>
  <van-dialog
    v-model:show="showModal"
    show-cancel-button
    teleport="#page-box"
    :showConfirmButton="false"
    :showCancelButton="false"
    closeOnClickOverlay
  >
    <div class="snft-details">
       <div class="title text-center text-bold van-hairline--bottom">
         Collection Name
       </div>
       <div class="snft-album flex">
         <div class="snft-collection">1</div>      
         <div class="snft-collection other">1</div>      
         <div class="snft-collection">1</div>      
         <div class="snft-collection other">1</div>      
         <div class="snft-collection other">1</div>      
         <div class="snft-collection ">1</div>      
         <div class="snft-collection other">1</div>      
         <div class="snft-collection">1</div>      
         <div class="snft-collection">1</div>      
         <div class="snft-collection other">1</div>      
         <div class="snft-collection">1</div>      
         <div class="snft-collection other">1</div>      
         <div class="snft-collection other">1</div>      
         <div class="snft-collection ">1</div>      
         <div class="snft-collection other">1</div>      
         <div class="snft-collection ">1</div>      
       </div>
       <div class=" text-center f-12 introduce mt-20 ">
         You can also <a href="">Buy SNFs</a> at the exchange
       </div>
       <div class="mt-26 mb-26 flex around">
         <van-button plain  type="primary" @click="toclose">Cancel</van-button>
         <van-button type="primary" @click="tomore">More Info</van-button>
       </div>
    </div>
  </van-dialog>
</template>
<script lang="ts">
import {
  defineComponent,
  Ref,
  ref,
  watch,
  SetupContext,
  computed,
  reactive,
  nextTick,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { Icon, Dialog, Button, Loading, Toast } from "vant";
import { decimal } from "@/popup/utils/filters";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
export default defineComponent({
  name: "accountModal",
  components: {
    [Icon.name]: Icon,
    [Dialog.Component.name]: Dialog.Component,
    [Button.name]: Button,
    [Loading.name]: Loading,
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  setup(props: any, context: SetupContext) {
    const { emit }: any = context;
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const i18n = useI18n();
    const { dispatch } = store;
    const { t } = useI18n();
    const showModal: Ref<boolean> = ref(false);
    const toclose=()=>{
      showModal.value=false
    }
    const tomore=()=>{
      
    }
      watch(
      () => props.modelValue,
      (n) => {
        showModal.value = n;
      },
      {
        immediate: true,
      }
    );

    watch(
      () => showModal.value,
      (n) => {
        if (!n) {
          emit("update:modelValue", false);
        }
      }
    );
    return {
      t,
      toclose,
      tomore,
      showModal,
    };
  },
});
</script>
<style lang="scss" scoped>
.snft-details{
  .title {
  color: #000;
  font-size: 15px;
  line-height: 62px;
  background: #F8F3F9;
  font-weight: bold;

}
  .snft-album{
    flex-wrap: wrap;
    align-content: space-between;
    justify-content: space-between;
  .snft-collection{
    width: 85px;
    height: 85px;
    background-color: pink;
  }
  .other{
    background-color: skyblue;
  }
  }
  .introduce{
    color: #B3B3B3;
  }
}
</style>