<template>
  <van-sticky>
    <NavHeader :title="t('receive.contants')" :hasRight="true">
    </NavHeader>
  </van-sticky>
  <div class="contacts-add">
    <div class="mt-16">
      <van-form @submit="onSubmit">
        <div class="label text-bold">{{ t("contacts.name") }}</div>
        <van-field
          v-model="params.name"
          :class="iptErr1 ? 'error' : ''"
          maxlength="12"
          :placeholder="$t('contacts.entername')"
          :rules="[
            // {
            //   required: true,
            //   message: t('contacts.namecannotbeempty'),
            // },
            { validator: asynName },
          ]"
        />
        <div class="label text-bold">{{ t("contacts.address") }}</div>
        <van-field
          v-model="params.address"
          :placeholder="$t('contacts.enteraddress')"
          :class="iptErr2 ? 'error' : ''"
          maxlength="50"
          :rules="[
            // { required: true, message: t('contacts.addresscannotbeempty') },
            {
              validator: asyncaddress,
              message: t('contacts.wrongaddressformat'),
            },
          ]"
        />
        <div class="label text-bold">{{ t("contacts.memo") }}</div>
        <van-field
          v-model="params.memo"
          maxlength="30"
          :placeholder="$t('contacts.entermemo')"
        />
        <!-- Add a Contact -->
        <div class="btn-groups" v-if="!query.address">
          <div class="container pl-28 pr-28">
            <van-button block type="primary" native-type="submit">
              {{ t("contacts.confirmAdd") }}
            </van-button>
          </div>
        </div>

        <!-- Edit Contact -->
        <div class="btn-groups" v-else>
          <div class="container pl-28 pr-28 flex between">
            <van-button block class="mr-10" type="danger" plain @click="handleDelete">{{
              t("contacts.delete")
            }}</van-button>
            <van-button block type="primary"  native-type="submit">{{
              t("contacts.submit")
            }}</van-button>
          </div>
        </div>
      </van-form>
    </div>
  </div>
</template>
<script lang="ts">
import Vue, { toRaw } from "vue";
import { Icon, Toast, Button, Sticky, Field, Dialog, Form } from "vant";
import { useRoute, useRouter } from "vue-router";
import NetWorkCard from "@/popup/components/netWorkCard/index.vue";
import { defineComponent, Ref, ref, watch, SetupContext } from "vue";
import { useStore } from "vuex";
import { utils } from "ethers";
import { regEnglish } from "@/popup/enum/regexp";
import router from "@/popup/router";
import { useI18n } from "vue-i18n";
import { getRandomIcon, guid } from "@/popup/utils";
import NavHeader from "@/popup/components/navHeader/index.vue";
import { useBroadCast } from "@/popup/utils/broadCost";
import { useToast } from "@/popup/plugins/toast";

export default {
  name: "contacts-add",
  components: {
    [Field.name]: Field,
    [Button.name]: Button,
    [Form.name]: Form,
    [Icon.name]: Icon,
    [Sticky.name]: Sticky,
    NavHeader,
  },
  setup() {
    const { t } = useI18n();
    const store = useStore();
    const { dispatch } = store;
    const { query } = useRoute();
    const { state, commit } = store;
    const iptErr1 = ref(false)
    const iptErr2 = ref(false)
    const params: any = ref({
      name: "",
      address: "",
      memo: "",
      icon: getRandomIcon(),
      id: "",
    });
    // Listen to the broadcast of the same source window
    const { handleUpdate } = useBroadCast();

    if (query.address) {
      params.value = query;
    }
    const name: Ref<string> = ref("");
    const address: Ref<string> = ref("");
    const memo: Ref<string> = ref("");
    const { $toast } = useToast();
    const asyncaddress = (val: string) => {
      iptErr2.value = false
      if(!val) {
        iptErr2.value = true
        return t('contacts.addresscannotbeempty')
      }
      try {
        utils.getAddress(val);
        return true;
      } catch (err) {
        iptErr2.value = true
        return false;
      }
    };
    const asynName = (val: string) => {
      iptErr1.value = false
      if(!val) {
        iptErr1.value = true
        return t('contacts.namecannotbeempty')
      }
      return true
    }
    const handleDelete = () => {
      Dialog.confirm({
        title: t("contacts.hint"),
        message: t("contacts.sureyouwanttodelete", { name: query.name }),
      }).then(async () => {
        // on confirm
        try {
          await dispatch(`account/deleteContact`, query.id);
          handleUpdate();
          $toast.success(t("contacts.contactdeletedsuccessfully"));
          router.back();
        } catch (err) {
          Toast(err);
        }
      });
    };
    const onSubmit = async () => {
      const opt = {
        ...params.value,
        icon: getRandomIcon(),
        id: query.id || guid(),
      };

      try {
        await store.dispatch(
          `account/${query.address ? "modifContact" : "addContacts"}`,
          opt
        );
        handleUpdate();
        $toast.success(
          query.address
            ? t("contacts.editedsuccessfully")
            : t("contacts.addedsuccessfully")
        );
        router.back();
      } catch (err: any) {
        Toast(err);
      }
    };
    return {
      t,
      onSubmit,
      iptErr1,
      iptErr2,
      asyncaddress,
      name,
      address,
      memo,
      query,
      params,
      handleDelete,
      asynName
    };
  },
};
</script>
<style lang="scss" scoped>
.contacts-add {
  padding: 0 13px;
  .label {
    font-size: 12px;
    line-height: 16px;
    margin-bottom: 10px;
  }

  .btn-groups {
    margin-top: 30px;
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
    // border: 1px solid #adb8c5;
    margin-bottom: 5px;
    padding: 0 10px;
    border-radius: 5px;
    transition: ease 0.3s;
    font-size: 12px;
    &:hover {
      border: 1px solid #9F54BA;
    }
  }
}
</style>