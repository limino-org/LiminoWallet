<template>
  <van-sticky>
    <NavHeader :hasRight="false" :hasLeft="false" :title="t('common.connect')"></NavHeader>
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
        <van-button class="mr-20" block @click="cancel" >{{t('restWallet.cancel')}}</van-button>
        <van-button block @click="next" :disabled="selectLen?false:true" :loading="loading" type="primary">{{t('common.connectTxt')}}</van-button>
      </div>
  </div>
</template>
<script lang="ts">
import { Icon, Toast, Button, Sticky, Field,Checkbox, CheckboxGroup  } from "vant";
import NavHeader from "@/popup/components/navHeader/index.vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { computed, onMounted, onUnmounted, ref, toRaw } from "vue";
import { useStore } from 'vuex';
import AccountIcon from '@/popup/components/accountIcon/index.vue'
import { addressMask } from '@/popup/utils/filters';
import { handleType } from '@/scripts/eventType';
import { sendBackground } from '@/popup/utils/sendBackground';

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
    const { t } = useI18n();
    const accountList = computed(() => {
        return store.state.account.accountList
    })
    // @ts-ignore
    // const bg = chrome.runtime.getBackgroundPage();
    // const currentSender = bg.connectList.find(item => item.origin == bg.params[handleType.wallet_requestPermissions].sender.origin)
    // const accounts = currentSender ? currentSender.accountList : []

    // const checkArr = [accountInfo.value.address,...accounts]
    const checkedList = ref([])

    const { sender, method, sendId } = route.query
    console.warn('sender',sender)
    const senderData = ref(JSON.parse(decodeURIComponent(sender.toString())))
    const selectLen = computed(() => {
       return checkedList.value.length
    })

    const handleKeydown = (e: any) => {
      if(e.keyCode === 13) {
        next()
      }
    }
    
    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeydown)
    })

    onMounted(async()=>{
      window.addEventListener('keydown', handleKeydown)
      // @ts-ignore
      const list = await chrome.storage.local.get(['connectList'])
       // @ts-ignore
      const data = await chrome.storage.local.get([method])
      const sendParams = data[method] ? data[method] : {}
      const currentSender = list.connectList.find((item: any) => item.origin == sendParams.sender.origin)
      const accounts = currentSender ? currentSender.accountList : []
      console.warn('sendParams.sender', sendParams.sender)
      const checkArr = [accountInfo.value.address,...accounts]
      checkedList.value = checkArr
    })
    const loading = ref(false)
    const next = () => {
      console.warn('checkedList.value', checkedList.value)
      loading.value = true
      sendBackground({method,response: {code:'200',data:[...checkedList.value],sendId}})
    }
    const cancel = () => {
      sendBackground({method:handleType.handleReject,response:{method,sendId}})
    }
    return {
      loading,
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
