<template>
  <van-sticky>
    <NavHeader :hasRight="false" :title="t('setting.accountManagement')">
    </NavHeader>
  </van-sticky>
  <div class="account-container">
    <div class="account-list" id="account-list">
      <!-- Non imported accounts -->
      <div class="f-12 lh-16 accountList-tit" v-show="defaultlist.length">{{ t("network.createAccounts") }}</div>

      <div
        v-for="(item, index) in defaultlist"
        :key="item.value"
        :class="` clickActive ${
            index < defaultlist.length - 1 ? 'border-bottom' : ''
          }`"
        @click="handleAccountFun(item, index)"
      >
      <div class="flex account-card" :title="item.address">
            <div class="flex center select-box">
              <i :class="`iconfont ${item.address.toUpperCase() == accountInfo.address.toUpperCase()
 ? 'icon-danxuan' : 'icon-danxuan1'} `"></i>
            </div>
            <div class="account-icon flex center">
              <div class="account-icon-box">
                <AccountIcon :data="item.icon" />
              </div>
            </div>
            <div class="account-info flex center-v">
              <div class="account-info-box">
                <div class="account-name flex center-v">
                  {{ item.name }}
                  <div class="pl-4 pr-4" @click.stop="openModifModal(item)">
                    <i class="iconfont icon-bianji"></i>
                  </div>
                </div>
                <div class="account-value" v-show="amountType != 'mask'">
                  {{ decimal(item.amount) }} {{ currentNetwork.currencySymbol }}
                </div>
                <div class="account-value" v-show="amountType == 'mask'">
                  ********
                </div>
              </div>
            </div>

            <!-- <div class="flex right center-v add-choose-icon">
              <van-loading
                v-show="
                  accountLoading &&
                  clickAccountIdx != null &&
                  clickAccountIdx == index
                "
                color="#9F54BA"
              />
            </div> -->
          </div>
      
      </div>
      <!-- Imported account -->
      <div v-if="importList.length" class="f-12 lh-16 accountList-tit">{{ t("network.importAccounts") }}</div>
  
      <div
        v-for="(item, index) in importList"
        :key="item.value"
        :class="` clickActive ${
            index < importList.length - 1 ? 'border-bottom' : ''
          }`"
        @click="handleAccountFun(item, index)"
      >
      <div class="flex account-card" :title="item.address">
            <div class="flex center select-box">
              <i :class="`iconfont ${item.address.toUpperCase() == accountInfo.address.toUpperCase()
 ? 'icon-danxuan' : 'icon-danxuan1'} `"></i>
            </div>
            <div class="account-icon flex center">
              <div class="account-icon-box">
                <AccountIcon :data="item.icon" />
              </div>
            </div>
            <div class="account-info flex center-v">
              <div class="account-info-box">
                <div class="account-name flex center-v">
                  {{ item.name }}
                  <div class="pl-4 pr-4" @click.stop="openModifModal(item)">
                    <i class="iconfont icon-bianji"></i>
                  </div>
                </div>
                <div class="account-value" v-show="amountType != 'mask'">
                  {{ decimal(item.amount) }} {{ currentNetwork.currencySymbol }}
                </div>
                <div class="account-value" v-show="amountType == 'mask'">
                  ********
                </div>
              </div>
            </div>

            <!-- <div class="flex right center-v add-choose-icon">
              <van-loading
                v-show="
                  accountLoading &&
                  clickAccountIdx != null &&
                  clickAccountIdx == index
                "
                color="#9F54BA"
              />
            </div> -->
          </div>
      
      </div>
    </div>
    <!-- Button group -->
    <div class="flex between btn-group border-top pt-20">
      <div class="flex between btn-group-box">
        <div class="btn-box" @click="handleCreateAccount">
          <div class="btn flex center">
            <i class="iconfont icon-chuangjianren"></i>
          </div>
          <div class="text-center text text-bold lh-16">{{ t("network.create") }}</div>
        </div>
        <div class="btn-box" @click="toImport">
          <div class="btn flex center">
            <i class="iconfont icon-xiazai"></i>
          </div>
          <div class="text-center text text-bold lh-16">{{ t("network.import") }}</div>
        </div>
      </div>
    </div>
  </div>
  <!-- Modify account name Popup -->
  <ModifNameModal v-model="showModifName" :data="modifData" />
</template>
<script lang="ts">
import { defineComponent, Ref, ref, watch, SetupContext, computed, reactive, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToggleAccount } from '@/popup/components/accountModal/hooks/toggleAccount'
import { Icon, Dialog, Button, Loading, Toast, Sticky } from 'vant'
import AccountIcon from '@/popup/components/accountIcon/index.vue'
import { decimal } from '@/popup/utils/filters'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import ModifNameModal from '@/popup/components/modifNameModal/index.vue'
import NavHeader from '@/popup/components/navHeader/index.vue'

export default {
  name: 'accountModal',
  components: {
    [Icon.name]: Icon,
    [Dialog.Component.name]: Dialog.Component,
    [Button.name]: Button,
    [Loading.name]: Loading,
    [Sticky.name]: Sticky,
    AccountIcon,
    ModifNameModal,
    NavHeader
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  setup(props: any, context: SetupContext) {
    const { emit }: any = context
    const router = useRouter()
    const route = useRoute()
    const store = useStore()
    const i18n = useI18n()
    const { dispatch } = store
    const { t } = useI18n()
    const accountInfo = computed(() => store.state.account.accountInfo)
    const currentNetwork = computed(() => store.state.account.currentNetwork)
    const showModal: Ref<boolean> = ref(false)
    const amountType = computed(() => store.state.system.amountType)

    const { toggleAccount, handleAccount, createAccount, createLoading, accountLoading, importList, defaultlist } = useToggleAccount()
    const clickAccountIdx = ref(null)
    const clickAccountIdx2 = ref(null)
    const handleAccountFun = (item: any, idx: number) => {
      handleAccount(item, idx, clickAccountIdx)
    }
    const handleAccountFun2 = (item: any, idx: number) => {
      handleAccount(item, idx, clickAccountIdx2)
    }
    watch(
      () => props.modelValue,
      n => {
        showModal.value = n
      },
      {
        immediate: true
      }
    )

    watch(
      () => showModal.value,
      n => {
        if (!n) {
          emit('update:modelValue', false)
        }
      }
    )
    const toImport = () => {
      showModal.value = false
      const name: any = route.name
      router.push({
        name: 'importAccount-step1',
        // name: 'import',
        query: {
          backUrl: name
        }
      })
    }
    const del = (idx: number) => {
      dispatch('account/deleteAccount', idx)
    }
    // Modify name Popup
    const showModifName = ref(false)
    const modifData = ref({})
    const openModifModal = (item: any) => {
      router.push({
        name: 'account-name',
        query: {
          ...item
        }
      })
    }

    const handleCreateAccount = async () => {
      Toast.loading({
        message: i18n.t('userexchange.loading'),
        forbidClick: true,
        loadingType: 'spinner'
      })
      console.log('loading')

        let time = setTimeout(async () => {
          try {
        await createAccount()
        await dispatch('common/scrollBottom', { id: 'account-list' })
      } catch(err){
        Toast(err.toString())
      }
        let time2 = setTimeout(() => {
          Toast.clear()
          clearTimeout(time2)
        }, 300)
        clearTimeout(time)
      })
      
    }
    return {
      t,
      toggleAccount,
      handleAccount,
      createAccount,
      createLoading,
      accountLoading,
      clickAccountIdx,
      clickAccountIdx2,
      handleAccountFun,
      handleAccountFun2,
      currentNetwork,
      toImport,
      showModal,
      decimal,
      accountInfo,
      openModifModal,
      showModifName,
      modifData,
      del,
      handleCreateAccount,
      defaultlist,
      importList,
      amountType
    }
  }
}
</script>
<style lang="scss" scoped>
.btn-group {
  padding: 20px 50px;
}
.btn-group-box {
  width: 180px;
  margin: 0 auto;
}
.accountList-tit {
  color: #8f8f8f;
  padding: 0 20px;
  margin-top: 24px;
}
:deep(.van-loading) {
  width: 22px;
  height: 22px;
}
.btn-box {
  .btn {
    width: 34px;
    height: 34px;
    box-sizing: border-box;
    border-radius: 17px;
    border: 1PX solid #9F54BA;
    cursor: pointer;
    &:hover {
      background: #9F54BA;
      i {
        color: #fff;
      }
    }
    i {
      font-size: 16px;
      color: #9F54BA;
    }
  }
  .text {
    color: #9F54BA;
    font-size: 12px;
  }
}
.account-card {
  height: 72px;
  padding: 0 15px;
  transition: ease 0.3s;
  .select-box {
    margin-right: 12px;
    i {
      font-size: 18px;
      color: #9F54BA;
    }
  }
  &:hover {
    background: #F8F3F9;
    color:#9F54BA;
    .account-value,.account-name i {
      color:#9F54BA;

    }

  }
  .account-icon {
    padding: 0 6px 0 0;
    &-box {
      border-radius: 3px;
      overflow: hidden;
    }
  }
  .account-name {
    line-height: 18px;
    font-size: 12px;
    i {
      font-size: 14px;
      color: #a9a6a6;
    }
  }
  .account-value {
    color: #a9a6a6;
    line-height: 18px;
  }
  .account-info-box {
    width: 240px;
  }
  .add-choose-icon {
    width: 100%;
    i {
      color: rgb(13, 215, 13);
      font-size: 14px;
    }
  }
}
// .title {
//   color: #b3b3b3;
//   line-height: 62px;
//   background: #F8F3F9;
// }
.account-list {
  // max-height: 400px;
  overflow-y: scroll;
}
.icon-weibiaoti-1_xinzengzhanghu {
  font-weight: bold;
  font-size: 20px !important;
}
</style>