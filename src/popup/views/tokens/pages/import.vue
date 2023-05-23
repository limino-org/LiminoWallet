<template>
  <div class="list">
    <!-- custom  -->
    <div class="custom pl-14 pr-14">
      <div class="title flex between pl-14 pr-14 pt-12 pb-12 mb-30">
        <div class="left flex center">
          <van-icon name="warning" />
        </div>
        <i18n-t keypath="addtokens.title" tag="div" class="right text-left f-12 lh-16">
          <template v-slot:wormholesLink>
            <a href="https://www.wormholes.com" class="ml-4 mr-4 wormholeslink" target="_blank"
              rel="noopener noreferrer">
              {{ t("wallet.wormHoles") }}
            </a>
          </template>
        </i18n-t>
        <!-- <div class="right text-left f-12 lh-16">{{ t("addtokens.title") }}</div> -->
      </div>
      <van-form ref="form">
        <van-cell-group inset>
          <div class="title-label pl-10">
            <span>*</span>
            {{ t("addtokens.contractAdd") }}
          </div>
          <van-field submit-on-enter v-model="tokenContractAddress" name="contract" :class="tokenError ? 'error' : ''"
            :placeholder="$t('addtokens.contractAddeg')" :rules="[
              { validator: asynToken },
            ]" />
        </van-cell-group>
        <div class="btn-group">
          <div class="container pl-28 pr-28 flex between">
            <van-button round block class="mr-10" @click="cancel">
              {{ t("common.cancel") }}
            </van-button>
            <van-button round block type="primary" @click="onSubmit">
              {{ t("addtokens.import") }}
            </van-button>
          </div>
        </div>
      </van-form>
    </div>
  </div>
</template>
<script lang="ts">
import {
  ref,
  Ref,
  computed,
  toRaw,
  SetupContext,
  onMounted,
  reactive,
} from "vue";
import {
  Icon,
  NavBar,
  Form,
  Field,
  CellGroup,
  Button,
  Tab,
  Tabs,
  Dialog,
  IndexBar,
  IndexAnchor,
  Toast,
} from "vant";
import TokenCard from "@/popup/views/account/components/tokenCard/index.vue";
import { useToast } from "@/popup/plugins/toast/index";
import { getWallet } from "@/popup/store/modules/account";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { getRandomIcon } from "@/popup/utils";
import { ethers, utils } from "ethers";
import { VUE_APP_NODE_WORM_URL } from '@/popup/enum/env';
const erc20Abi: any = require("@/popup/assets/json/erc20Abi.json");
import { useBroadCast } from '@/popup/utils/broadCost'
import { useDialog } from "@/popup/plugins/dialog";

// import { useToast } from '@/plugins/toast'
export default {
  name: "import-token",
  components: {
    [Icon.name]: Icon,
    [Form.name]: Form,
    [Field.name]: Field,
    [Button.name]: Button,
    [CellGroup.name]: CellGroup,
    [IndexBar.name]: IndexBar,
    [IndexAnchor.name]: IndexAnchor,
    TokenCard,
  },
  setup() {
    const { t } = useI18n();
    const { dispatch, state } = useStore();
    const { $toast } = useToast();
    const { handleUpdate } = useBroadCast()
    const router = useRouter();
    const currentNetwork = computed(() => state.account.currentNetwork)
    const accountInfo = computed(() => state.account.accountInfo)
    const precision: Ref<string> = ref("");
    const name: Ref<string> = ref("");
    const symbol: Ref<string> = ref("");
    const tokenContractAddress: Ref<string> = ref("");
      const {$dialog} = useDialog()
    const form = ref()
    const back = () => {
      router.go(-1);
    };
    const tokenError = ref(false);
    // Click add connectconstraint
    const onSubmit = async (data: any) => {
      console.log("submit", data);
      await form.value.validate()
      $dialog.open({
        type:'warn',
        message: t("currencyList.sure",{tokenName: name.value}),
        callBack: async() => {
          debugger
          const { address } = await getWallet();
        try {
          Toast.loading({
            message: t("userexchange.loading"),
            forbidClick: true,
            loadingType: "spinner",
            duration: 0

          });
          await dispatch("account/addToken", {
            tokenContractAddress: tokenContractAddress.value.trim(),
            address,
          });
          handleUpdate()
          $toast.success(t("currencyList.Importsuccessful"));
          router.replace({ name: "wallet" });
        } catch (err: any) {
          $toast.fail(err.toString());
        } finally {
          Toast.clear();
        }
        },
        cancelBack:() => {

        }
      })
      // Dialog.confirm({
      //   message: t("currencyList.sure",{tokenName: name.value}),
      // }).then(async () => {
      //   const { address } = await getWallet();
      //   try {
      //     Toast.loading({
      //       message: t("userexchange.loading"),
      //       forbidClick: true,
      //       loadingType: "spinner",
      //       duration: 0

      //     });
      //     await dispatch("account/addToken", {
      //       tokenContractAddress: tokenContractAddress.value,
      //       address,
      //     });
      //     handleUpdate()
      //     $toast.success(t("currencyList.Importsuccessful"));
      //     router.replace({ name: "wallet" });
      //   } catch (err: any) {
      //     $toast.fail(err.toString());
      //   } finally {
      //     Toast.clear();
      //   }
      // });
    };

    const asynToken = async (val: string) => {
      tokenError.value = false
      if (!val) {
        tokenError.value = true
        return t('addtokens.message')
      }
      const key = accountInfo.value.address.toUpperCase();
      const hasAddress = currentNetwork.value.tokens[key] ? currentNetwork.value.tokens[key].length : 0;
      const tokenAddr = tokenContractAddress.value.trim()
      if (hasAddress) {
        // Addresses whether the current account token list already exists to change tokens
        const newv = currentNetwork.value.tokens[key].find(
          (item: any) =>
            item.tokenContractAddress.toUpperCase() ==
            tokenAddr.toUpperCase()
        );
        if (newv) {
          tokenError.value = true
          //already exist
          return t("common.addressalreadyexists")
        }
      }

      try {
          const wallet = await getWallet();
          const contract = new ethers.Contract(
            tokenAddr,
            erc20Abi,
            wallet.provider
          );
          const contractWithSigner = contract.connect(wallet);
          name.value = await contractWithSigner.name();
          // const decimal = await contractWithSigner.decimals();
          // const symbol = await contractWithSigner.symbol();
          return true;

        } catch (err) {
          tokenError.value = true
          return t('addCurrency.errTip')
        }finally {
        Toast.clear()
      }
    };
    // Import function
    const handleImport = () => {
      console.log("import...");
    };

    const cancel = () => {
      router.replace({ name: "wallet" })
    }
    return {
      tokenError,
      cancel,
      asynToken,
      t,
      back,
      precision,
      name,
      symbol,
      tokenContractAddress,
      onSubmit,
      VUE_APP_NODE_WORM_URL,
      handleImport,
      form
    };
  },
};
</script>
<style lang="scss" scoped>
.error {
  :deep(.van-field__body) {
    border: 1px solid #d73a49 !important;
    background: #fbf2f3;
  }
}

.wormholeslink {
  color: #9F54BA;
}

.list {
  height: calc(100vh - 48px - 16px);
  overflow-y: scroll;
}

:deep(.van-index-anchor) {
  background: #f1f3f4;
  color: #aeaeae;
  line-height: 30px;
}

:deep(.van-index-bar__sidebar) {
  color: #909090;
  right: 8px;
}

:deep(.van-index-bar__index) {
  width: 18px;
  height: 18px;
  text-align: center;
  line-height: 18px;
  margin-bottom: 4px;
  padding: 0;
}

:deep(.van-index-bar__index--active) {
  background: #9F54BA;
  color: #fff;
  border-radius: 9px;
}

* {
  box-sizing: border-box;
}

.tabs {
  width: 200px;

  // border-radius: 20px;
  // border: 1PX solid #9F54BA;
  &::after {
    border-color: #9F54BA;
    border-radius: 26px;
  }

  .tab {
    width: 100px;
    line-height: 26px;
    border-radius: 12px;
    font-size: 12px;

    &.active {
      background: #9F54BA;
      // border: 1PX solid #9F54BA;
      color: #fff;
    }
  }
}

.title {
  text-align: center;
  background: #F8F3F9;
  margin-top: 25px;

  .left {
    width: 20px;

    i {
      font-size: 16px;
      color: #9F54BA;
    }
  }

  .right {
    width: calc(100% - 20px);
    padding-left: 3px;

    a {
      text-decoration: underline;
      color: #9F54BA;
    }
  }
}

.title-label {
  font-size: 12px;
  line-height: 16px;
  margin-bottom: 10px;
  font-weight: bold;
  position: relative;

  span {
    position: absolute;
    left: 0;
    top: 0;
    color: red;
  }
}

.search-box {
  border: 1px solid #B3B3B3;
  border-radius: 5px;
}

.ipt-box {
  width: 96%;

  i {
    color: #9F54BA;
    font-size: 22px;
  }

  :deep(.van-field__body) {
    margin-bottom: 0;
    line-height: 100%;
    border: none;
    outline: none;

    &:hover {
      border: none;
    }
  }
}

.close {
  width: 30px;

  i {
    font-size: 16px;
    color: #9F54BA;
  }
}

.icon-right-box {
  i {
    font-size: 18px;
  }

  .icon-add {
    color: #9F54BA;
  }

  .icon-minus {}
}

.btn-group {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 25px;
}

:deep(.van-cell-group--inset) {
  margin: 0;
}

:deep(.van-field__label) {
  display: none;
}

:deep(.van-field__error-message) {
  margin-bottom: 12px;
  line-height: 12px;
}

:deep(.van-cell:after) {
  display: none;
}

:deep(.van-cell) {
  padding: 0;
}

:deep(.van-field__body) {
  margin-bottom: 10px;

  &:hover {
    border: 1px solid #9F54BA;
  }
}

.btn-group {
  position: fixed;
  left: 0px;
  right: 0px;
  bottom: 25px;
}
</style>