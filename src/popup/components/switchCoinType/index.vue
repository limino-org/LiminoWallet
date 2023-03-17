<template>
  <div class="switch-coin-type">
    <van-popup v-model:show="showModal" :style="{ height:'30vh' }"  position="bottom" @click.stop="showModal = false">
      <div class="coin-list container">
        <div class="p-20 con-box clear-both">
            <div v-for="item in coinList" :key="item.name" @click.stop="handleSwitch(item)" class="lh-30 hover card" :style="{background: item.color}">{{ item.name }}</div>
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

const coinList = ref([ { name: "ETH", color:'#037CD6', value: 0 },{ name: "BTC", color:"orange", value: 1 }]);
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
        height: 70vh;
        .con-box {
            .card {
                float: left;
                margin: 20px;
                color: #fff;
                font-size: 24px;
                font-weight: bold;
                padding: 14px;
            }
        }
    }
}
</style>