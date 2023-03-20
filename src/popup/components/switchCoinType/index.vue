<template>
  <div class="switch-coin-type">
    <van-popup v-model:show="showModal" :style="{ height:'30vh' }"  position="bottom" @click.stop="showModal = false">
      <div class="coin-list container">
        <div class="p-20 con-box flex between" >
            <div v-for="item in coinList" :key="item.name" @click.stop="handleSwitch(item)" class="lh-30 hover card clickActive" :style="{borderColor:item.color, color: item.color}">{{ item.name }}</div>
        </div>
      </div>
    </van-popup>
  </div>
</template>
<script lang="ts" setup>
import { CoinType } from "@/popup/store/modules/account";
import { Popup as vanPopup } from "vant";
import { ref, watch,Ref } from "vue";
import { useStore } from "vuex";

const coinList: any = ref([ { name: "ETH", color:'#037CD6', value: 0 },{ name: "BTC", color:"orange", value: 1 }]);
const showModal = ref(false);
const emits = defineEmits(["update:modelValue", "onChange"]);
const store = useStore()
const props = defineProps({
  modelValue: Boolean,
});
watch(
  () => props.modelValue,
  (n) => {
    showModal.value = n;
  },{
    immediate: true
  }
);
watch(
  () => showModal.value,
  (v) => {
    emits("update:modelValue", v);
  }
);
const handleSwitch = (item: CoinType) => {
  store.dispatch('account/handleSwitchCoinType', item)
}

</script>
<style lang="scss">
.switch-coin-type {
    .van-popup  {
        background: transparent;
    }
    .coin-list {
        background: #fff;
        height: 30vh;
        overflow-y: scroll;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        .con-box {
            .card {
                flex: 1;
                color: #fff;
                font-size: 24px;
                // font-weight: bold;
                padding: 14px;
                border-style: solid;
                border-width: 1px;
                &:nth-of-type(even) {
                  margin-left: 20px;
                }
            }
        }
    }
}
</style>