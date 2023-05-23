<template>
  <div class="nfts-modal">
    <van-dialog
      v-model:show="showModal"
      teleport="#page-box"
      :showConfirmButton="false"
      :showCancelButton="false"
      closeOnClickOverlay
      :title="''"
    >
      <div class="title text-center text-bold van-hairline--bottom">{{ data.name }}</div>
      <div class="flex list">
        <div class="card" v-for="item in data.snfts" :key="item.nft_addr">
          <van-image :src="`${metaDomain}${item.source_url}`" width="100%" fit="cover" />
        </div>
      </div>
      <!-- <div class="flex center tip">
        You can also
        <span>Buy SNF</span> at the exchange
      </div>-->
      <i18n-t keypath="sendSNFT.buysnft" class="flex center tip" tag="p">
        <template v-slot:snf>
          <span>
            {{
            t("sendSNFT.snf")
            }}
          </span>
        </template>
      </i18n-t>
      <div class="flex between btn-groups">
        <van-button block @click="showModal = false">{{$t('sendSNFT.cancel')}}</van-button>
        <van-button type="primary" block @click="handleDetail">{{$t('sendSNFT.moreInfo')}}</van-button>
      </div>
    </van-dialog>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, Ref, watch, SetupContext, reactive, computed } from 'vue'
import { Dialog, Toast, Image, Button } from 'vant'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { VUE_APP_METAURL } from '@/popup/enum/env'

export default defineComponent({
  name: 'nfts-modal',
  components: {
    [Dialog.Component.name]: Dialog.Component,
    [Image.name]: Image,
    [Button.name]: Button
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: {}
    }
  },
  setup(props: any, context: SetupContext) {
    const { emit }: any = context
    const showModal: Ref<boolean> = ref(false)
    const router = useRouter()
    const { t } = useI18n()
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
      
    const metaDomain = ref(`${VUE_APP_METAURL}`)
    // Jump to SNFT details
    const handleDetail = () => {
      const { snfts, name, img } = props.data
      const params = {
        FullNFTs: snfts,
        children: snfts,
        name,
        img_url: img,
        address: snfts[0].address.substr(0, 40)
      }
      sessionStorage.setItem('compData', JSON.stringify({ ...params }))
      router.push({ name: 'snftcollection-step1' })
    }

    return {
      t,
      showModal,
      metaDomain,
      handleDetail
    }
  }
})
</script>
<style lang="scss" scoped>
.title {
  color: #000;
  font-size: 15px;
  line-height: 62px;
  background: #F8F3F9;
  font-weight: bold;

}
.savebtn {
  width: 220px;
  background: #f1f3f4;
  border-radius: 30px;
  box-sizing: border-box;
  font-size: 12px;
  i {
    font-size: 12px;
  }
  &:hover {
    background: #F8F3F9;
    color: #666;
  }
}
.list {
  flex-wrap: wrap;
}
.van-image {
  width: 85px;
  height: 87.5px;
  display: block;
}
.card {
  width: 25%;
}
.tip {
  color: #b3b3b3;
  line-height: 18px;
  margin: 20px 0;
  span {
    color: #9F54BA;
  }
}
.btn-groups {
  padding: 0 49px 25px;
  button {
    padding: 0;
    width: 102px;
  }
}
</style>
