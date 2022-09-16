<template>
  <van-sticky>
    <NavHeader title="Close" :hasRight="true">
      <template v-slot:title>
        <div class="flex center title">{{ t("sidebar.recoveryPhrase") }}</div>
      </template>
    </NavHeader>
  </van-sticky>
  <div class="content">
    <div class="bg-box pt-22 pb-22 pl-20 pr-20">
      <div class="flex between">
        <div class="flex center icon-box">
          <van-icon name="warning" />
        </div>
        <div class="f-12 lh-16 ml-8 text-box text-left">
          {{ t("recoveryPhrase.warn") }}
        </div>
      </div>
    </div>
    <div class="con-box" v-if="checkFlag">
      <div class="tab-box">
        <div class="flex between btn-box mt-22">
          <div
            :class="`flex-1 hover ${item.select ? 'active' : ''} ${
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
      </div>
      <div v-show="tabVal.value == 1">
        <div class="ml-14 mr-14 mt-14 mnemonic-box f-12 reactive">
          {{ mnemonic }}
          <i class="iconfont icon-fuzhi2 hover" @click="toCopy"></i>
        </div>
      </div>
      <div v-show="tabVal.value == 2" class>
        <div class="flex center">
          <div class="code-box flex center mt-16">
            <qrcode-vue
              :value="mnemonicData"
              class="code"
              :size="300"
              level="L"
              ref="coderef"
            ></qrcode-vue>
          </div>
        </div>
<!--        <div class="load-btn flex center h-30 hover f-12" @click="download">-->
<!--          <span>{{ t("exportprivatekey.saveQRcode") }}</span>-->
<!--          <i class="iconfont icon-xiazai1"></i>-->
<!--        </div>-->
      </div>
      <div class="btn-groups">
      <div class="container pl-28 pr-28">
        <van-button   @click="toCopy" v-show="tabVal.value == 1"  block>{{t('transferNft.copy')}}</van-button>
        <van-button style="border: 1px solid rgba(2, 135, 219, 1);color: rgba(2, 135, 219, 1)" icon="iconfont icon-xiazai1"  @click="download" v-show="tabVal.value == 2"  block>{{t('transferNft.downQR')}}</van-button>
      </div>
        </div>
    </div>
    <div v-else>
      <div class="pwd-tit lh-30 f-12">{{t('createAccountpage.password')}}</div>
      <div :class="`ipt ${pwdErr ? 'error' : ''}`">
        <van-field
          v-model="password"
          type="password"
          :placeholder="t('exportprivatekey.unlockP')"
          @keydown.enter="unlock"
        />
      </div>
      <div class="btn-groups">
        <div class="container pl-28 pr-28">
          <van-button @click="unlock" type="primary" block>{{t('transferNft.confirm')}}</van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  CreateWalletByJsonParams,
  CreateWalletByMnemonicParams,
} from "@/popup/utils/ether";
import { setCookies, getCookies } from "@/popup/utils/jsCookie";
import { ref, Ref, computed, toRaw, SetupContext, onMounted } from "vue";
import {
  Icon,
  NavBar,
  Form,
  Field,
  CellGroup,
  Button,
  Toast,
  Sticky,
} from "vant";
import useClipboard from "vue-clipboard3";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
// @ts-ignore
import { encrypt, decrypt } from "@/popup/utils/cryptoJS.js";
import { useI18n } from "vue-i18n";
import {parseMnemonic} from "@/popup/utils/web3";
import QrcodeVue from "qrcode.vue";
import { downloadBase64Img } from "@/popup/utils/utils";
import NavHeader from "@/popup/components/navHeader/index.vue";
import localforage from "localforage";
import { useToast } from "@/popup/plugins/toast";
export default {
  components: {
    [Icon.name]: Icon,
    [Button.name]: Button,
    [Sticky.name]: Sticky,
    [Field.name]: Field,
    QrcodeVue,
    NavHeader,
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const store = useStore();
    const route = useRoute();
    const btnList = ref([
      {
        name: t("exportprivatekey.copytext"),
        value: 1,
        select: true,
        icon: "icon-fuzhi2",
      },
      {
        name: t("exportprivatekey.qrcode"),
        value: 2,
        select: false,
        icon: "icon-erweima1",
      },
    ]);
    const mnemonic = ref("");

    const handleClick = (item: any) => {
      btnList.value.forEach((child: any) => {
        child.select = false;
        if (child.value == item.value) {
          child.select = true;
        }
      });
    };

    const mnemonicData = computed(() => {
      return JSON.stringify({ type: "mnemonic", data: mnemonic.value });
    });

    // Copy user address
    const { toClipboard } = useClipboard();
    const toCopy = async () => {
      try {
        await toClipboard(mnemonic.value);
        Toast.success(t("copy.titlekyc"));
      } catch (e) {
        console.error(e);
      }
    };
    const download = () => {
      downloadBase64Img();
    };
    const checkFlag = ref(false);
    const password = ref("");
    // Selected tab
    const tabVal = computed(() => btnList.value.find((item) => item.select));
    const pwdErr = ref(false)
    const { $toast } = useToast();
    const  unlock = async () => {
      pwdErr.value = false
      try {
        // Unlock the keystore file of the current account through the password
          parseMnemonic(password.value).then(res => {
             mnemonic.value = res;
             pwdErr.value = true
             checkFlag.value = true;

          });
      } catch (err) {
        // pwdErr.value = true
        $toast.fail(err.toString());
      }
    };
    return {
      t,
      btnList,
      handleClick,
      tabVal,
      mnemonic,
      mnemonicData,
      password,
      toCopy,
      download,
      checkFlag,
      unlock,
      pwdErr
    };
  },
};
</script>

<style lang="scss" scoped>
.pwd-tit {
  padding: 0 26px 0;
}
.ipt {
  height: 44px;
  background: #ffffff;
  margin: 0 26px 10px;
  border-radius: 5px;
  padding: 10px;
  //border: 1px solid #bbc0c5;
  &.error {
    border-color: #d73a49;
  }
  .van-field {
    padding: 0;
  }
}
.tab-box {
  .flex-1.active {
    i {
      color: #037cd6;
    }
    color: #037cd6;
  }
  i {
    font-size: 32px;
  }
}
.bg-box {
  background: #f4faff;
  margin: 15px 15px 25px;
  border-radius: 7.5px;
  .icon-box {
    color: #037cd6;
    i {
      font-size: 16px;
    }
  }
  .text-box {
    width: 100%;
  }
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
}
.mnemonic-box {
  min-height: 100px;
  padding: 15px;
  box-sizing: border-box;
  word-break: break-all;
  background: #f4faff;
  position: relative;
  border-radius: 5px;
  border: 1px solid #bbc0c5;
  color: #848484;
  i {
    position: absolute;
    right: 10px;
    color: #037cd6;
    bottom: 10px;
  }
}
.code {
  width: 214px !important;
  height: 214px !important;
}
.code-box {
  width: 236px;
  height: 236px;
  border: 7px solid #000;
  padding: 1px;
}
.load-btn {
  width: 250px;
  background: #f4faff;
  border-radius: 30px;
  margin: 15px auto 0;
  color: #037cd6;
  i {
    font-size: 12px;
  }
  &:hover {
    background: #dcecf9;
  }
}
</style>