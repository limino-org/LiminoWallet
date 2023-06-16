<template>
  <van-sticky>
    <NavHeader :hasRight="false" :hasLeft="false"></NavHeader>
  </van-sticky>
  <div class="send-page">

   <div class="page-container" >
     <!-- Account selection area -->
     <div class="userinfo">
      <!-- sender -->

      <div class="from " :title="formAddr">
        <div class="userfrom">{{ t("sendto.from") }}:</div>
        <!-- Sender information -->
        <div class="information van-hairline--surround">
           
              <div class="userbalance van-ellipsis" :title="accountInfo.address">
                <div class="flex">
            <div class="avatar">
              <AccountIcon :data="accountInfo.icon" />
            </div>
            <div class="flex column userinformation">
              <div class="username">{{ accountInfo.name }}</div>
              <div class="userbalance">
                {{ t("sendto.balance") }}:{{ decimal(accountInfo.amount) }} {{ currentNetwork.currencySymbol }}
              </div>
            </div>
            </div>

                <!-- {{ accountInfo.address }} -->
              <!-- <div class="username van-ellipsis">{{ accountInfo.name }}</div> -->
              <!-- {{ t("sendto.balance") }}:{{ decimal(accountInfo.amount) }}
                {{ currentNetwork.currencySymbol }} -->
            </div>
          </div>
        </div>
      </div>
      <!-- <div class="flex center-v pl-16 pr-16 diffAddr" v-if="!diffAddr">
        <van-icon name="warning" />{{ t('common.diffAddr') }}
      </div> -->
      <div class="balance pl-14 pr-14">   {{ t("sendto.balance") }}:{{ decimal(accountInfo.amount) }}
                {{ currentNetwork.currencySymbol }}
              </div>
      <!-- recipient -->
      <div class="to from" v-if="txJSON.type != '0x2'">
        <!-- <div class="sendto text-center">{{ t("sendto.to") }} :</div> -->
        <div class="information van-hairline--surround">
          <div class="flex">
            <div class="avatar">
              <AccountIcon :data="toAccount.data.icon" />
            </div>
            <div class="flex column userinformation">
              <div class="username">to</div>
              <div class="userbalance">
                {{ t("sendto.address") }}:{{ addressMask(toAddress) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="contract-info pb-20 pt-10 pl-20 pr-20" v-if="txJSON.type == '0x2'">
        <div class="type pt-10 pb-10">{{ t('common.deployContract') }}</div>
        <div class="origin pt-10 pb-10">
          <div class="pl-10 pr-10 source flex center-v">
            {{ t('common.source') }}<span class="flex center-v van-ellipsis"
              ><img :src="senderData.tab.favIconUrl" alt="" />{{
                senderData.origin
              }}</span
            >
          </div>
        </div>
      </div>

      <div class="json-box">
      <div class="tx-json">{{ txJSON }}</div>
    </div>
    </div>



    <!-- Click to go to the next step-->
    <div class="btn-boxs">
      <div class="container pl-26 pr-26 flex evenly">
        <van-button @click="calcel" class="mr-10" plain block>{{
          t("common.cancel")
        }}</van-button>
        <van-button
          type="primary"
          @click="gonext"
          :loading="nextLoading"
          block
          >{{ t("sendto.next") }}</van-button
        >
      </div>
    </div>
   </div>
</template>

<script lang="ts">
import {
  reactive,
  ref,
  computed,
  Ref,
  onActivated,
  onMounted,
  onBeforeMount,
  nextTick,
  onUnmounted,
} from "vue";
import { Icon, Toast, Button, Sticky, Field } from "vant";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import NavHeader from "@/popup/components/navHeader/index.vue";
import AccountIcon from "@/popup/components/accountIcon/index.vue";
import TransactionConfirm from "@/popup/views/account/components/transactionConfirm/index.vue";
import { addressMask, getestimateGas, decimal } from "@/popup/utils/filters";
import { ethers, utils } from "ethers";
import { web3 } from "@/popup/utils/web3";
import { getWallet } from "@/popup/store/modules/account";
import { useI18n } from "vue-i18n";
import { getRandomIcon } from "@/popup/utils/index";
import { handleType } from "@/scripts/eventType";
import { sendBackground } from "@/popup/utils/sendBackground";

export default {
  name: "pageSendComfirm",
  components: {
    [Icon.name]: Icon,
    [Toast.name]: Toast,
    [Button.name]: Button,
    [Sticky.name]: Sticky,
    [Field.name]: Field,
    NavHeader,
    AccountIcon,
    TransactionConfirm,
  },
  setup() {
    //   Cancel function
    const router = useRouter();
    const store = useStore();
    const { t } = useI18n();
    const { dispatch } = store;
    const accountInfo = computed(() => store.state.account.accountInfo);
    const formAddr = computed(() => store.state.account.accountInfo.address)
    const currentNetwork = computed(() => store.state.account.currentNetwork);
    const route = useRoute();
    const { query } = route;
    const { tx, sendId, sender }: any = query;
    const newtx = JSON.parse(tx);
    const senderData = JSON.parse(sender);
    console.log("senderData", senderData);
    const txJSON = ref(newtx);
    txJSON.value['from'] = accountInfo.value.address
    // const currentAccountInfo = computed(() => store.state.account.accountList.find(item => item.address.toUpperCase() ==from.toString().toUpperCase()))
    // console.warn("tx----------------", txJSON.value);
    // const diffAddr = ref(from.toString().toUpperCase() == accountInfo.value.address.toUpperCase() ? true : false)
    // console.warn('diffAddr', diffAddr.value)
    const clickRight = () => {
      router.replace({ name: "wallet" });
    };
    const clickLeft = () => {
      router.replace({ name: "wallet" });
    };
    const toAccount: any = reactive({
      data: {
        icon: getRandomIcon(),
      },
    });
    const toAddress: Ref<string> = ref(newtx?.to?.toString());
    // Initiate transaction
    const gonext = async () => {
      nextLoading.value = true;
      let receipt = null;
      try {
        receipt = await dispatch("account/transaction", {
          ...newtx,
          checkTxQueue: false,
        });
        console.warn("receipt", receipt);
        sendBackground({
          method: handleType.eth_sendTransaction,
          response: { code: "200", data: receipt, sendId },
        });
      } catch (err: any) {
        Toast(err.reason);
      } finally {
        nextLoading.value = false;
      }
    };
    const nextLoading: Ref<boolean> = ref(false);
    const calcel = () => {
      sendBackground({
        method: handleType.handleReject,
        response: { method: handleType.eth_sendTransaction, sendId },
      });
    };

    const handleKeydown = (e: any) => {
      if(e.keyCode === 13) {
        gonext()
      }
    }
    onMounted(() => {
      window.addEventListener('keydown', handleKeydown)
    })
    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeydown)
    })
    return {
      t,
      calcel,
      clickRight,
      clickLeft,
      txJSON,
      senderData,
      gonext,
      accountInfo,
      formAddr,
      toAddress,
      nextLoading,
      toAccount,
      addressMask,
      decimal,
      currentNetwork,
    };
  },
};
</script>

<style lang="scss" scoped>
.send-page {
  padding-top: 20px;
}
.json-box {
  max-height: 270px;
  overflow-y: scroll;
  margin:0 20px 0;
}
.balance {
  background: #f3f4f5;
  line-height: 24px;
}
.tx-json{
  background: #f3f4f5;
  min-height: 260px;
  font-size: 14px;
}
.contract-info {
  .origin {
    background: #f3f4f5;
    .source {
      img {
        width: 13px;
        margin-right: 5px;
      }
      span {
        width: 87%;
      }
    }
  }
  .type {
    width: auto;
    display: inline-block;
    border: 1px solid #ccc;
    text-align: center;
    padding: 10px;
    margin-bottom: 5px;
  }
}
.tx-json {
  padding: 10px;
  border-radius: 4px;
  word-break: break-all;
}
.cancel {
  font-size: 11px;
  color: #9F54BA;
}
.btn-group {
  padding: 0 15px;
}
.userinfo {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  border-bottom: 1px solid rgba(216, 216, 216, 1);
}

.from {
  display: flex;
  justify-content: space-around;
  height: 50px;

  .userfrom {
    font-size: 12px;
    margin-top: 18px;
    width: 76px;
    text-align: center;
  }
  .information {
    border-collapse: collapse;
    width: 100%;
    height: 46px;
    position: relative;
    .closeIcon {
      position: absolute;
      right: 10px;
      top: 14px;
      font-size: 18px;
      color: #6a737d;
    }
    &::after {
      border-radius: 5px;
    }
    .avatar {
      margin-top: 5px;
      margin-left: 11px;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      overflow: hidden;
    }
    .userinformation {
      margin-left: 10px;
      margin-top: 9px;
      max-width: 80%;
      .username {
        font-size: 12px; 

      }
      .userbalance {
        font-size: 12px;
        margin-top: 5px;
        color: rgba(132, 140, 150, 1);
      }
    }
  }
}
.diffAddr {
  color: #D73A49;
  line-height: 16px;
  margin-bottom: 10px;
  i {
    font-size: 18px;
    margin-right: 5px;
  }
}
.to {
  display: flex;
  justify-content: space-between;
  height: 50px;
  padding-right: 0;
  .sendto {
    font-size: 12px;
    margin-top: 18px;
    width: 76px;
    text-align: center;
  }
  .add-ipt {
    width: 100%;
    margin-right: 13px;
    height: 45px;
    &::after {
      border-radius: 10px;
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
  .recent-user-information {
    height: 59px;
    border-bottom: 1px solid rgba(216, 216, 216, 1);

    .recent-avatar {
      margin: 15px 11px 330px 15px;
      width: 30px;
      height: 30px;
      background-color: pink;
      border-radius: 50%;
    }
    .recent-name {
      margin-top: 15px;
      font-size: 12px;
      letter-spacing: 1.5px;
    }
    .recent-address {
      margin-top: 5px;
      font-size: 12px;
    }
  }
}
.myself {
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
  .myself-information {
    height: 59px;
    border-bottom: 1px solid rgba(216, 216, 216, 1);

    .myself-avatar {
      margin: 15px 11px 330px 15px;
      width: 30px;
      height: 30px;
      background-color: pink;
      border-radius: 50%;
    }
    .myself-name {
      margin-top: 15px;
      font-size: 12px;
      letter-spacing: 1.5px;
    }
    .myself-address {
      margin-top: 5px;
      font-size: 12px;
    }
  }
}
.next {
  position: absolute;
  left: 25px;
  top: 600px;
  width: 325px;
  height: 45px;
}
</style>
