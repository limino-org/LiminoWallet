<template>
  <div>
    <NavHeader
      :title="t('wallet.wormHoles')"
      :hasLeft="false"
      :hasRight="false"
    />
    <div class="title">
      <WormTransition size="small">
        <template v-slot:icon>
          <img class="iconele" src="@/assets/token/logowallet.png" />
        </template>
      </WormTransition>
      <!-- <img class="iconele flex center" src="@/assets/token/icon_blue.svg" alt /> -->
      <div class="tit-big text-center f-24">
        {{ t("createAccountpage.welcome") }}
      </div>
      <div class="tit-small text-center f-12 mt-14 mb-30 lh-16">
        {{ t("loginwithpassword.smallTit") }}
      </div>
    </div>
    <div class="create-new-password">
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <div class="text-bold f-12 mt-10 mb-10 lh-16 flex between">
            <span>{{ t("createAccountpage.password") }}</span>
            <span>
              <i
                @click="toggleMask"
                :class="`iconfont hover ${
                  switchPassType ? 'icon-yanjing1' : 'icon-yanjing'
                }`"
              ></i>
            </span>
          </div>
          <van-field
            v-model="password"
            name="password"
            ref="iptRef"
            :class="`text ${pwdErr ? 'error' : ''}`"
            :type="`${switchPassType ? 'text' : 'password'}`"
            @click-right-icon="switchPassType = !switchPassType"
            :placeholder="$t('createAccountpage.passwordPlaceholder')"
            :rules="[{ validator: asynPwd }]"

    
          />
        </van-cell-group>
        <div class="btn-box">
          <van-button
            :loading="loading"
            round
            block
            type="primary"
            native-type="submit"
            >{{ t("createAccountpage.loginIn") }}</van-button
          >
        </div>
      </van-form>
      <div class="text-center f-12">
        <i18n-t
          tag="div"
          class="reset-box"
          keypath="createAccountpage.cantLogin"
        >
          <template v-slot:reset>
            <span class="lh-20 tool hover" @click="reset" :disable="reset_flag">
              {{ t("createAccountpage.resentWallet") }}
            </span>
          </template>
        </i18n-t>
      </div>
    </div>
    <Resetpopup
      v-model="resetmodule"
      @handleConfirm="handleComfirm"
      @cancel="cancel"
    />
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import {
  Icon,
  Toast,
  Button,
  Sticky,
  Field,
  Form,
  CellGroup,
  Switch,
  Checkbox,
  CheckboxGroup,
} from "vant";
import { ref, Ref, computed, toRaw, SetupContext, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { setCookies } from "@/popup/utils/jsCookie";
import { passwordExpires } from "@/popup/enum/time";
import { encryptPrivateKey, EncryptPrivateKeyParams } from "@/popup/utils/web3";
import { web3 } from "@/popup/utils/web3";
import Resetpopup from "@/popup/views/createAccount/components/resetpopup.vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { regPassword1 } from "@/popup/enum/regexp";
import {
  CreateWalletByJsonParams,
  createWalletByJson,
} from "@/popup/utils/ether";
import { getWallet } from "@/popup/store/modules/account";
import { encrypt, decrypt } from "@/popup/utils/cryptoJS.js";
import NavHeader from "@/popup/components/navHeader/index.vue";
import WormTransition from "@/popup/components/wromTransition/index.vue";
export default {
  name: "loginAccount-step1",
  components: {
    [Button.name]: Button,
    [Sticky.name]: Sticky,
    [Form.name]: Form,
    [Field.name]: Field,
    [CellGroup.name]: CellGroup,
    [Switch.name]: Switch,
    [Checkbox.name]: Checkbox,
    [CheckboxGroup.name]: CheckboxGroup,
    Resetpopup,
    NavHeader,
    WormTransition,
  },
  setup() {
    const password: Ref<string> = ref("");
    const loading = ref(false);
    const { t } = useI18n();
    const switchPassType = ref(false);
    const { dispatch, commit, state } = useStore();
    const router = useRouter();
    const route = useRoute();
    const accountInfo = state.account.accountInfo;
    const iptRef = ref(null)
    const { keyStore } = accountInfo;
    const onSubmit = async (value: object) => {
      loading.value = true;
      pwdErr.value = false
      checkPwd();
    };
    const toggleMask = () => {
      switchPassType.value
        ? (switchPassType.value = false)
        : (switchPassType.value = true);
    };

    const checkPwd = async () => {
      const { currentNetwork } = state.account;
      const data: CreateWalletByJsonParams = {
        password: password.value,
        json: keyStore,
      };
      let errBool = true;
      try {
        await dispatch("account/createWalletByJson", data);
        pwdErr.value = false
        await setCookies("password", password.value);
        dispatch("account/updateAccount", currentNetwork);
        dispatch("account/updateBalance");
        const { query } = route;
        const { backUrl }: any = query;
        if (backUrl && backUrl != "/loginAccount/step1" && backUrl != "/") {
          router.replace({ path: backUrl, query });
        } else {
          router.replace({ name: "wallet" });
        }
      } catch (err) {
        errBool = false;
        pwdErr.value = true
      } finally {
        loading.value = false;
      }
      return errBool;
    };
    // cryptographic check
    const pwdErr = ref(false)
    const asynPwd = async (val: string) => {
      pwdErr.value = false;
      if (!val) {
        pwdErr.value = true;
        return t("createAccountpage.pwdRequired");
      }
      try {
        const accountInfo = state.account.accountInfo;
        const { keyStore } = accountInfo;
        const data: CreateWalletByJsonParams = {
          password: password.value,
          json: keyStore,
        };
        await createWalletByJson(data);
      } catch (err) {
        pwdErr.value = true;
        return t("loginwithpassword.wrong_password");
      }
      return true;
    };

    const resetmodule = ref(false);
    const reset = () => {
      router.push({
        name: "resetPwd-step1",
        query: { toName: "loginAccount-step1" },
      });
    };
    const cancel = () => {
      resetmodule.value = false;
    };

    const getConfirmPwd = async () => {
      // @ts-ignore
      const pwd = await chrome.storage.local.get("comfirm_password");
      return pwd && pwd.comfirm_password ? pwd.comfirm_password : "";
    };
    // Verifying login status
    const checkConfirmPwd = async () => {
      const pwd = await getConfirmPwd();
      // @ts-ignore
      await chrome.storage.local.set({ comfirm_password: "" });
      if (!pwd) {
        return;
      }
      //Unlock the keyStore file of the current account with a password
      const data: CreateWalletByJsonParams = {
        password: pwd,
        json: keyStore,
      };
      try {
        await createWalletByJson(data);
        resetmodule.value = true;
      } catch (err) {
        console.log(err);
      }
    };

    onMounted(() => {
      checkConfirmPwd();
      let time = setTimeout(() => {
        const ipt = document.querySelector('input')
        ipt.focus()
        console.warn('get focus...',ipt.focus)
        clearTimeout(time)
      },300)

    });

    const reset_flag = ref(true);
    const handleComfirm = () => {};
    return {
      t,
      handleComfirm,
      asynPwd,
      cancel,
      reset_flag,
      loading,
      password,
      onSubmit,
      switchPassType,
      toggleMask,
      checkPwd,
      pwdErr,
      reset,
      resetmodule,
      iptRef
    };
  },
};
</script>
<style lang="scss" scoped>
.btn-box {
  margin: 50px 28px 30px;
}
.reset-box {
  color: #828184;
}
.title {
  .iconele {
    width: 19px;
  }
  .tit-big {
    line-height: 21px;
    font-weight: bolder;
  }
  .tit-small {
    color: #B3B3B3;
  }
}

.create-new-password {
  .tit-small {
    color: #B3B3B3;
  }
  .right {
    color: #9F54BA;
    text-decoration: underline;
  }

  .icon-yanjing1 {
    color: #9F54BA;
  }
  :deep(.van-field__label) {
    display: none;
  }
  :deep(.van-field__error-message) {
    margin-bottom: 12px;
  }
  :deep(.van-cell:after) {
    display: none;
  }
  :deep(.van-cell) {
    padding: 0;
  }
  :deep(.van-field__body) {
    height: 42px;
    margin-bottom: 10px;
    padding: 0 10px;
    border-radius: 5px;
    transition: ease 0.3s;
    font-size: 12px;
  
  }
}
.tool {
  color: #9F54BA;
}
.underline {
  text-decoration: underline;
}
</style>