<template>
  <div class="switch-coin-type">
    <van-popup
      v-model:show="showModal"
      :style="{ height: '28vh' }"
      position="bottom"
      @click.stop="showModal = false"
    >
      <div class="coin-list container">
        <div class="text-center tit text-bold f-20 pt-20">{{ t('common.walletType') }}</div>
        <div class="p-20 con-box flex between">
          <div
            v-for="item in coinList"
            :key="item.name"
            @click.stop="handleSwitch(item)"
            :class="`lh-30 hover card clickActive ${coinType.value == item.value ? 'select' : ''}`"
            :style="{ backgroundColor: item.color, color: '#fff' }"
          >
            {{ item.name }} <span class="addr">{{ addressMask(item.address) }}</span>
            <div class="smallc"   :style="{ backgroundColor: item.color}"></div>
            <div class="bigc"></div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>
<script lang="ts" setup>
import { CoinType, getWallet, toAddrByPrivateKeyBTC, toAddrByPrivateKeyETH } from "@/popup/store/modules/account";
import { Popup as vanPopup } from "vant";
import { ref, watch, Ref, computed } from "vue";
import { useStore } from "vuex";
import { addressMask, decimal, toUsd } from "@/popup/utils/filters";
import { useI18n } from "vue-i18n";

const coinList: any = ref([
  { name: "ETH", color: "#037CD6", value: 0, address: '' },
  { name: "BTC", color: "orange", value: 1, address: '' },
]);
const { t } = useI18n()
const showModal = ref(false);
const emits = defineEmits(["update:modelValue", "onChange"]);
const store = useStore();
const props = defineProps({
  modelValue: Boolean,
});
watch(
  () => props.modelValue,
  async(n) => {
    showModal.value = n;
    if(n) {
      const wallet = await getWallet()
      coinList.value.forEach(item => {
        if(item.value == 0) {
          item.address = toAddrByPrivateKeyETH(wallet.privateKey)
        }
        if(item.value == 1) {
          item.address = toAddrByPrivateKeyBTC(wallet.privateKey)
        }
      })
    }
  },
  {
    immediate: true,
  }
);
watch(
  () => showModal.value,
  (v) => {
    emits("update:modelValue", v);
  }
);

const coinType = computed(() => store.state.account.coinType)
const handleSwitch = async (item: CoinType) => {
  await store.dispatch("account/handleSwitchCoinType", item);
  const wallet = await store.dispatch("account/getProviderWallet");
  store.dispatch("account/updateBalance");
  store.dispatch("account/updateAllBalance");
  showModal.value = false;
};
</script>
<style lang="scss">
.switch-coin-type {
  .van-popup {
    background: transparent;
  }
  .tit {
    
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
        font-weight: bold;
        padding: 14px;
        border-style: solid;
        border-width: 2px;
        position: relative;
        border-radius: 4px;
        &.addr {
          font-size: 12px;
          font-weight: normal;
        }
        &:nth-of-type(even) {
          margin-left: 30px;
        }
        .bigc,.smallc {
          display: none;
        }
        &.select .bigc {
          display: block;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #fff;
          position: absolute;
          right: 10px;
          top: 10px;
        }
        &.select .smallc {
          display: block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #fff;
          position: absolute;
          right: 14px;
          top: 14px;
          z-index: 100;
        }
      }
    }
  }
}
</style>