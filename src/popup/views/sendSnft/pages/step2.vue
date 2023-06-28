<template>
  <div class="step2-page-box">
    <div class="p-14 userinfo-box">
      <div :class="`userinfo ${addressErr ? 'error' : ''}`">
        <div class="from flex column between">
          <div
            class="information p-14 flex between"
            @click="handleShowAccountModal"
          >
            <div class="flex center-v">
              <div class="avatar flex center">
                <AccountIcon :data="accountInfo.icon" />
              </div>
              <div
                class="flex column between userinformation center-h pt-4 pb-4"
              >
                <div class="username mb-4" v-show="accountInfo.name">
                  {{ accountInfo.name }}
                </div>
                <div class="userbalance">
                  {{ t("sendto.balance") }}:{{ decimal(accountInfo.amount) }}
                  {{ currentNetwork.currencySymbol }}
                </div>
              </div>
            </div>
            <div class="flex center up-down-box">
              <van-icon :name="`${showModal ? 'arrow-up' : 'arrow-down'}`" />
            </div>
          </div>
        </div>
        <div class="line-box flex between center-v pl-16 pr-16">
          <div class="line van-hairline--bottom"></div>
          <div class="text-bold f-12">{{ t("sendSNFT.to") }}</div>
          <div class="line van-hairline--bottom"></div>
        </div>
        <div class="to from flex between center-v">
          <div
            class="add-ipt flex center-v between pl-14 pr-14"
            v-show="!hasChooseAddress"
          >
            <van-field
              :placeholder="$t('sendSNFT.addAddress')"
              v-model="toAddress"
              @blur="checkAddress"
            ></van-field>
            <div
              class="flex right center-v"
              v-show="hasChooseAddress && !addressErr"
            >
              <van-icon
                name="cross"
                class="clearAddress"
                @click="clearAddress"
              />
            </div>
            <div v-show="addressErr" class="flex right center-v clearIcon">
              <van-icon name="cross" @click="clearAdd" />
            </div>
          </div>
          <div class="information p-14 flex between" v-show="hasChooseAddress">
            <div class="flex">
              <div class="avatar flex center">
                <AccountIcon :data="account.data.icon" />
              </div>
              <div
                :class="`flex ${
                  account.data.name ? 'between column' : 'center-v'
                }   userinformation center-h pt-4 pb-4`"
              >
                <div class="username mb-4" v-show="account.data.name">
                  {{ account.data.name }}
                </div>
                <div class="userbalance">
                  {{ t("sendto.address") }}:{{
                    addressMask(account.data.address)
                  }}
                </div>
              </div>
            </div>
            <div
              class="flex right center-v between to-btns"
              v-show="!hasChooseAddress"
            >
              <i class="iconfont icon-saoma hover"></i>
            </div>
            <div class="flex right center-v" v-show="hasChooseAddress">
              <van-icon
                name="cross"
                class="clearAddress"
                @click="clearAddress"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="error-tip f-12 mt-8 lh-14" v-show="addressErr">
        {{ t("sendNFT.enterErr") }}
      </div>
    </div>
    <van-tabs v-model:active="active" sticky shrink offset-top="48px">
      <van-tab name="1" :title="t('contacts.tab_contacts')">
        <!-- <AccountList @handleClick="handleClickAccount" :accountList="contacts3" :offsetTop="94" :indexList="indexList3" /> -->
        <AccountList
          @handleClick="handleClickAccount"
          :indexList="indexList3"
          :accountList="contacts3"
          :offsetTop="46"
        />
      </van-tab>
      <van-tab name="2" :title="t('contacts.tab_recents')">
        <AccountList
          @handleClick="handleClickAccount"
          :indexList="indexList2"
          :accountList="contacts2"
          :offsetTop="46"
        />
      </van-tab>
      <van-tab name="3" :title="t('contacts.tab_rolodex')">
        <AccountList
          @handleClick="handleClickAccount"
          :indexList="indexList"
          :accountList="contacts"
          :offsetTop="46"
        />
      </van-tab>
    </van-tabs>
    <van-sticky position="bottom" offset-bottom="30px" v-if="hasChooseAddress">
      <div class="flex center btn-group">
        <van-button
          type="primary"
          @click="gonext"
          block
          >{{ t("sendSNFT.send") }}</van-button
        >
      </div>
    </van-sticky>
    <AccountModal v-model="showModal" />
    <SendSuccessModal v-model="showSendSuccessModal" />
    <SendNftModal v-model="showSendModal" :tx="tx" @handleComfirm="handleComfirm" />
  </div>
</template>

<script lang="ts">
import {
  reactive,
  ref,
  computed,
  Ref,
  toRaw,
  watch,
  SetupContext,
  onUnmounted,
} from "vue";
import {
  Icon,
  Toast,
  Button,
  Sticky,
  Field,
  Slider,
  Tab,
  Tabs,
  Empty,
} from "vant";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import NavHeader from "@/popup/components/navHeader/index.vue";
import AccountIcon from "@/popup/components/accountIcon/index.vue";
import AccountList from "@/popup/views/account/components/accountList/index.vue";
import { AccountInfo } from "@/popup/store/modules/account";
import { addressMask, decimal } from "@/popup/utils/filters";
import { utils } from "ethers";
import { getRandomIcon } from "@/popup/utils";
import BigNumber from "bignumber.js";
import AccountModal from "@/popup/components/accountModal/index.vue";
import { useI18n } from "vue-i18n";
import SendConfirm from "@/popup/views/transferAccounts/components/sendComfirm.vue";
import ContactsList from "@/popup/views/settings/pages/contacts/components/contactsList.vue";
import SendSuccessModal from "@/popup/components/sendSuccessModal/index.vue";
import SendNftModal from '@/popup/views/sendSnft/components/sendSnftModal.vue'
import { useTradeConfirm } from "@/popup/plugins/tradeConfirmationsModal";
import { TradeStatus } from '@/popup/plugins/tradeConfirmationsModal/tradeConfirm';

export default {
  name: "sendSnft-step2",
  components: {
    [Icon.name]: Icon,
    [Toast.name]: Toast,
    [Button.name]: Button,
    [Sticky.name]: Sticky,
    [Field.name]: Field,
    [Slider.name]: Slider,
    [Tabs.name]: Tabs,
    [Tab.name]: Tab,
    [Empty.name]: Empty,
    NavHeader,
    AccountIcon,
    AccountList,
    AccountModal,
    SendConfirm,
    ContactsList,
    SendSuccessModal,
    SendNftModal,
  },
  setup(props: any, context: SetupContext) {
    const router = useRouter();
    const active = ref("1");
    const store = useStore();
    const { state } = store;
    const { commit } = store;
    const { t } = useI18n();
    const { query } = useRoute();
    const { dispatch } = store;
    const accountInfo = computed(() => store.state.account.accountInfo);
    const currentNetwork = computed(() => store.state.account.currentNetwork);
    const nextLoading = ref(false);
    const addressErr = ref(false);
    const {$tradeConfirm} = useTradeConfirm()
    const chooseToken = computed(() => {
      const symbol = currentNetwork.value.currencySymbol;
      const balance = accountInfo.value.amount;
      const data = {
        balance,
        logoUrl: "",
        name: symbol,
        precision: 1,
        symbol,
        tokenContractAddress: null,
      };
      const token = store.state.transfer.chooseToken;
      if (token) {
        return token;
      } else {
        return data;
      }
    });
    // Selected contact data
    const chooseContact = computed(() => store.state.transfer.chooseContact);
    const account = reactive({ data: {} });
    const hasChooseAddress: Ref<boolean> = ref(false);
    // Clear selection
    const cancelAccount = () => {
      account.data = {};
    };
    const toAddress: Ref<string> = ref("");
    const tx = ref({})
    // Submit send snft
    const loading = ref(false);
    const gonext = async () => {
      try {
        await checkAddress();
        const sendList = JSON.parse(sessionStorage.getItem("sendSnftList"));
        const list = []
        for  (let item of sendList) {
              let { MergeLevel, nft_address } = item
              switch(MergeLevel){
                case 0:
                  break;
                case 1:
                nft_address = nft_address.substr(0,41)
                  break;
                case 2:
                nft_address = nft_address.substr(0,40)
                  break;
              }
              list.push(nft_address)
            }
        tx.value = {
          from: accountInfo.value.address,
          to:toAddress.value,
          nft_address: list,

        }
        showSendModal.value = true
      } catch (err) {
        console.error(err.toString());
      }
    };

    // Generate cache based on input address
    function createCache() {
      let data = {};
      if (toAddress.value) {
        data = {
          address: toAddress.value,
          icon: getRandomIcon(),
        };
      } else {
        data = toRaw(account);
      }
      return data;
    }
    // Verify address format
    function checkAddress() {
      try {
        utils.getAddress(toAddress.value);
        account.data = createCache();
        addressErr.value = false;
        return Promise.resolve();
      } catch (err) {
        addressErr.value = true;
        return Promise.reject();
      }
    }
    // Listen and select token
    watch(
      () => chooseToken,
      (n) => {},
      { deep: true, immediate: true }
    );
    // Whether the status of the address is selected
    watch(
      () => account,
      (n) => {
        const data = toRaw(n);
        if (JSON.stringify(data.data) == "{}") {
          hasChooseAddress.value = false;
          return;
        }
        hasChooseAddress.value = true;
      },
      {
        deep: true,
        immediate: true,
      }
    );

    const showModal: Ref<boolean> = ref(false);
    const handleShowAccountModal = () => {
      showModal.value = true;
    };

    // Jump to select contacts
    const toContacts = () => {
      router.replace({ name: "contacts-list", query: { backUrl: "send" } });
    };

    // Clear selected addresses
    const clearAddress = () => {
      account.data = {};
      toAddress.value = "";
    };

    // Jump to select token
    const handleTokenModal = () => {
      router.replace({ name: "receive-choose", query: { backUrl: "send" } });
    };

    // Amount change event
    const changeAmount = (v: any) => {
      commit("transfer/UPDATE_AMOUNT", Number(v));
    };
    // Custom gas, change events
    const gasFee = ref(10);
    const onChange = () => {};

    // Select account
    const handleClickAccount = (acc) => {
      console.log("choose account111", acc.address);
      addressErr.value = false;
      account.data = acc;
      toAddress.value = acc.address;
    };

    // My account list data
    const alist3 = computed(() => {
      // Split into two-dimensional arrays according to the first letter
      const list = state.account.accountList.map((item: any) => item);
      list.sort((a: any, b: any) => {
        return (a.name + "").localeCompare(b.name + "");
      });
      const newl = list.filter((item: any) => item);

      const arr: any = [];
      newl.forEach((item: any) => {
        const { name } = item;
        const label = name.substr(0, 1);
        const f = arr.find((child: any) => child.label == label);
        if (f) {
          arr.forEach((sun: any) => {
            sun.label == label ? sun.children.push({ ...item }) : "";
          });
        } else {
          arr.push({ label, children: [{ ...item }] });
        }
      });
      return arr;
    });
    let contacts3 = alist3;
    const indexList3 = computed(() => {
      return contacts3.value.map((item: any) => item.label);
    });
    // recent contacts
    const alist2 = computed(() => {
      // Split into two-dimensional arrays according to the first letter
      const list = state.account.recentList.map((item: any) => item);
      list.sort((a: any, b: any) => {
        return (a.name + "").localeCompare(b.name + "");
      });
      const newl = list.filter((item: any) => item);

      const arr: any = [];
      newl.forEach((item: any) => {
        const { name } = item;
        const label = name.substr(0, 1);
        const f = arr.find((child: any) => child.label == label);
        if (f) {
          arr.forEach((sun: any) => {
            sun.label == label ? sun.children.push({ ...item }) : "";
          });
        } else {
          arr.push({ label, children: [{ ...item }] });
        }
      });
      return arr;
    });
    let contacts2 = alist2;
    const indexList2 = computed(() => {
      return contacts2.value.map((item: any) => item.label);
    });
    // Business card holder
    const alist = computed(() => {
      // Split into two-dimensional arrays according to the first letter
      const list = state.account.contacts.map((item: any) => item);
      list.sort((a: any, b: any) => {
        return (a.name + "").localeCompare(b.name + "");
      });
      const newl = list.filter((item: any) => item);

      const arr: any = [];
      newl.forEach((item: any) => {
        const { name } = item;
        const label = name.substr(0, 1);
        const f = arr.find((child: any) => child.label == label);
        if (f) {
          arr.forEach((sun: any) => {
            sun.label == label ? sun.children.push({ ...item }) : "";
          });
        } else {
          arr.push({ label, children: [{ ...item }] });
        }
      });
      return arr;
    });
    let contacts = alist;
    const indexList = computed(() => {
      return contacts.value.map((item: any) => item.label);
    });
    const showSendSuccessModal = ref(false);

    // clear address
    const clearAdd = () => {
      toAddress.value = "";
      addressErr.value = false;
    };


    const handleComfirm = async() => {
      loading.value = true;
      showSendModal.value = false
        try {
          // Snft data to be sent
          let sendList = [];
          try {
            sendList = JSON.parse(sessionStorage.getItem("sendSnftList"));
          } catch (err) {
            console.error(err);
          }
          const total = sendList.length
          $tradeConfirm.open({
            disabled: [TradeStatus.pendding],
            callBack(){
              router.replace({ name: "wallet" });
            },
            approveMessage: t('sendSNFT.approveMessage',{total: sendList.length})
          })
          const receiptList = []
          try {
            for await (let item of sendList) {
              let { MergeLevel, nft_address } = item
              switch(MergeLevel){
                case 0:
                  break;
                case 1:
                nft_address = nft_address.substr(0,41)
                  break;
                case 2:
                nft_address = nft_address.substr(0,40)
                  break;
              }
              const tx = {
                to: toAddress.value,
                nft_address,
              };
              const txData = await dispatch("nft/send", tx);
              
              receiptList.push(txData)
            }
            $tradeConfirm.update({status:"approve"})
            const successList = []
            for await (const iterator of receiptList) {
              const re = await iterator.wait()
              successList.push(re)
            }
            $tradeConfirm.update({
              status:'approve'
            })
            await dispatch('account/waitTxQueueResponse')
            if(successList.length == sendList.length) {
              $tradeConfirm.update({status:"success"})
            } else {
              $tradeConfirm.update({
              status:"fail",
              failMessage: t('sendSNFT.failMessage',{total: sendList.length - successList.length}),
})
            }

            // showSendSuccessModal.value = true;
            $tradeConfirm.update({
              status:'success'
            })
          } catch (err) {
            Toast(err.reason);
            $tradeConfirm.update({
              status:"fail",
              failMessage: t('sendSNFT.failMessage2'),
})

          } finally {
            loading.value = false;
          }

          // await dispatch("nft/send", tx);
        } catch (err: any) {
          console.error(err);
          Toast(err?.reason);
        } finally {
          loading.value = false;
        }
    }
    const showSendModal = ref(false)
    return {
      showSendModal,
      handleComfirm,
      showSendSuccessModal,
      gasFee,
      onChange,
      t,
      tx,
      gonext,
      handleTokenModal,
      accountInfo,
      toAddress,
      account,
      hasChooseAddress,
      addressMask,
      cancelAccount,
      checkAddress,
      showModal,
      handleShowAccountModal,
      decimal,
      currentNetwork,
      scroll,
      toContacts,
      clearAddress,
      changeAmount,
      chooseToken,
      handleClickAccount,
      loading,
      active,
      indexList3,
      contacts3,
      alist3,
      indexList2,
      contacts2,
      alist2,
      indexList,
      contacts,
      addressErr,
      clearAdd,
    };
  },
};
</script>

<style lang="scss" scoped>
  :deep(){
    .van-cell {
      padding: 0;
      .van-field__body {
        border: none;
      }
    }
    
  }
.error-tip {
  color: #d73a49;
}
.clearIcon {
  font-size: 16px;
  color: #d73a49;
}
:deep(.van-sticky--fixed) {
  line-height: 46px !important;
  height: 46px !important;
}
:deep(.van-tabs--line .van-tabs__wrap) {
  height: 46px !important;
}
.account-box {
  margin-bottom: 50px;
}

.userinfo-box {
  background: #fff;
}
.clearAddress {
  font-size: 16px;
  color: #9F54BA;
}
.slider-box.amount-info {
  width: 100% !important;
  .value {
    color: #000;
    font-size: 12px;
  }
}
.cancel {
  font-size: 11px;
  color: #9F54BA;
}
.up-down-box {
  i {
    color: #9F54BA;
    font-size: 16px;
  }
  span {
    color: #9F54BA;
    word-break: keep-all;
  }
  font-size: 12px;
  color: #9F54BA;
}
:deep(input) {
  font-size: 12px;
  line-height: 16px;
  font-weight: bold;
}
.amount-info {
  width: 82%;
  .van-cell {
    background: none;
    padding: 0;
  }

  .label,
  .value {
    font-size: 12px;
    color: #a4a4a4;
    line-height: 18px;
    &.equal {
      color: #000;
    }
  }
}
.to-btns {
  width: 20px;
  i {
    color: #9F54BA;
    font-size: 20px;
  }
}
.line-box {
  .line {
    height: 1px;
    width: 46%;
  }
}
.userinfo {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  background: #fff;
  border-radius: 5px;
  border: 1px solid rgba($color: #B3B3B3, $alpha: 0.5);
  &.error {
    border-color: #d73a49;
  }
}
.btn-group {
  margin: 0 20px 0;
}
.from {
  display: flex;
  justify-content: space-around;
  .userfrom {
    font-size: 12px;
    margin-top: 18px;
    width: 76px;
    text-align: center;
  }
  .information {
    border-collapse: collapse;
    width: 100%;
    position: relative;
    &.amount {
      padding: 20px 14px 20px;
    }
    &:hover {
      transition: ease 0.3s;
      background: #F8F3F9;
    }
    .closeIcon {
      position: absolute;
      right: 10px;
      top: 14px;
      font-size: 18px;
      color: #6a737d;
    }
    .jticon {
      position: absolute;
      right: 10px;
      top: 14px;
      &::before {
        color: #6a737d;
      }
    }
    &::after {
      border-radius: 10px;
    }
    .avatar {
      overflow: hidden;
    }
    .userinformation {
      margin-left: 5px;
      .username {
        font-size: 12px;
        line-height: 14px;
      }
      .userbalance {
        line-height: 14px;
        font-size: 12px;
        color: rgba(132, 140, 150, 1);
      }
    }
  }
}
.to {
  display: flex;
  justify-content: space-between;
  .sendto {
    font-size: 12px;
    margin-top: 18px;
    width: 76px;
    text-align: center;
  }
  .add-ipt {
    width: 100%;
    height: 100%;
    padding-top: 11.4px;
    padding-bottom: 11.4px;
    &::after {
      border-radius: 10px;
    }
    & .van-cell {
      padding-left: 0;
    }
    & .van-cell:after {
      display: none;
    }
  }
  .receiver {
    font-size: 12px;
    text-align: center;
    line-height: 46px;
    width: 286px;
    height: 46px;
    border-radius: 10px;
    border: 1px solid rgba(209, 212, 215, 1);
  }
}
.transfer {
  height: 40px;
  line-height: 40px;
  margin-left: 15px;
  font-size: 12px;
  color: rgba(7, 118, 211, 1);
}
.useravatar {
  width: 30px;
  height: 30px;
  background-color: green;
}
.recent {
  .text {
    width: 100%;
    background-color: rgba(241, 243, 244, 1);
    border: 1px solid rgba(216, 216, 216, 1);
    height: 28px;
    line-height: 28px;
    font-size: 12px;
    color: rgba(121, 121, 121, 1);
    padding-left: 15px;
  }
}
:deep(.van-tab--active) {
  color: #9F54BA;
}
:deep(.van-tabs__line) {
  display: none;
}
.btn-box {
  padding: 0 15px;
}
.van-tabs {
  margin-bottom: 50px;
}
</style>