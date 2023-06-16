<template>
  <div class="page-sign1">
    <van-sticky>
      <NavHeader :hasRight="false" :hasLeft="false" title="LiminoWallt">
      </NavHeader>
    </van-sticky>
    <div class="page-container">
      <div class="sign-bg flex center">
        <div>
          <div class="text-center sign-bg-icon">
            <van-icon name="records" />
          </div>
          <div class="text-center sign-bg-tit">{{t('sign.signatureIdentification')}}</div>
          <div class="text-center sign-bg-tit1">
           {{t('sign.confirmsignaturedata')}}
          </div>
        </div>
      </div>
      <div class="sign-info">
        <div class="title"> {{t('sign.walletaddress')}}</div>
        <div class="value">{{ accountInfo.address }}</div>
        <div class="title">{{t('sign.signaturedata')}}</div>
        <div class="flex center" v-if="loading">
          <van-loading color="#9F54BA" />
        </div>
        <div v-else :class="`value ${signSelect ? 'focus' : ''}`">
          <div class="mb-14" v-for="(item,idx) in list" :key="idx">{{item}}</div>
        </div>
      </div>

      <div class="flex between btn-box ml-24 mr-24">
        <van-button type="default" @click="cancel" plain>{{t('sign.cancel')}}</van-button>
        <van-button type="primary" @click="goOn">{{t('sign.confirm')}}</van-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
// Multiple signature data
import { Loading, Sticky, Icon, Field, Button, Toast } from "vant";
import NavHeader from "@/popup/components/navHeader/index.vue";
import { useRoute, useRouter } from "vue-router";
import { useSign } from "./hooks/sign";
import { computed, onMounted, ref, Ref } from "vue";
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex';
import { handleType } from '@/scripts/eventType';
import { sendBackground } from '@/popup/utils/sendBackground';

export default {
  name: "sign",
  components: {
    [Loading.name]: Loading,
    [Icon.name]: Icon,
    [Sticky.name]: Sticky,
    [Field.name]: Field,
    [Button.name]: Button,
    NavHeader,
  },
  setup() {
    const{t}=useI18n()
    const store = useStore()
    const accountInfo = computed(() => store.state.account.accountInfo)
    const router = useRouter();
    const route = useRoute()
    const { query } = route
    const { sig } = query
    const back = () => {
      router.replace({name:'wallet'})
    };
    const loading = ref(false)
    const { toSign, password, sign, address }: any = useSign();
    const signSelect: Ref<boolean> = ref(false);
    // Signature data
    const list = ref([])
    const needSigList: any = JSON.parse(sig.toString()) || []
    const goOn = () => {
      if (!list.value.length || (list.value.length != needSigList.length)) {
        Toast(t('sign.ready'));
        return;
      }
      // @ts-ignore
      
    //  const bg = chrome.runtime.getBackgroundPage();
    //   console.log("bg.params", bg.params)
    //   bg.params['multiple_sign'].sendResponse({response: list.value})
      sendBackground({method:handleType.multiple_sign,response:{code:'200',data: list.value}})
    }

    const cancel = () => {
      // @ts-ignore
      // const bg = chrome.runtime.getBackgroundPage();
      // bg.handleReject(handleType.multiple_sign)
      // bg.closePopup(handleType.multiple_sign)
      sendBackground({method:handleType.multiple_sign,response:{code:'4001',data: null}})

    }
    onMounted(async() => {
      loading.value = true
      if(needSigList && needSigList.length) {
        try {
          for await (const iterator of needSigList) {
          const sigData = await toSign({sig:JSON.stringify(iterator)})
          list.value.push(sigData)
        }
        }catch(err){
          console.error(err)
        }finally{
          loading.value = false
        }
      }
     
    });
    return {
      t,
      back,
      cancel,
      loading,
      toSign,
      password,
      sign,
      address,
      list,
      signSelect,
      router,
      accountInfo,
      goOn
    };
  },
};
</script>
<style lang="scss" scoped>
.page-sign1 {
  .back {
    font-size: 18px;
  }
  .btn-box {
    margin-top: 50px;
    .van-button {
      width: 160px;
    }
  }
  .sign-bg {
    background: #F8F3F9;
    height: 135px;
    &-icon {
      font-size: 40px;
      color: #9F54BA;
    }
    &-tit {
      line-height: 20px;
      font-size: 15px;
      font-weight: bold;
      margin-top: 5px;
    }
    &-tit1 {
      font-size: 12px;
      line-height: 16px;
      margin-top: 7.5px;
    }
  }
  .sign-info {
    margin: 25px 27px;
    padding: 15px;
    max-height: 327px;
    border-radius: 4px;
    overflow-y: scroll;
    border: 1PX solid #e4e7e8;
    div {
      word-break: break-all;
      font-size: 14px;
    }
    .title {
      line-height: 30px;
    }
    .value {
      line-height: 14px;
      // &.select {
      //   background: #9F54BA;
      //   color:#fff;
      // }
      &:nth-of-type(1) {
        margin-bottom: 20px;
      }
    }
    .value.focus {
      background: #3897f7;
      color: #fff;
      outline: none;
      display: inline;
      animation: select 200ms step-end forwards;
    }
  }

  @keyframes select {
    to {
      -webkit-user-select: text;
      user-select: text;
    }
  }
}
</style>
