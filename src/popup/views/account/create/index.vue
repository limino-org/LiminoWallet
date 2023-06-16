<template>
  <div class="create-account">
    <div class="container page-container flex center">
      <!--Create a New Account Import account button group -->
      <div class="account-groups">
        <div class="tit-company text-center">Wormholes</div>
        <div class="create-btn acc-btn text-center van-hairline--top-bottom" @click="toCreate">
          {{t('create.createwallet')}}
        </div>
        <div class="import-btn acc-btn text-center van-hairline--bottom"  @click="toImport">
          {{t('create.usemnemonic')}}

        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
export default {
  name:'create',
  setup() {
    const{t}=useI18n()
    const router = useRouter()
    const toImport = () => {
      router.push({
        name:'importByMnemonic',
      })
    }
    const toCreate = () => {
      router.push({
        name: 'newwallet'
      })
    }
    return {
      t,
      toImport,
      toCreate
    }
  },
};
</script>
<style lang="scss" scoped>
.create-account {
  .account-groups {
    width: 100%;
    .tit-company {
      margin-bottom: 30px;
    }
    .acc-btn {
      color: #9F54BA;
      font-size: 12px;
      line-height: 50px;
    }
  }
}
</style>
