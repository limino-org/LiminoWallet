<template>
  <div>
    <div class="title">
      <img class="iconele flex center" src="@/assets/logo1.png" alt />
      <div class="tit-big text-center f-24">Welcome Back</div>
      <div class="tit-small text-center f-12 mt-14 lh-16">ERB / ETH / BTC / COSMOS...</div>
    </div>
    <div class="create-new-password">
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <div class="text-bold f-12 mt-10 mb-5 ml- lh-16 flex between">
            <span>Password</span>
            <span>
              <i @click="toggleMask" :class="`iconfont hover ${switchPassType ? 'icon-yanjing1' : 'icon-yanjing'}`"></i>
            </span>
          </div>
          <van-field
            v-model="password"
            name="password"
            :type="`${switchPassType ? 'text' : 'password'}`"
            placeholder="Enter your password…"
            :rules="[{ required: true, message: 'Wrong password' }]"
          />
          <div class="flex between mt-26">
            <div class="text-bold f-12 lh-30 ml-10">Remember Me</div>
            <van-switch size="24px" class="mr-10" active-color="#66ff99" v-model="checked" />
          </div>
        </van-cell-group>
        <div style="margin: 80px 16px 28px">
          <van-button :loading="loading" round block type="primary" native-type="submit">Login In</van-button>
        </div>
      </van-form>
      <div class="text-center f-12">
        <div class="lh-20">Can't login? You can setup a new one</div>
        <div class="lh-20 tool">Resent Wallet</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Icon, Toast, Button, Sticky, Field, Form, CellGroup, Switch, Checkbox, CheckboxGroup } from 'vant'
import { ref, Ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'loginAccount-step2',
  components: {
    [Button.name]: Button,
    [Sticky.name]: Sticky,
    [Form.name]: Form,
    [Field.name]: Field,
    [CellGroup.name]: CellGroup,
    [Switch.name]: Switch,
    [Checkbox.name]: Checkbox,
    [CheckboxGroup.name]: CheckboxGroup
  },
  setup() {
    const password: Ref<string> = ref('')
    const password2: Ref<string> = ref('')
    const switchPassType = ref(false)
    const onSubmit = (value: object) => {
      console.log('submit', value)
    }
    const toggleMask = () => {
      switchPassType.value ? (switchPassType.value = false) : (switchPassType.value = true)
    }
    const checked = ref(false)
    return {
      password2,
      password,
      onSubmit,
      switchPassType,
      checked,
      toggleMask
    }
  }
}
</script>
<style lang="scss" scoped>
.title {
  .iconele {
    width: 60px;
    height: 60px;
    margin: 50px auto 10px;
  }
  .tit-big {
    line-height: 21px;
  }
  .tit-small {
    color: #848484;
  }
}
.create-new-password {
  .tit-small {
    color: #848484;
  }
  .icon-yanjing {
    color: #037dd6;
  }
  :deep(.van-field__label) {
    display: none;
  }
  :deep(.van-field__error-message) {
    margin-bottom: 12px;
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
}
.tool {
  color: #037cd6;
}
.underline {
  text-decoration: underline;
}
</style>