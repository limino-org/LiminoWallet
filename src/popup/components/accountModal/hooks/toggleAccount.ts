import {
  Ref,
  ref,
  computed,
  toRaw,
} from "vue";
import {
  CreateWalletByJsonParams,
  CreateWalletByMnemonicParams,
} from "@/popup/utils/ether";
import { useStore } from "vuex";
import { parseMnemonic } from "@/popup/utils/web3";
import { setCookies, getCookies, hasLogin } from "@/popup/utils/jsCookie";
import { encryptPrivateKey, EncryptPrivateKeyParams } from "@/popup/utils/web3";
import eventBus from "@/popup/utils/bus";
import router from "@/popup/router";
import { Mnemonic } from "ethers/lib/utils";
import { AccountInfo } from "@/popup/store/modules/account";
import { useExchanges } from "@/popup/hooks/useExchanges";
export const useToggleAccount = () => {
  const store = useStore();
  const { initExchangeData } = useExchanges()
  const { commit, dispatch, state } = store;
  // Loading of creating an account 
  const createLoading: Ref<boolean> = ref(false);
  // Loading State of the account list State of the account list
  const showAccount: Ref<boolean> = ref(false);
  const clickAccountIdx = ref()
  // Switching account list
  const toggleAccount = () => {
    showAccount.value = true;
  };
  const listDom = ref()
  const options = computed(() => store.state.account.accountList);
  // Imported accounts
  const importList = computed(() => {
    return store.state.account.accountList.filter(
      (item: AccountInfo) => item.imported
    );
  });
  // Non-imported accounts
  const defaultlist = computed(() => {
    return store.state.account.accountList.filter(
      (item: AccountInfo) => !item.imported
    );
  });
  // Loading the account 
  const accountLoading: Ref<boolean> = ref(false);
  // Loading An account Select account callback Select account callback
  const handleAccount = async (account: any, idx: number, clickAccountIdx: any) => {
    if (createLoading.value) {
      return;
    }
    accountLoading.value = true;
    clickAccountIdx.value = idx;
    const { currentNetwork } = store.state.account;
    const password: string = await getCookies("password") || "";
    const keyStore = toRaw(account.keyStore);
    const data: CreateWalletByJsonParams = {
      password,
      json: keyStore,
    };
    try {
      const wall = await dispatch("account/createWalletByJson", data);
      commit("account/UPDATE_ACCOUNTINFO", account);
      // eventBus.emit('changeAccount', wall.address)

      dispatch("account/updateTokensBalances");
      const wallet = await dispatch("account/getProviderWallet");
      dispatch("account/getExchangeStatus").then(res => {
        if(res.status == 2 && res.ExchangerFlag){
          initExchangeData()
        }
      })
      const { address } = wallet
      eventBus.emit("changeAccount", address);

    } catch (err) {
      const errstr = String(err);
      if (errstr.indexOf("password") > -1) {
        router.replace({ name: "loginAccount-step1" });
      }
    } finally {
      accountLoading.value = false;
      clickAccountIdx.value = null;
    }
    showAccount.value = false;
  };

  // Generate a wallet based on the path
  const createWalletByPath = async (callBack: Function = () => {}) => {
    // Get the current BIP44 path
    const { pathIndex, path }: any = { ...store.state.account.mnemonic };
    const password: string = await getCookies("password") || "";
    let phrase: string = await parseMnemonic(password, store.state.mnemonic.keyStore);
    let mnemonic: CreateWalletByMnemonicParams = { pathIndex, phrase, path };
    let wallet = await dispatch("account/createWallet", mnemonic);
    let { privateKey, address } = wallet;
    // Check whether the account exists. If the account exists, pathIndex + 1 generates a new account 
    const hasAccount = await dispatch("account/hasAccountByAddress", address);
    if (hasAccount) {
      //If the account exists, update the pathIndex + 1 of BIP44
      const pidx = Number(pathIndex) + 1 + "";
      commit("account/UPDATE_MNEMONIC", {
        pathIndex: pidx,
        path,
      });
      createWalletByPath(callBack);
    } else {
      callBack(wallet, mnemonic);
    }
  };

  const createAccount = async() => {
    // Store mnemonic words
    const password: string = await getCookies("password") || "";
    if (!password) {
      router.replace({ name: "loginAccount-step1" });
    }
    return new Promise((resolve,reject) => {
      createWalletByPath(async(wallet: any, mnemonic: Mnemonic) => {
        const { privateKey, address } = wallet;
        const params: EncryptPrivateKeyParams = {
          privateKey,
          password,
        };
        // Store the mnemonic encrypt the password and private key into a keystore/ JSON file for storage 
        const keyStore = encryptPrivateKey(params);
        try {
          await dispatch("account/addAccount", {
            keyStore,
            mnemonic,
            address,
            imported: false,
          })
          dispatch("account/getExchangeStatus").then(res => {
            if(res.status == 2 && res.ExchangerFlag){
              initExchangeData()
            }
          })
          eventBus.emit("changeAccount", wallet.address);
          resolve(wallet)
        }catch(err){
          reject(err)
          console.error(err)
        }
      });
    })

  };
  return {
    showAccount,
    toggleAccount,
    options,
    listDom,
    handleAccount,
    createLoading,
    clickAccountIdx,
    createAccount,
    accountLoading,
    importList,
    defaultlist,
  };
};
