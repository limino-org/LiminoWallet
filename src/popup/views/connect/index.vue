<template>
  <van-sticky>
    <NavHeader :hasRight="false" :hasLeft="false">
        <template v-solt:title>{{t('common.connect')}}</template>
    </NavHeader>
  </van-sticky>
  <div class="page-connect">
     <div>
         <!-- Domain name of the connection site -->
      <div class="flex center mt-20">
          <div class="sender flex center-v pl-20 pr-20 f-14">
              <div class="icon flex center mr-10">
                  <img :src="senderData.tab.favIconUrl" alt="">
              </div>
              <div class="origin van-ellipsis text-bold">{{senderData.origin}}</div>
          </div>
      </div>
      <h2 class="text-center">{{t('common.connect2')}}</h2>
      <div class="account-list ml-30 mr-30 pt-20 pb-20">
          <van-checkbox-group v-model="checkedList" ref="checkboxGroup">
          <div :class="`flex between card mb-14 hover pl-20 pr-20 pt-4 pb-4 ${accountInfo.address == item.address ? 'active' : ''}`" v-for="item in accountList" :key="item.address">
            <van-checkbox :name="item.address" shape="square">
            <div class="f-14 flex center-v"><AccountIcon :data="item.icon" class="mr-10" />{{item.name}}({{addressMask(item.address)}})</div>
            </van-checkbox>
          </div>
          </van-checkbox-group>
      </div>
     </div>
  </div>
  <div class="btn-box pb-20 pt-20 " >
      <div class="container  flex between  pr-30 pl-30">
        <van-button class="mr-20" block @click="cancel">{{t('restWallet.cancel')}}</van-button>
        <van-button block @click="next" :disabled="selectLen?false:true" type="primary">{{t('common.connectTxt')}}</van-button>
      </div>
  </div>
</template>
<script lang="ts">
import { Icon, Toast, Button, Sticky, Field,Checkbox, CheckboxGroup  } from "vant";
import NavHeader from "@/popup/components/navHeader/index.vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { computed, ref } from "vue";
import { useStore } from 'vuex';
import AccountIcon from '@/popup/components/accountIcon/index.vue'
import { addressMask } from '@/popup/utils/filters';
import { handleType, getSenderAccounts } from '@/scripts/background';

export default {
  name: "pageConnect",
  components: {
    [Icon.name]: Icon,
    [Button.name]: Button,
    [Sticky.name]: Sticky,
    [CheckboxGroup.name]:CheckboxGroup,
    [Checkbox.name]:Checkbox,
    NavHeader,
    AccountIcon
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore()
    const accountInfo = computed(() => store.state.account.accountInfo)
    
    const accountList = computed(() => {
        return store.state.account.accountList
    })
    // @ts-ignore
    const bg = chrome.extension.getBackgroundPage();
    const currentSender = bg.connectList.find(item => item.origin == bg.params[handleType.wallet_requestPermissions].sender.origin)
    const accounts = currentSender ? currentSender.accountList : []
    const { t } = useI18n();
    const checkArr = [accountInfo.value.address,...accounts]
    const checkedList = ref(checkArr)
    const { sender } = route.query
    console.warn('sender',sender)
    const senderData = ref(JSON.parse(decodeURIComponent(sender.toString())))
    const selectLen = computed(() => {
       return checkedList.value.length
    })
    const next = () => {
      //   @ts-ignore
      bg.params[handleType.wallet_requestPermissions].sendResponse({response: [...checkedList.value]})
    }
    const cancel = () => {
        // @ts-ignore
      const bg = chrome.extension.getBackgroundPage();
      bg.handleReject(handleType.wallet_requestPermissions)
    }
    return {
      route,
      t,
      next,
      cancel,
      accountList,
      checkedList,
      addressMask,
      senderData,
      selectLen,
      accountInfo
    };
  },
};
</script>
<style lang="scss">
.page-connect {
    .account-list {
        height: 400px;
        overflow-y: scroll;
        border: 1PX solid #ccc;
        .card.active {
          background: #eff4f8;
        }
    }

}
    .btn-box {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 20px;
    }
    .sender {
        border: 1PX solid #ccc;
        height: 40px;
        width: 70%;
        border-radius: 20px;
        .icon {
            img {
                width: 20px;
                display: block;
            }
        }
        .origin {
          width: 80%;
        }
    }
    .success,.timeDown {
        color: #85E19B;
        font-size: 60px;
    }
</style>
