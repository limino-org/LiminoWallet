<template>
  <van-sticky>
    <NavHeader :hasRight="false">
      <template v-slot:left>
        <div class="flex center cancel" @click="clickLeft">
          {{ t("wallet.back") }}
        </div>
      </template>
    </NavHeader>
  </van-sticky>
  <!-- Account selection area -->
  <div class="page-container">
    <div class="userinfo">
      <!-- sender -->
      <div class="from">
        <div class="userfrom">{{ t("sendto.from") }}:</div>
        <!-- Sender information -->
        <div class="information van-hairline--surround">
          <div class="flex">
            <div class="avatar">
              <AccountIcon :data="accountInfo.icon" />
            </div>
            <div class="flex column userinformation">
              <div class="username">{{ accountInfo.name }}</div>
              <div class="userbalance">
                {{ t("sendto.balance") }}:{{ decimal(accountInfo.amount) }}
                {{ currentNetwork.currencySymbol }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- recipient -->
      <div class="to from">
        <div class="sendto text-center">{{ t("sendto.to") }} :</div>
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
    </div>
  </div>

  <div class="p-20">
    <pre>{{txJSON}}</pre>
  </div>

  <!-- Click to go to the next step-->
  <div class="btn-groups">
     <div class="container pl-26 pr-26 flex evenly">
      <van-button  @click="calcel" class="mr-10" plain block>{{
        t("common.cancel")
      }}</van-button>
      <van-button type="primary" @click="gonext" :loading="nextLoading" block>{{
        t("sendto.next")
      }}</van-button>
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
import { getRandomIcon } from '@/popup/utils/index'
import { handleType } from '@/scripts/eventType';
import { sendBackground } from '@/popup/utils/sendBackground';

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
    const currentNetwork = computed(() => store.state.account.currentNetwork);
    const route = useRoute();
    const { query } = route;
    const { tx }: any = query;
    const newtx = JSON.parse(tx)
    const txJSON = ref(newtx)
        console.warn('tx----------------',newtx)

    const clickRight = () => {
      router.replace({ name: "wallet" });
    };
    const clickLeft = () => {
      router.replace({name:"wallet"})
    };
    const toAccount: any = reactive({ data: {
      icon: getRandomIcon()
    } });
    const toAddress: Ref<string> = ref(newtx.to.toString());
    // Initiate transaction
    const gonext = async () => {
      nextLoading.value = true;
      try {
        const { from,to,value,data} = newtx
        const receipt = await dispatch("account/sendTransaction", {from,to: utils.getAddress(to),value,data});
   
          sendBackground({method:handleType.eth_sendTransaction,response:{code:"200",data: receipt}})
      } catch (err: any) {
        Toast(err.reason);
      } finally {
        nextLoading.value = false;
      }
    };
    const nextLoading: Ref<boolean> = ref(false);
    const calcel = () => {
      sendBackground({method:handleType.handleReject,response:{method:handleType.eth_sendTransaction}})
    }
    return {
      t,
      calcel,
      clickRight,
      clickLeft,
      txJSON,
      gonext,
      accountInfo,
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
  pre {
    background: #d4e5f3;
  }
.cancel {
  font-size: 11px;
  color: #037cd6;
}
.btn-group {
  padding: 0 15px;
}
.userinfo {
  width: 100%;
  height: 127px;
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
    margin-right: 13px;
    position: relative;
    .closeIcon {
      position: absolute;
      right: 10px;
      top: 14px;
      font-size: 18px;
      color: #6a737d;
    }
    &::after {
      border-radius: 20px;
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
      .username {
        font-size: 12px;
      }
      .userbalance {
        font-size: 10px;
        margin-top: 5px;
        color: rgba(132, 140, 150, 1);
      }
    }
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
    border: 1PX solid rgba(209, 212, 215, 1);
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
    border: 1PX solid rgba(216, 216, 216, 1);
    height: 28px;
    line-height: 28px;
    font-size: 10px;
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
      font-size: 10px;
    }
  }
}
.myself {
  .text {
    width: 100%;
    background-color: rgba(241, 243, 244, 1);
    border: 1PX solid rgba(216, 216, 216, 1);
    height: 28px;
    line-height: 28px;
    font-size: 10px;
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
      font-size: 10px;
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
