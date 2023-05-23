<template>
    <div class="import introduce">
      <van-icon class="import close-icon" name="cross" @click="gohome" />
      <div class="import icon flex center" name="download">
        <i class="iconfont icon-bottom"></i>
      </div>
      <div class="import account">{{ t("import.importaccount") }}</div>
      <div>
        <div class="content">{{ t("import.announcement") }}</div>
        <div class="content" @click="learnmore">
          {{ t("import.learnmore") }}
        </div>
      </div>
    </div>
    <div class="import operate">
      <div class="copykey">{{ t("import.copy") }}</div>
      <van-form @submit="onSubmit">
        <van-cell-group inset class="text">
          <van-field
            v-model="privatekey"
            autosize
            name="privacy"
            type="textarea"
            class="content"
            :placeholder="$t('import.forexample')"
          />
        </van-cell-group>
        <div style="margin: 16px">
          <van-button round block type="primary" native-type="submit">{{
            t("import.import")
          }}</van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>
<script lang="ts">
import { encryptPrivateKey, EncryptPrivateKeyParams } from "@/popup/utils/web3";
import { ref, SetupContext, Ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  Icon,
  Search,
  Form,
  Field,
  CellGroup,
  Button,
  Dialog,
  Toast,
} from "vant";
import { ethers } from "ethers";
import { hexValue } from "@ethersproject/bytes";
import { useStore } from "vuex";
import { ImportPrivateKey } from "@/popup/utils/ether";
import { setCookies, getCookies } from "@/popup/utils/jsCookie";
import { useI18n } from "vue-i18n";
export default {
  name: "import",
  components: {
    [Icon.name]: Icon,
    [Search.name]: Search,
    [Form.name]: Form,
    [Field.name]: Field,
    [CellGroup.name]: CellGroup,
    [Button.name]: Button,
    [Dialog.Component.name]: Dialog.Component,
  },
  setup(props: any, context: SetupContext) {
    const { t } = useI18n();
    const privatekey: Ref<string> = ref("");
    const router = useRouter();
    const route = useRoute();
    const { commit, dispatch } = useStore();
    // return to previous menu

    const gohome = () => {
      const { backUrl }: any = route.query;
      router.replace({
        name: backUrl || "wallet",
      });
    };
    // Learn more about import
    const learnmore = () => {
      console.log("more...");
    };
    // Import the account using the private key
    const onSubmit = (values: string) => {
      console.log("submit", values);
      console.log(
        "privatekey.value",
        privatekey.value,
        privatekey.value.length
      );
      // Verify whether the private key is valid
      dispatch("account/importPrivateKey", privatekey.value.trim())
        .then(async(wallet) => {
          const { privateKey, mnemonic, address } = wallet;
          const password = await getCookies("password") || "";
          if (!password) {
            router.replace({ name: "loginAccount-step1" });
            return false;
          }

          const params: EncryptPrivateKeyParams = {
            privateKey,
            password,
          };
          const keyStore = encryptPrivateKey(params);
          dispatch("account/addAccount", {
            mnemonic: { path: null, pathIndex: -1 },
            keyStore,
            address,
            imported: true,
          });
          commit("account/UPDATE_KEYSTORE", keyStore);
          router.push("/importsuccess");
        })
        .catch(({ reason }) => {
          // Status of login failure
          privatekey.value = "";
          Dialog.alert({
            title: t("importerror.oops"),
            message: reason || t("importerror.cannotenter"),
            confirmButtonText: t("importerror.sure"),
          });
        });
    };

    return {
      t,
      privatekey,
      gohome,
      learnmore,
      onSubmit,
    };
  },
};
</script>


<style lang="scss" scoped>
.introduce {
  width: 100%;
  height: 319px;
  background-color: #9F54BA;
  .close-icon {
    display: inline-block;
    position: absolute;
    right: 20px;
    top: 20px;
    height: 14px;
    width: 14px;
    font-size: 18px;
    // background-color: #fff;
  }
  .icon {
    width: 38px;
    height: 38px;
    padding-left: 18px;
    padding-top: 15px;
    i {
      font-size: 40px;
    }
  }
  .account {
    font-size: 30px;
    line-height: 30px;
    text-align: left;
    margin-left: 19px;
    margin-top: 29px;
    margin-bottom: 38px;
  }
  .content {
    font-size: 12px;
    line-height: 12px;
    margin-left: 19px;
    margin-bottom: 14px;
    word-wrap: break-word;
    word-break: break-all;
  }
}
.operate {
  padding: 0 20px;
  height: 335px;
  .copykey {
    font-size: 15px;
    line-height: 15px;
    margin-top: 30px;
    margin-left: 18px;
  }
  .text {
    margin: 29px auto 0;
    padding: 50px 0px;
    background: #ffffff;
    // border-radius: 3px;
    // border: 1PX solid #e8e9eb;
    .content {
      padding: 0 20px;
      font-size: 14px;
    }
  }
  .scanning {
    font-size: 12px;
    margin: 0 auto;
    width: 77px;
    height: 17px;
  }
  .button {
    margin: 20px 25px;
    width: 325px;
    height: 45px;
    background: #9F54BA;
    border-radius: 24px;
  }
}
.van-dialog {
  top: 415px !important;
  height: 125px;
  width: 235px;
  .van-dialog__header {
    font-size: 15px !important;
    line-height: 15px;
    margin-top: -5px;
    margin-bottom: 5px;
  }
  .van-dialog__message {
    font-size: 11px !important;
    padding: 0 !important;
  }
}
</style>
