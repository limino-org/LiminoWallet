<template>
  <van-sticky>
    <NavHeader title="Close" :hasRight="false">
      <template v-slot:title>
        <div class="flex center title">
          {{ t("setting.accountManagement") }}
        </div>
      </template>
    </NavHeader>
  </van-sticky>
  <div class="modif-name-modal pl-14 mt-24 pr-14">
    <van-form @submit="onSubmit">
      <div class="label text-bold">Account Name ({{ name.length }} / 12)</div>
      <van-field
        v-model="name"
        maxlength="12"
        :placeholder="t('account.placeholder')"
        right-icon="cross"
        @click-right-icon="clickRight"
        :rules="[{ required: true, message: t('account.message') }]"
      />
      <div class="flex evenly btn-groups pb-30 mt-20">
        <van-button plain @click="cancel">
          {{ t("network.cancel") }}
        </van-button>
        <van-button type="primary" native-type="submit">
          {{ t("network.confirm") }}
        </van-button>
      </div>
    </van-form>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, Ref, watch, SetupContext, reactive } from "vue";
import { Dialog, Field, Form, Button, Toast, Sticky } from "vant";
import { useI18n } from "vue-i18n";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
import NavHeader from "@/popup/components/navHeader/index.vue";
import { useBroadCast } from '@/popup/utils/broadCost'

export default {
  name: "account-name",
  components: {
    [Dialog.Component.name]: Dialog.Component,
    [Field.name]: Field,
    [Form.name]: Form,
    [Button.name]: Button,
    [Sticky.name]: Sticky,
    NavHeader,
  },
  setup(props: any, context: SetupContext) {
    const router = useRouter();
    const { query } = useRoute();
    const { emit }: any = context;
    const showModal: Ref<boolean> = ref(false);
    const { t } = useI18n();
    const { dispatch } = useStore();
    const name = ref(query.name);
    // Listen to the broadcast of the same source window
    const { handleUpdate } = useBroadCast()

    const onSubmit = async () => {
      await dispatch("account/setAccountName", {
        address: query.address,
        name: name.value,
      });
      handleUpdate()
      Toast(t("account.successful"));
      cancel();
    };

    const cancel = () => {
      router.back();
    };
    const clickRight = () => {
      name.value = "";
    };
    return {
      showModal,
      name,
      cancel,
      onSubmit,
      clickRight,
      t,
    };
  },
};
</script>
<style lang="scss" scoped>
.title {
  // background: #f8fcff;
}
:deep(.van-field__right-icon) {
  color: #1989fa;
}
.label {
  font-size: 12px;
  line-height: 16px;
  margin-bottom: 10px;
}
.btn-groups {
  button {
    width: 100px;
  }
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
  height: 38px;
  border: 1PX solid #adb8c5;
  margin-bottom: 10px;
  padding: 0 10px;
  border-radius: 5px;
  transition: ease 0.3s;
  &:hover {
    border: 1PX solid #1989fa;
  }
}
</style>
