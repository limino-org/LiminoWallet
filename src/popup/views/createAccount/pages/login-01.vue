<template>
  <div>
    <div class="title">
      <img class="iconele flex center" src="@/assets/logo1.png" alt />
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
            :type="`${switchPassType ? 'text' : 'password'}`"
            @click-right-icon="switchPassType = !switchPassType"
            :placeholder="$t('createAccountpage.passwordPlaceholder')"
            :rules="[
              { required: true, message: t('createAccountpage.pwdRequired') },
              { validator: asynPwd, message: t('createAccountpage.pwdWorng') },
              { validator: checkPwd, message: t('createAccountpage.pwdError') },
            ]"
          />
        </van-cell-group>
        <div style="margin: 27px 16px 28px">
          <van-button
            :loading="loading"
            :disable="btnDisabled"
            round
            block
            type="primary"
            native-type="submit"
            >{{ t("createAccountpage.loginIn") }}</van-button
          >
        </div>
      </van-form>
      <div class="text-center f-12">
        <div class="tit-small lh-20 mb-20">
          {{ t("createAccountpage.cantLogin") }}
        </div>
        <div class="lh-20 tool hover" @click="reset">
          {{ t("createAccountpage.resentWallet") }}
        </div>
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
import { setCookies, getCookies, loginOut } from "@/popup/utils/jsCookie";
import { passwordExpires } from "@/popup/enum/time";
import { encryptPrivateKey, EncryptPrivateKeyParams } from "@/popup/utils/web3";
import { web3 } from "@/popup/utils/web3";
import Resetpopup from "@/popup/views/createAccount/components/resetpopup.vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { regPassword1 } from "@/popup/enum/regexp";
import { CreateWalletByJsonParams } from "@/popup/utils/ether";
import { getWallet } from "@/popup/store/modules/account";
import { encrypt, decrypt } from "@/popup/utils/cryptoJS.js";

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
  },
  setup() {
    const password: Ref<string> = ref("");
    const loading = ref(false);
    const { t } = useI18n();
    const switchPassType = ref(false);
    const { dispatch, commit, state } = useStore();
    const router = useRouter();
    const route = useRoute();
    const onSubmit = async (value: object) => {
      loading.value = true;
      checkPwd();
    };
    const toggleMask = () => {
      switchPassType.value
        ? (switchPassType.value = false)
        : (switchPassType.value = true);
    };

    const checkPwd = async () => {
      const accountInfo = state.account.accountInfo;
      const { keyStore } = accountInfo;
      const { currentNetwork } = state.account;
      const data: CreateWalletByJsonParams = {
        password: password.value,
        json: keyStore,
      };
      let errBool = true;
      try {
        await dispatch("account/createWalletByJson", data);
        setCookies("password", password.value);
        dispatch("account/updateAccount", currentNetwork);
        dispatch("account/updateBalance");
        const { query } = route;
        const { backUrl }: any = query;
        if (backUrl && backUrl != "/loginAccount/step1") {
          router.replace({ path: backUrl, query });
        } else {
          router.replace({ name: "wallet" });
        }
      } catch (err) {
        errBool = false;
        // Toast(t("loginwithpassword.wrong_password"));
      } finally {
        loading.value = false;
      }
      return errBool;
    };
    // cryptographic check

    const asynPwd = (val: string) => {
      if (regPassword1.test(password.value)) {
        return true;
      }
      return false;
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
    // Verifying login status
    const checkTime = () => {
      const resetpwdtk = localStorage.getItem("resetpwdtk");
      const { time } = route.query;

      if (!time || !resetpwdtk) {
        return false;
      }
      const tk = decrypt(resetpwdtk, time.toString());
      if (!resetpwdtk || !time || tk != "reset-token" + time) {
        localStorage.removeItem("resetpwdtk");
        return false;
      }
      return true;
    };
    const flag = checkTime();

    if (flag) {
      // pop-up window
      resetmodule.value = true;
    }

    const handleComfirm = () => {};
    return {
      t,
      handleComfirm,
      asynPwd,
      cancel,
      loading,
      password,
      onSubmit,
      switchPassType,
      toggleMask,
      checkPwd,
      reset,
      resetmodule,
    };
  },
};
</script>
<style lang="scss" scoped>
.title {
  .iconele {
    width: 50px;
    // height: 60px;
    margin: 50px auto 10px;
  }
  .tit-big {
    line-height: 21px;
    font-weight: bolder;
  }
  .tit-small {
    color: #bbc0c5;
  }
}

.create-new-password {
  .tit-small {
    color: #bbc0c5;
  }
  .right {
    color: #037cd6;
    text-decoration: underline;
  }

  .icon-yanjing1 {
    color: #037dd6;
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
    border: 1px solid #adb8c5;
    margin-bottom: 10px;
    padding: 0 10px;
    border-radius: 5px;
    transition: ease 0.3s;
    font-size: 12px;
    &:hover {
      border: 1px solid #1989fa;
    }
  }
}
.tool {
  color: #037cd6;
}
.underline {
  text-decoration: underline;
}
</style>