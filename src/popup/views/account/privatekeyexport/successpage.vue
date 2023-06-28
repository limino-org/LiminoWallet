<template>
  <van-nav-bar title="Settings" left-arrow @click-left="onClickLeft" />
  <div class="content">
    <div class="title">{{t('exportprivatekey.hint')}}</div>
    <div class="userwarning">
      <div class="warning-icon">
        <van-icon name="warning" style="color: #e78a93" />
      </div>
      <div class="user-title">
           {{t('exportprivatekey.warn')}}

      </div>
    </div>
    <van-tabs title-active-color="#9F54BA" title-inactive-color v-model:active="activeName">
      <van-tab :title="$t('exportprivatekey.text')" name="a">
        <div class="privatekey-content">
          <div class="title">{{t('exportprivatekey.privatekey')}}</div>
          <div class="display-box">
            <div class="display-content">{{privateKey}}</div>
            <div class="copy-function" @click="tocopy">
              <van-icon name="add-square" />{{t('exportprivatekey.copy')}}
            </div>
          </div>
          <van-button type="default" @click="togome" block>{{t('exportprivatekey.cancel')}}</van-button>
        </div>
      </van-tab>
      <van-tab :title="$t('exportprivatekey.qrcode')" name="b">
        <div class="qccode-content">
          <div class="qccode-display">
            <qrcode-vue :style="{width:'225px',height:'225px'}" v-if="privateKey" :value="privateKey" level="H" />
          </div>
        </div>
        <van-button type="default" @click="togome" block> {{t('exportprivatekey.cancel')}}</van-button>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script lang="ts">
import { ref, Ref, computed, toRaw, SetupContext, onMounted } from 'vue'
import { Icon, NavBar, Form, Field, CellGroup, Button, Tab, Tabs, Toast } from 'vant'
import { useRouter, useRoute } from 'vue-router'
import useClipboard from 'vue-clipboard3'
import QrcodeVue from 'qrcode.vue'
import { getWallet } from '@/popup/store/modules/account'
import { useI18n } from 'vue-i18n'
export default {
  components: {
    [Icon.name]: Icon,
    [NavBar.name]: NavBar,
    [Form.name]: Form,
    [Field.name]: Field,
    [Button.name]: Button,
    [CellGroup.name]: CellGroup,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    QrcodeVue
  },
  setup() {
    const{t}=useI18n()
    const onClickLeft = () => {
      const { backUrl }: any = route.query
      router.replace({
        name: backUrl || 'wallet'
      })
    }
    const activeName = ref('a')
    const router = useRouter()
    const route = useRoute()
    const privateKey: Ref<string> = ref('')
    const initWallet = async () => {
      const wallet = await getWallet()
      privateKey.value = wallet.privateKey
    }
    initWallet()

    const togome = () => {
      const { backUrl }: any = route.query
      router.replace({
        name: backUrl || 'wallet'
      })
    }
    const { toClipboard } = useClipboard()
    const tocopy = async () => {
      try {
        await toClipboard(privateKey.value)
        Toast.success(t('copy.titlekyc'))
      } catch (e) {
        console.error(e)
      }
    }
    const value = ref(`${privateKey.value}`)

    return {
      t,
      tocopy,
      activeName,
      togome,
      onClickLeft,
      privateKey,
      value
    }
  }
}
</script>


<style lang="scss" scoped>
.content {
  .title {
    margin: 17px 22px;
    font-size: 12px;
  }
  .userwarning {
    height: 70px;
    background-color: #fbf2f3;
    // padding: 0 22px;
    line-height: 12px;
    font-size: 12px;
    display: flex;
    // justify-content: space-evenly;
    align-items: center;

    .warning-icon {
      margin-left: 22px;
    }
    .user-title {
      margin-left: 9px;
    }
  }
  .display-box {
    margin: 40px auto;
    width: 330px;
    height: 130px;
    border: 1PX solid rgba(104, 113, 123, 1);
    border-radius: 5px;

    .display-content {
      margin: 10px 25px 0;
      font-size: 18px;
      height: 90px;
      word-wrap: break-word;
      text-align: center;
    }
    .copy-function {
      height: 30px;
      border-top: 1px solid rgba(104, 113, 123, 1);
      text-align: center;
      font-size: 12px;
      color: #9F54BA;
      line-height: 28px;
    }
  }
  :deep(){
    .van-tabs__line {
    width: 50%;
    height: 0.05333rem;
    background: #9F54BA;
  } 
  .van-tab {
    position: inherit;
    color: rgba(182, 182, 182, 1);
  }
  .van-tab {
    border-bottom: 0.5px solid rgba(151, 151, 151, 1);
    font-size: 11px;
  }
  }
}
.qccode-content {
  width: 100%;

  .qccode-display {
    margin: 20px auto;
    width: 225px;
    height: 225px;
  }
}
</style>