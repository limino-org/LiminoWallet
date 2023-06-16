<template>
  <div class="exchange-confirm-modal">
    <van-dialog
      v-model:show="showModal"
      teleport="#page-box"
      :showConfirmButton="false"
      :showCancelButton="false"
      closeOnClickOverlay
      :title="''"
    >
      <div class="title text-center text-bold van-hairline--bottom">
        {{ t("createExchange.tradeTit") }}
      </div>
      <div class="exchange-form">
        <div class="card flex column between">
          <div class="name">
            {{ t("createExchange.formName") }}
            <van-popover v-model:show="showpop1" theme="dark" placement="right">
              <p class="p-10">{{ t("sendto.nametip") }}</p>
              <template #reference>
                <van-icon
                  name="question hover"
                  @mouseover="showpop1 = true"
                  @mouseleave="showpop1 = false"
                />
              </template>
            </van-popover>
          </div>
          <div class="value">{{ name }}</div>
        </div>
        <div class="card flex column between">
          <div class="name">
            {{ t("createExchange.formCharge") }}
            <van-popover v-model:show="showpop2" theme="dark" placement="right">
              <p class="p-10">{{ t("sendto.chargetip") }}</p>
              <template #reference>
                <van-icon
                  name="question hover"
                  @mouseover="showpop2 = true"
                  @mouseleave="showpop2 = false"
                />
              </template>
            </van-popover>
          </div>
          <div class="value">{{ fee_rate/10 }}%</div>
        </div>
        <div class="card flex column between">
          <div class="name">
            {{ t("createExchange.formFee") }}
            <van-popover v-model:show="showpop3" theme="dark" placement="right">
              <p class="p-10">{{ t("sendto.feetip") }}</p>
              <template #reference>
                <van-icon
                  name="question hover"
                  @mouseover="showpop3 = true"
                  @mouseleave="showpop3 = false"
                />
              </template>
            </van-popover>
          </div>
          <div class="value">{{ amount }} ERB</div>
        </div>
        <div class="card flex column between">
          <div class="name">
            {{ t("createExchange.formServer") }}
            <van-popover v-model:show="showpop4" theme="dark" placement="right">
              <p class="p-10">{{ t("sendto.servertip") }}</p>
              <template #reference>
                <van-icon
                  name="question hover"
                  @mouseover="showpop4 = true"
                  @mouseleave="showpop4 = false"
                />
              </template>
            </van-popover>
          </div>
          <div class="value">{{ amount2 }} ERB</div>
        </div>
        <div class="card flex column between">
          <div class="name">
            {{ t("createExchange.formAmount") }}
            <van-popover v-model:show="showpop5" theme="dark" placement="right">
              <p class="p-10">{{ t("sendto.amounttip") }}</p>
              <template #reference>
                <van-icon
                  name="question hover"
                  @mouseover="showpop5 = true"
                  @mouseleave="showpop5 = false"
                />
              </template>
            </van-popover>
          </div>
          <div class="value">
            {{ amount + amount2 }} ERB
          </div>
        </div>
        <div class="card flex column between">
          <div class="name">
            {{ t("createExchange.formGas") }}
            <van-popover v-model:show="showpop6" theme="dark" placement="right">
              <p class="p-10">{{ t("sendto.gastip") }}</p>
              <template #reference>
                <van-icon
                  name="question hover"
                  @mouseover="showpop6 = true"
                  @mouseleave="showpop6 = false"
                />
              </template>
            </van-popover>
          </div>
          <van-skeleton :row="1" :loading="loadingGas" row-width="100%">
            <div class="value">
              ≈<span>{{ gasFee }} ERB</span>
            </div>
          </van-skeleton>
        </div>
      </div>
      <div class="flex between pb-30 btn-group">
        <van-button @click="cancel">{{
          t("createExchange.cancel")
        }}</van-button>
        <van-button type="primary" :disabled="loadingGas && !dataReady ? true : false" @click="handleComfirm">{{
          t("receive.confirm")
        }} </van-button>
      </div>
    </van-dialog>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  ref,
  Ref,
  watch,
  SetupContext,
  reactive,
  computed,
  getCurrentInstance,
  ComponentInternalInstance,
  nextTick,
  onMounted,
} from "vue";
import {
  Dialog,
  Button,
  Field,
  NumberKeyboard,
  Toast,
  Icon,
  Skeleton,
  Popover,
} from "vant";
import { regNum2 } from "@/popup/enum/regexp";
import { useI18n } from "vue-i18n";
import BigNumber from "bignumber.js";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { useToast } from "@/popup/plugins/toast";
import { useExchanges } from "../hooks/useExchange";
import { getWallet } from "@/scripts/background";
import { ethers } from "ethers";
import { useCountDown } from "@vant/use";
export default defineComponent({
  name: "custom-exchange-modal",
  components: {
    [Dialog.Component.name]: Dialog.Component,
    [Button.name]: Button,
    [Field.name]: Field,
    [Popover.name]: Popover,
    [Skeleton.name]: Skeleton,
    [Icon.name]: Icon,
  },
  props: {
    title: {
      type: String,
      default: "Set Amount",
    },
    modelValue: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      defaulg: "",
    },
    amount: {
      type: Number,
      default: 0,
    },
    amount2: {
      type: Number,
      default: 0,
    },
    fee_rate: {
      type: Number,
      default: 0,
    },
  },
  setup(props: any, context: SetupContext) {
    const { createExchanges, ready } = useExchanges();
    const { t } = useI18n();
    const { emit }: any = context;
    const router = useRouter();
    const route = useRoute();
    const { state, dispatch } = useStore();
    const showModal: Ref<boolean> = ref(false);
    const contractAddress = computed(() => state.account.contractAddress);
    const accountInfo = computed(() => state.account.accountInfo);
    const loadingGas = ref(false);
    const dataReady = ref(false)
    const countDown = useCountDown({
      time: 3000,
      onFinish(){
        
      }
    });
    const gasFee = ref(0);
    const calcGas = async () => {
      loadingGas.value = true;
      const { amount, amount2 } = props;
      const wallet = await getWallet();
      const gasprice = await wallet.provider.getGasPrice();
      const gas1 = await wallet.estimateGas({
        to: "0x7fBC8ad616177c6519228FCa4a7D9EC7d1804900",
        value: ethers.utils.parseEther(amount.toString()),
      });
      console.log("gasPrice", ethers.utils.formatUnits(gasprice, "gwei"));
      console.log("gas1", ethers.utils.formatUnits(gas1, "gwei"));
      const gasp = ethers.utils.formatUnits(gasprice, "gwei");
      const gas1n = ethers.utils.formatUnits(gas1, "gwei");
      gasFee.value = new BigNumber(gasp).multipliedBy(gas1n).toNumber();
      console.log("gasFee", gasFee.value);
      if (amount2) {
        const { contractWithSigner, contract } = await dispatch(
          "account/connectConstract",
          contractAddress.value
        );
        const gas2 = await contractWithSigner.estimateGas.transfer(
          accountInfo.value.address,
          amount2.toString()
        );
        console.log("gas2", ethers.utils.formatUnits(gas2, "gwei"));
        const gas2n = ethers.utils.formatUnits(gas2, "gwei");
        const gas2amount = new BigNumber(gas2n).multipliedBy(gasp).toNumber();
        console.log("gas2amount", gas2amount);
        gasFee.value = new BigNumber(gasFee.value).plus(gas2amount).toNumber();
        loadingGas.value = false;
        
        countDown.start()
      } else {
        loadingGas.value = false;
        countDown.start()

      }
    };
    watch(
      () => props.modelValue,
      (n) => {
        showModal.value = n;
        if (n) {
          calcGas();
        }
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

    const cancel = () => {
      showModal.value = false;
    };
    const { $toast } = useToast();

    const handleComfirm = () => {
      const { name, amount, amount2, fee_rate } = props;
      createExchanges(name, amount, amount2, fee_rate / 10);
      emit("handleConfirm");
      showModal.value = false;
    };
    watch(
      () => ready.value,
      async (n) => {
        if (Number(n) == 100) {
          nextTick(() => {
            dispatch("account/getExchangeStatus");
          });
        }
      }
    );

    calcGas();

    const showpop1 = ref(false);
    const showpop2 = ref(false);
    const showpop3 = ref(false);
    const showpop4 = ref(false);
    const showpop5 = ref(false);
    const showpop6 = ref(false);

    return {
      t,
      cancel,
      handleComfirm,
      showModal,
      showpop1,
      showpop2,
      showpop3,
      showpop4,
      showpop5,
      showpop6,
      loadingGas,
      gasFee,
      dataReady,
      current: countDown.current,
    };
  },
});
</script>
<style lang="scss" scoped>
:deep(.van-skeleton__row) {
  width: 100% !important;
}
:deep(.van-skeleton) {
  padding: 0 !important;
}
.btn-group {
  padding: 0 50px 20px;
  button {
    width: 103px;
  }
}
.title {
  color: #000;
  font-size: 15px;
  line-height: 62px;
  background: #F8F3F9;
  font-weight: bold;

}
.exchange-form {
  height: 438px;
  border-radius: 4px;
  margin: 25px 12.5px;
  border: 1px solid #e4e7e8;
  padding: 0 15px;
  .card {
    height: 72px;
    border-bottom: 1px solid #e4e7e8;
    padding: 16px 0;
    &:nth-last-of-type(1) {
      border-bottom: none;
    }
    .name {
      color: #8f8f8f;
      line-height: 16px;
      i {
        font-size: 13px;
      }
    }
    .value {
      line-height: 16px;
    }
  }
}
</style>
