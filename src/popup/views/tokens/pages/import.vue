<template>
  <div class="list">
    <!-- custom  -->
    <div class="custom pl-14 pr-14">
      <div class="title flex between pl-14 pr-14 pt-12 pb-12 mb-30">
        <div class="left flex center">
          <van-icon name="warning" />
        </div>
        <i18n-t keypath="addtokens.title" tag="div" class="right text-left f-12 lh-16">
          <template v-slot:wormholesLink>
            <a href="https://192.168.1.237:9012" class="ml-4 mr-4 wormholeslink" target="_blank" rel="noopener noreferrer"> WornHoles </a>
          </template>
        </i18n-t>
        <!-- <div class="right text-left f-12 lh-16">{{ t("addtokens.title") }}</div> -->
      </div>
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <!-- 代币合约添加 -->
          <div class="title-label pl-10">
            <span>*</span>
            {{ t("addtokens.contractAdd") }}
          </div>
          <van-field
            submit-on-enter
            v-model="tokenContractAddress"
            name="contract"
            :placeholder="$t('addtokens.contractAddeg')"
            :rules="[{ required: true, message: t('addtokens.message') }]"
          />
        </van-cell-group>
        <div class="btn-group">
          <div class="container flex between  pl-28 pr-28">
            <van-button block class="mr-10" @click="back">{{t('sign.cancel')}}</van-button>
            <van-button round block type="primary" native-type="submit">
            {{
            t("addtokens.import")
            }}
          </van-button>
          </div>
        </div>
      </van-form>
    </div>
  </div>
</template>
<script lang="ts">
import { ref, Ref, computed, toRaw, SetupContext, onMounted, reactive } from 'vue'
import { Icon, NavBar, Form, Field, CellGroup, Button, Tab, Tabs, Dialog, IndexBar, IndexAnchor, Toast } from 'vant'
import TokenCard from '@/popup/views/account/components/tokenCard/index.vue'

import useClipboard from 'vue-clipboard3'
import { getWallet } from '@/popup/store/modules/account'
import NavHeader from '@/popup/components/navHeader/index.vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { getRandomIcon } from '@/popup/utils'
import { useToast } from '@/popup/plugins/toast'
export default {
  name: 'import-token',
  components: {
    [Icon.name]: Icon,
    [Form.name]: Form,
    [Field.name]: Field,
    [Button.name]: Button,
    [CellGroup.name]: CellGroup,
    [IndexBar.name]: IndexBar,
    [IndexAnchor.name]: IndexAnchor,
    TokenCard
  },
  setup() {
    const { t } = useI18n()
    const store = useStore()
    
    const {$toast} = useToast()
    
    const search = ref('')
    
    
    // Selected tab'
    const router = useRouter()
    const { dispatch } = useStore()
    const precision: Ref<string> = ref('')
    const name: Ref<string> = ref('')
    const symbol: Ref<string> = ref('')
    const tokenContractAddress: Ref<string> = ref('')
    const back = () => {
      router.go(-1)
    }
    // Click add connectconstraint
    const onSubmit = (data: any) => {
      console.log('submit', data)
      Dialog.confirm({
        message: t('currencyList.sure')
      }).then(async () => {
        const { address } = await getWallet()
        try {
          Toast.loading({
            message: t('userexchange.loading'),
            forbidClick: true,
            loadingType: 'spinner'
          })
          await dispatch('account/addToken', {
            tokenContractAddress: tokenContractAddress.value,
            address
          })
          Toast.clear()
          $toast.success(t('currencyList.Importsuccessful'))
          router.replace({ name: 'wallet' })
        } catch (err) {
          Toast(err.toString())
        }
      })
    }

    // Import function
    const handleImport = () => {
      console.log('import...')
    }
    return {
      t,
      back,
      precision,
      name,
      symbol,
      tokenContractAddress,
      onSubmit,
      search,
      handleImport
    }
  }
}
</script>
<style lang="scss" scoped>
.wormholeslink {
  color: #037CD6;
}
.list {
  height: calc(100vh - 48px - 16px);
  overflow-y: scroll;
}
:deep(.van-index-anchor) {
  background: #f1f3f4;
  color: #aeaeae;
  line-height: 30px;
}
:deep(.van-index-bar__sidebar) {
  color: #909090;
  right: 8px;
}
:deep(.van-index-bar__index) {
  width: 18px;
  height: 18px;
  text-align: center;
  line-height: 18px;
  margin-bottom: 4px;
  padding: 0;
}
:deep(.van-index-bar__index--active) {
  background: #037cd6;
  color: #fff;
  border-radius: 9px;
}
* {
  box-sizing: border-box;
}
.tabs {
  width: 200px;
  // border-radius: 20px;
  // border: 1PX solid #037cd6;
  &::after {
    border-color: #037cd6;
    border-radius: 26px;
  }
  .tab {
    width: 100px;
    line-height: 26px;
    border-radius: 12px;
    font-size: 12px;
    &.active {
      background: #037cd6;
      // border: 1PX solid #037cd6;
      color: #fff;
    }
  }
}
.title {
  text-align: center;
  background: #f4faff;
  margin-top: 25px;
  border-radius: 7.5px;
  .left {
    width: 20px;
    i {
      font-size: 16px;
      color: #037cd6;
    }
  }
  .right {
    width: calc(100% - 20px);
    padding-left: 3px;
    a {
      text-decoration: underline;
      color: #037cd6;
    }
  }
}
.title-label {
  font-size: 12px;
  line-height: 16px;
  margin-bottom: 10px;
  font-weight: bold;
  position: relative;
  span {
    position: absolute;
    left: 0;
    top: 0;
    color: red;
  }
}
.search-box {
    border: 1PX solid #BBC0C5;
    border-radius: 5px;
}
.ipt-box {
  width: 96%;
  i {
    color: #037cd6;
    font-size: 22px;
  }
  :deep(.van-field__body) {
    margin-bottom: 0;
    line-height: 100%;
    border: none;
    outline: none;
    &:hover {
      border: none;
    }
  }
}
.close {
  width: 30px;
  i {
    font-size: 16px;
    color: #037cd6;
  }
}
.icon-right-box {
  i {
    font-size: 18px;
  }
  .icon-add {
    color: #037cd6;
  }
  .icon-minus {
  }
}
.btn-groups {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 25px;
}
:deep(.van-cell-group--inset) {
  margin: 0;
}
:deep(.van-field__label) {
  display: none;
}
:deep(.van-field__error-message) {
  margin-bottom: 12px;
  line-height: 12px;
}
:deep(.van-cell:after) {
  display: none;
}
:deep(.van-cell) {
  padding: 0;
}
:deep(.van-field__body) {
  height: 42px;
  border: 1PX solid #adb8c5;
  margin-bottom: 10px;
  padding: 0 10px;
  border-radius: 5px;
  transition: ease 0.3s;
  font-size: 12px;
  &:hover {
    border: 1PX solid #1989fa;
  }
}

.btn-group {
  position: fixed;
  left: 0px;
  right: 0px;
  bottom: 25px;
}
</style>