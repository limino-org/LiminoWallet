<template>
  <div class="importAccount-page">
    <div class="importAccount-bg pl-12 pr-12 pt-16 pb-16">
      <div class="flex between">
        <div class="left flex center mr-8">
          <van-icon name="warning" />
        </div>
        <i18n-t
          tag="div"
          keypath="import.hint"
          class="f-12 lh-16 text-box text-left"
        >
          <template v-slot:a>
            <a href="http://" target="_blank" rel="noopener noreferrer">{{
              t("import.hintatag")
            }}</a>
          </template>
        </i18n-t>
        <!-- <div class="f-12 lh-16 mr-30 text-box text-left">{{t('import.hint')}}</div> -->
      </div>
    </div>
    <div class="flex between btn-box mt-22">
      <div
        style="cursor: no-drop"
        :class="`flex-1  ${item.select ? 'active' : ''} ${
          item.value == 1 ? 'van-hairline--right' : ''
        }`"
        v-for="item in btnList"
        :key="item.value"
        @click="handleClick(item)"
      >
        <div class="flex center">
          <i :class="`iconfont ${item.icon}`"></i>
        </div>
        <div class="flex center f-12 lh-16">{{ item.name }}</div>
      </div>
    </div>
    <div v-show="tabVal.value == 1">
      <div class="import operate">
        <van-form @submit="onSubmit">
          <van-cell-group inset class="text">
            <van-field
              v-model="privatekey"
              autosize
              type="textarea"
              class="content"
              :placeholder="$t('import.forexample')"
            />
          </van-cell-group>
          <div class="btn-group">
            <div class="container pl-28 pr-28">
              <van-button round block type="primary" native-type="submit">{{
                t("import.import")
              }}</van-button>
            </div>
          </div>
        </van-form>
      </div>
    </div>
    <div v-show="tabVal.value == 2">
      <div class="import operate">
        <van-form @submit="onSubmit">
          <van-cell-group inset class="text">
            <van-field
              v-model="privatekey"
              autosize
              type="textarea"
              class="content"
              :placeholder="$t('import.forexample')"
            />
          </van-cell-group>
          <div class="btn-group">
            <div class="container pl-28 pr-28"></div>
            <van-button round block type="primary" native-type="submit">{{
              t("import.import")
            }}</van-button>
          </div>
        </van-form>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { encryptPrivateKey, EncryptPrivateKeyParams } from "@/popup/utils/web3";
import { ref, SetupContext, Ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { setCookies, getCookies } from "@/popup/utils/jsCookie";
import {
  Icon,
  Search,
  Form,
  Field,
  CellGroup,
  Button,
  Dialog,
  Toast,
  Tab,
  Tabs,
} from "vant";
import { useI18n } from "vue-i18n";
import { useStore } from "vuex";
import { useBroadCast } from "@/popup/utils/broadCost";
import { useToast } from "@/popup/plugins/toast";
import { useDialog } from "@/popup/plugins/dialog";

export default {
  name: "importAccount-step1",
  components: {
    [Icon.name]: Icon,
    [Search.name]: Search,
    [Form.name]: Form,
    [Field.name]: Field,
    [CellGroup.name]: CellGroup,
    [Button.name]: Button,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [Dialog.Component.name]: Dialog.Component,
  },
  setup() {
    const active = ref(0);
    const { t } = useI18n();
    const privatekey: Ref<string> = ref("");
    const router = useRouter();
    const route = useRoute();
    const { commit, dispatch } = useStore();
    // Listen to the broadcast of the same source window
    const { handleUpdate } = useBroadCast();
    const { $dialog } = useDialog();
    const { $toast } = useToast();
    // Import account using private key
    const onSubmit = (values: string) => {
      console.log("submit", values);
      console.log(
        "privatekey.value",
        privatekey.value,
        privatekey.value.length
      );
      // Verify that the private key is valid
      dispatch("account/importPrivateKey", privatekey.value.trim())
        .then(async (wallet) => {
          const { privateKey, mnemonic, address } = wallet;
          const password = getCookies("password") || "";
          if (!password) {
            router.replace({ name: "loginAccount-step1" });
            return false;
          }
          const params: EncryptPrivateKeyParams = {
            privateKey,
            password,
          };
          const keyStore = encryptPrivateKey(params);
          await dispatch("account/addAccount", {
            mnemonic: { path: null, pathIndex: -1 },
            keyStore,
            address,
            imported: true,
          });
          commit("account/UPDATE_KEYSTORE", keyStore);
          $toast.success(t("importsuccess.success"));
          handleUpdate();
          router.push({ name: "wallet" });
        })
        .catch(({ reason }) => {
          // Login failed status
          privatekey.value = "";
          console.log("$dialog", $dialog);
          $dialog.success(reason || t("importerror.cannotenter"));
        });
    };
    const btnList = ref([
      { name: t("import.input"), value: 1, select: true, icon: "icon-fuzhi" },
      {
        name: t("import.scan"),
        value: 2,
        select: false,
        icon: "icon-saomafukuan-",
      },
    ]);
    // Selected tab
    const tabVal = computed(() => btnList.value.find((item) => item.select));
    const handleClick = (item: any) => {
      Toast(t("importerror.inputofprivatekey"));
    };
    return {
      t,
      privatekey,
      onSubmit,
      tabVal,
      active,
      btnList,
      handleClick,
    };
  },
};
</script>
<style lang="scss" scoped>
.btn-box {
  i {
    font-size: 38px;
  }
  .icon-QRcode {
    font-size: 42px;
  }
  .flex-1.active {
    color: #037cd6;
  }
}
.importAccount-page {
  width: 100%;
}
.btn-group {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 25px;
}
.importAccount-bg {
  background: #f4faff;
  border-radius: 7.5px;
  margin: 15px;
}
.left {
  width: 20px;
  i {
    font-size: 16px;
    color: #037cd6;
  }
}
a {
  text-decoration: underline;
  color: #037cd6;
}
.operate {
  padding: 0 20px;
  height: 100px;
  .copykey {
    font-size: 15px;
    line-height: 15px;
    margin-top: 30px;
    margin-left: 18px;
  }
  .text {
    margin: 29px auto 0;
    // padding: 15px 15px 59px;
    background: #ffffff;
    border-radius: 3px;
    border: 1px solid #e8e9eb;
    .content {
      font-size: 14px;
    }
  }
}
:deep() {
  .van-cell {
    padding: 20px 10px;
    .van-field__body {
      border: none;
    }
  }
}
</style>