<template>
  <Transition name="slider">
    <div class="transfer-NFT" v-if="showModal">
      <div class="transfer-nft-con">
        <div class="con">
          <div class="notices pl-14 pr-14 pt-4 pb-4 flex center-v">
            <i class="iconfont icon-warn"></i>
            <span class="lh-14"
              >
              {{ t("transferNft.conversionconfirmation") }}</span
            >
          </div>
          <div class="flex between t-bottom pl-14 pr-14">
            <div class="flex">
              <!-- 全选 -->
              <div class="all-in flex center hover" @click="handleAll">
                <i :class="`iconfont ${all ? 'icon-duihao2' : 'icon-check_line'}`"></i>
                <span class="ml-4">
                  {{ t("transferNft.all") }}
                </span>
              </div>
              <!-- amount -->
              <div class="amount flex center ml-8">
                <span class="sel">{{selectNumber}} 
                  {{ t("transferNft.select") }}
                </span>
                <span class="sel2 text-bold ml-6 f-18">{{selectTotal}} ERB</span>
              </div>
            </div>
            <!-- convert按钮 -->
            <div class="convert flex center">
              <van-button size="small" type="primary" @click="handleConfirm"
                >
                <!-- {{ t("transferNft.convert") }} <i class="iconfont icon-zhuanhuan"></i
              > -->
                  {{submitText}}
            </van-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
<script lang="ts">
import { defineComponent, ref, Ref, watch, SetupContext, reactive, computed } from "vue";
import { Dialog, Button, Field, NumberKeyboard, Toast } from "vant";
import { regNum2 } from "@/popup/enum/regexp";
import BigNumber from "bignumber.js";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
export default defineComponent({
  name: "transfer-NFT",
  components: {
    [Button.name]: Button,
    [Field.name]: Field,
    [NumberKeyboard.name]: NumberKeyboard,
  },
  emits:['handleAll','handleConfirm','update:modelValue'],
  props: {
    // v-model 方式绑定打开关闭
    modelValue: {
      type: Boolean,
      default: false,
    },
    // 选择的长度
    selectNumber: {
      type: Number,
      default: 0
    },
    // 选择的总数量
    selectTotal: {
      type: Number,
      default: 0
    },
    type: {
      type: String,
      default:'3'
    }
  },
  setup(props: any, context: SetupContext) {
    const { t } = useI18n();
    const { emit }: any = context;
    const showModal: Ref<boolean> = ref(false);
    const { dispatch } = useStore()
    const all = ref(false)
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
    const handleConfirm = () => {
        emit('handleConfirm')
    }

    const handleAll = () => {
      all.value = all.value ? all.value = false : all.value = true 
      emit('handleAll', all.value)
    }

    const submitText = computed(() => {
      let str = "";
      switch (props.type) {
        case "2":
          str = t("common.conver");
          break;
        case "3":
          str = t("createminerspledge.stake");
          break;
        case "1":
          str = t("createExchange.redemption");
          break;
      }
      return str;
    });
    return {
      t,
      showModal,
      all,
      handleConfirm,
      handleAll,
      submitText
    };
  },
});
</script>
<style lang="scss" scoped>
.con {
  max-width: 750px;
  margin: 0 auto;
  box-sizing: border-box;

  transition: ease 0.3s;
  border-top: 1px solid #fff;
  &:hover {
    box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.2);
    border-top: 1px solid #057ed6;
  }
  * {
    box-sizing: border-box;
  }
}
.transfer-nft-con {
  // height: 95px;
}
.transfer-NFT {
  // height: 95px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
}
.notices {
  background: #fefcda;
  font-size: 12px;
  line-height: 30px;
  width: 100%;
  span {
  }
  i {
    color: #f2ea50;
  }
}
.t-bottom {
  height: 65px;
  background: #fff;
  font-size: 12px;
}
.all-in {
  color: #9a9a9a;
  font-size: 12px;
  i {
    font-size: 18px;
    color: #9a9a9a;
  }
   .icon-duihao2 {
      font-size: 16px;
      color: #037CD6;
    }
}
.amount {
  .sel {
  }
  .sel2 {
    color: #037cd6;
  }
}
.convert {
  font-size: 12px;
  i {
    font-size: 12px;
    &::before {
      transform: scale(0.8);
      transform-origin: center left;
    }
  }
}
.slider-enter-active {
  animation: slider-in 0.3s ease-in-out;
}
.slider-leave-active {
  animation: slider-in 0.3s reverse ease-in-out;
}

@keyframes slider-in {
  0% {
    transform: translateY(90px);
  }

  100% {
    transform: translateY(0);
  }
}
</style>
