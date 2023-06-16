<template>
  <div class="importByMnemonic">
    <van-sticky>
      <NavHeader :hasRight="false">
        <template v-slot:left>
          <van-icon name="arrow-left" @click="back" class="back-icon" />
        </template>
        <template v-slot:title>
          <div class="tit">{{t('importByMnemonic.importfrommnemonic')}}</div>
        </template>
      </NavHeader>
    </van-sticky>
    <div class="page-container">
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="mnemonic"
            name="mnemonic"
            type="textarea"
            maxlength="100"
            :label="$t('importByMnemonic.mnemonic')"
            :placeholder="$t('importByMnemonic.mnemonic')"
            show-word-limit
            :rules="[{ required: true, message: t('importByMnemonic.input') }]"
          />
          <van-field
            v-model="password"
            type="password"
            name="password"
            :label="$t('importByMnemonic.password')"
            :placeholder="$t('importByMnemonic.password')"
            :rules="[{ required: true, message: t('importByMnemonic.password') }]"
          />
          <van-field
            v-model="password2"
            type="password"
            name="password2"
            :label="$t('importByMnemonic.password2')"
            :placeholder="$t('importByMnemonic.password2')"
            :rules="[{ required: true, message: t('importByMnemonic.password2') }]"
          />
        </van-cell-group>
        <div style="margin: 16px">
          <van-button
            :loading="loading"
            round
            block
            type="primary"
            native-type="submit"
          >
            {{t('importByMnemonic.import')}}
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>
<script lang="ts">
// Use mnemonic words to import your wallet
import NavHeader from "@/popup/components/navHeader/index.vue";
import { getPath } from "@/popup/utils/ether";
import { encryptPrivateKey, EncryptPrivateKeyParams } from "@/popup/utils/web3";
import { useI18n } from 'vue-i18n'
import {
  Field,
  CellGroup,
  Cell,
  Form,
  Sticky,
  Icon,
  Button,
  Toast,
} from "vant";
import { Ref, ref, useSlots } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { Mnemonic } from "@/popup/store/modules/account";
import { utils } from 'ethers'
import  { web3 } from '@/popup/utils/web3'
import { passwordExpires } from '@/popup/enum/time'
import { setCookies } from '@/popup/utils/jsCookie'
import localforage from 'localforage';

export default {
  components: {
    [Field.name]: Field,
    [CellGroup.name]: CellGroup,
    [Cell.name]: Cell,
    [Form.name]: Form,
    [Sticky.name]: Sticky,
    [Icon.name]: Icon,
    [Button.name]: Button,
    NavHeader,
  },
  setup() {
    const{t}=useI18n()
    const store = useStore();
    const { commit, dispatch } = store;
    const router = useRouter();
    const mnemonic: Ref<string> = ref("");
    const password: Ref<string> = ref("");
    const password2: Ref<string> = ref("");
    const loading: Ref<boolean> = ref(false);
    const onSubmit = (values: Object) => {
      loading.value = true;
      console.log("submit", values);
      // Verify that passwords are consistent
      if (password.value == password2.value) {
        // Store password
        setCookies("password", password2.value, passwordExpires);
        const pathIndex = "0";
        const mnemonicParams: any = {
          pathIndex,
          path: getPath(pathIndex),
          phrase: mnemonic.value.trim()
        };
        store
          .dispatch("account/createWalletByMnemonic", mnemonicParams)
          .then(async (wallet) => {
            const { privateKey,address } = wallet;
            const params: EncryptPrivateKeyParams = {
              privateKey,
              password: password.value
            };
            // Generate a keystore file based on the password private key
            const keyStore = encryptPrivateKey(params);
            // Encrypt mnemonic storage according to password
            console.log('web3---------', web3)
            const mnemonicData = encryptPrivateKey({
              privateKey: web3.utils.toHex(mnemonic.value),
              password: password.value,
            })
            await localforage.setItem('mnemonic', mnemonicData)
            await dispatch("account/addAccount", {
              keyStore,
              mnemonic: mnemonicParams,
              address,
              imported: true
            });
            // Store mnemonics and paths
            commit("account/UPDATE_MNEMONIC", mnemonicParams);
            commit("account/UPDATE_WALLET", wallet);
            commit("account/UPDATE_KEYSTORE", keyStore);
            router.replace({
              name: "wallet",
            });
          })
          .finally(() => (loading.value = false));
      } else {
        // The entered passwords are inconsistent
        Toast(t('importByMnemonic.notmatch'));
        loading.value = false;
      }
    };
    const back = () => {
      router.go(-1);
    };
    return {
      t,
      mnemonic,
      password,
      password2,
      onSubmit,
      back,
      loading,
    };
  },
};
</script>
<style lang="scss">
.importByMnemonic {
  .tit {
    font-size: 16px;
  }
  .back-icon {
    color: #9F54BA;
    font-size: 22px;
    margin-left: -6px;
  }
}
</style>
