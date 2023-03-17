<template>
  <div class="switch-coin-type">
    <van-popup v-model:show="showModal" :style="{ height:'70vh' }"  position="bottom" @click.stop="showModal = false">
      <div class="coin-list container">
        <div class="p-20 con-box clear-both">
            <div v-for="item in coinList" :key="item.name" @click.stop="handleSwitch" class="lh-30 hover card" :style="{background: item.color}">{{ item.name }}</div>
        </div>
      </div>
    </van-popup>
  </div>
</template>
<script lang="ts" setup>
import { Popup as vanPopup } from "vant";
import { ref, watch } from "vue";

const coinList = ref([{ name: "BTC", color:"orange" }, { name: "ETH", color:'#037CD6' }]);
const showModal = ref(false);
const emits = defineEmits(["update:modelValue", "onChange"]);

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
const handleSwitch = () => {

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