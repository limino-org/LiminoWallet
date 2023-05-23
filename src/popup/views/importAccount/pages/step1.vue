<template>
  <div class="importAccount-page">
    <Tip :message="t('import.hint')"/>
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
        <van-form>
          <van-cell-group inset :class="`${errReason ? 'error' : ''} text`">
            <van-field
              v-model="privatekey"
              autosize
              type="textarea"
              :class="` content`"
              :placeholder="t('import.forexample')"
            />
          </van-cell-group>
          <div class="error mt-6" v-show="errReason">
            <div @click="toCopy" class="hover" v-if="errAddress">{{errAddress}}</div>
            <div>{{errReason}}</div>
          </div>
          <div class="btn-group">
            <div class="container pl-28 pr-28">
              <van-button round block type="primary" :loading="loading" @click="onSubmit">{{
                t("import.import")
              }}</van-button>
            </div>
          </div>
        </van-form>
      </div>
    </div>
    <div v-show="tabVal.value == 2">
      <div class="import operate">
        <van-form>
          <van-cell-group inset class="text">
            <van-field
              v-model="privatekey"
              autosize
              type="textarea"
              class="content"
              :placeholder="t('import.forexample')"
            />
          </van-cell-group>

          <div class="btn-group">
            <div class="container pl-28 pr-28"></div>
            <van-button round block type="primary" :loading="loading" @click="onSubmit">{{
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
import Tip from "@/popup/components/tip/index.vue";
import useClipboard from 'vue-clipboard3'

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
    Tip
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
    const loading = ref(false)
    const errAddress = ref()
    const errReason = ref()
    // Import account using private key
    const onSubmit = (values: string) => {
      loading.value = true
      errAddress.value = ''
      errReason.value = ''
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
        .catch(({ reason, address }) => {
          // Login failed status
          privatekey.value = "";
          errAddress.value = address
          errReason.value = reason
          // $dialog.open({
          //   type:'warn',
          //   message:!address ? reason || t("importerror.cannotenter") : null,
          //   element: address ? document.getElementById('errInnerElement') : null
          // });
        }).finally(() => {
          loading.value = false
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

        // Copy user address
    const { toClipboard } = useClipboard()
    const toCopy = async () => {
      try {
        await toClipboard(`${errAddress.value}`)
        // console.log(accountInfo.value.address)
        $toast.success(t('copy.title'))
      } catch (e) {
        console.error(e)
      }
    }
    return {
      t,
      toCopy,
      privatekey,
      onSubmit,
      tabVal,
      loading,
      active,
      btnList,
      handleClick,
      errAddress,
      errReason
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
    color: #9F54BA;
  }
}

.btn-group {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 25px;
}

.left {
  width: 20px;
  i {
    font-size: 16px;
    color: #9F54BA;
  }
}
a {
  text-decoration: underline;
  color: #9F54BA;
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
  .van-cell-group.error {
    background: #FBF2F3;
    border-color: #D73A49;
    .van-field {
      background: none;
    }
  }
}
.error {
  color: #D73A49;
}
</style>