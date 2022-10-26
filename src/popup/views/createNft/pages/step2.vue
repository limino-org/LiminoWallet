<template>
  <div class="page-container">
    <div class="loading-bg pt-24 pb-24">
      <div class="flex between center-v dotted-box">
        <div class="step2 f-12 lh-16">1</div>
        <span class="dotted-line"></span>
        <div class="step3 f-12 lh-16 no">2</div>
      </div>
      <div class="flex between f-12 dotted-box">
        <div class="tit-small now">{{ t("castingnft.information") }}</div>
        <div class="tit-small no">{{ t("castingnft.done") }}</div>
      </div>
    </div>
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <div class="text-bold f-12 mt-10 mb-6 lh-16 form-tit">
          <span class="warning">*</span>
          {{ t("castingnft.metaUrl") }}
          <van-popover
            v-model:show="showPopover"
            :offset="[-12, 8]"
            theme="dark"
            placement="top-start"
            class="createNft-popover one"
            teleport="#page-box"
          >
            <div
              class="f-12 pl-10 pr-10 pt-10 pb-10"
              @click="showPopover = false"
            >
              <span class="lh-14">{{ $t("castingnft.urlpopover") }}</span>
              <span class="highSpan block">
                {{ $t("castingnft.urlpopover2") }}
              </span>
            </div>
            <template #reference>
              <van-icon name="question hover" @mouseover="showPopover = true" @mouseout="showPopover = false" />
            </template>
          </van-popover>
        </div>
        <van-field
          v-model="meta_url"
          name="meta_url"
          :placeholder="$t('castingnft.metaUrlPlaceholder')"
          :rules="[{ required: true, message: t('castingnft.errorEntered') }]"
        />
        <div class="text-bold f-12 mt-10 mb-6 lh-16 form-tit">
          <span class="warning">*</span>
          {{ t("castingnft.collectibleName") }}
          <van-popover
            v-model:show="showPopover1"
            theme="dark"
            :offset="[-12, 8]"
            placement="top-start"
            class="createNft-popover two"
            teleport="#page-box"
          >
            <div
              class="f-12 pl-10 pr-10 pt-10 pb-10"
              @click="showPopover1 = false"
            >
              <span class="highSpan">{{ $t("castingnft.namepopover2") }}</span>
              <span class="lh-14">{{ $t("castingnft.namepopover") }}</span>
            </div>
            <template #reference>
              <van-icon name="question hover" @mouseover="showPopover1 = true" @mouseout="showPopover1 = false" />
            </template>
          </van-popover>
        </div>
        <van-field
          v-model="name"
          name="name"
          :placeholder="$t('castingnft.collectibleNamePlaceholder')"
          maxlength="60"
          :rules="[
            { required: true, message: t('castingnft.errorEntered') },
            {
              validator: collcetionname,
              message: t('castingnft.collectibleNamePlaceholder'),
            },
          ]"
        />

        <div class="text-bold f-12 mt-10 mb-6 form-tit lh-16">
          <span class="warning">*</span>
          {{ t("castingnft.collectionIntroduction") }}
          <van-popover
            v-model:show="showPopover2"
            :offset="[-12, 8]"
            theme="dark"
            placement="top-start"
            class="createNft-popover three"
            teleport="#page-box"
          >
            <div
              class="f-12 pl-10 pr-10 pt-10 pb-10"
              @click="showPopover2 = false"
            >
              {{ $t("castingnft.descpopover") }}
            </div>
            <template #reference>
              <van-icon name="question hover" @mouseover="showPopover2 = true" @mouseout="showPopover2 = false" />
            </template>
          </van-popover>
        </div>
        <van-field
          v-model="desc"
          rows="2"
          type="textarea"
          class="textarea"
          name="desc"
          :placeholder="$t('castingnft.collectionIntroductionPlaceholder')"
          maxlength="60"
          :rules="[
            { required: true, message: t('castingnft.errorEntered') },
            {
              validator: collcetiondesc,
              message: t('castingnft.collectibleNamePlaceholder'),
            },
          ]"
        />
        <div class="text-bold f-12 mt-10 mb-6 form-tit lh-16">
          <span class="warning">*</span>
          {{ t("castingnft.royalty") }}
          <van-popover
            v-model:show="showPopover3"
            theme="dark"
            :offset="[-12, 8]"
            placement="top-start"
            class="createNft-popover"
            teleport="#page-box"
          >
            <div
              class="f-12 pl-10 pr-10 pt-10 pb-10"
              @click="showPopover3 = false"
            >
              {{ $t("castingnft.royaltypopover") }}
            </div>
            <template #reference>
              <van-icon name="question hover" @mouseover="showPopover3 = true" @mouseout="showPopover3 = false" />
            </template>
          </van-popover>
        </div>
        <van-field
          v-model="royalty"
          name="royalty"
          type="digit"
          @blur="blurRoyalty"
          :placeholder="$t('castingnft.royaltyPlaceholder')"
          :rules="[
            { required: true, message: t('castingnft.numbersof') },
            {
              validator: asyncRoyalty,
              message: t('createAccountpage.inconsistentPwd'),
            },
          ]"
        />
        <div class="text-bold f-12 mt-10 mb-6 form-tit lh-16">
          <span class="warning">*</span>
          {{ t("castingnft.category") }}
          <van-popover
            v-model:show="showPopover4"
            :offset="[-12, 8]"
            theme="dark"
            placement="top-start"
            class="createNft-popover"
            teleport="#page-box"
          >
            <div
              class="f-12 pl-10 pr-10 pt-10 pb-10"
              @click="showPopover4 = false"
            >
              {{ $t("castingnft.royaltypopover") }}
            </div>
            <template #reference>
              <van-icon name="question hover" @mouseover="showPopover4 = true" @mouseout="showPopover4 = false" />
            </template>
          </van-popover>
        </div>
        <van-field
          v-model="category.label"
          class="hover"
          style="cursor: pointer"
          right-icon="arrow-down"
          name="category"
          readonly
          @click="handleCategory"
          :placeholder="$t('castingnft.categoryPlaceholder')"
          :rules="[
            {
              required: true,
              message: t('castingnft.selectaCollectionCategory'),
            },
          ]"
        />
      </van-cell-group>
      <div class="form-button">
        <div class="container pl-28 pr-28">
          <van-button
            :loading="loading"
            round
            block
            type="primary"
            native-type="submit"
            >{{ t("castingnft.next") }}</van-button
          >
        </div>
      </div>
    </van-form>
  </div>
  <!-- Classification of pop-ups -->
  <Categoryform v-model="setAmountModal" @handleComfirm="handleComfirm" :selectId="category.value" />
</template>
<script lang="ts">
import Vue from "vue";
import {
  Icon,
  Toast,
  Button,
  Tab,
  Tabs,
  Uploader,
  Form,
  Field,
  CellGroup,
  Dialog,
  Step,
  Steps,
  Popover,
  Picker,
  Popup,
  Loading,
} from "vant";
import { ref, Ref, computed, toRaw, SetupContext, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import Categoryform from "@/popup/components/categoryform/index.vue";
import BigNumber from "bignumber.js";
import { web3 } from "@/popup/utils/web3";
import { collectibleRules,regExchangeName } from "@/popup/enum/regexp";
import { encode, decode } from 'js-base64';
export default {
  name: "createNft-step2",
  components: {
    [Icon.name]: Icon,
    [Button.name]: Button,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [Uploader.name]: Uploader,
    [Form.name]: Form,
    [Field.name]: Field,
    [CellGroup.name]: CellGroup,
    [Dialog.Component.name]: Dialog.Component,
    [Step.name]: Step,
    [Steps.name]: Steps,
    [Popover.name]: Popover,
    [Picker.name]: Picker,
    [Popup.name]: Popup,
    Categoryform,
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const { state, dispatch } = useStore();
    const active = ref(1);
    const meta_url = ref("");
    const name: Ref<string> = ref("");
    const desc: Ref<string> = ref("");
    const royalty: Ref<string> = ref("");
    const category: Ref<any> = ref({});
    const setAmountModal = ref(false);
    const handleCategory = () => {
      setAmountModal.value = true;
    };

    const loading = ref(false);
    const onSubmit = async (values: any) => {
      const name1 = name.value.toString()
      const desc1 = desc.value.toString()
      console.log("111", name1);
      if (new BigNumber(royalty.value).lte(0)) {
        Toast(t("castingnft.royaltyTip"));
        return;
      }
      loading.value = true;
      console.log("submit", values);
      try {
        const receipt = await dispatch("nft/nftCreate", {
          meta_url: meta_url.value,
          name: name1,
          desc: desc1,
          royalty: Number(royalty.value),
          // @ts-ignore
          category: category.value.value
        });
        if(receipt.status == 1) {
          Toast(t("castingnft.success"));
        router.replace({ name: "createNft-step3" });
        }

      } catch (err) {
        Toast(err.error.message);
      } finally {
        loading.value = false;
      }
    };
    const toreturn = () => {
      Dialog.confirm({
        message: "Are you sure to cancel ?",
      }).then(() => {
        router.back();
      });
    };

    const blurRoyalty = (v) => {
      const bigInt = new BigNumber(royalty.value);
      if (bigInt.gt(10)) {
        royalty.value = "10";
        return;
      }
      if (bigInt.lt(1)) {
        royalty.value = "1";
        return;
      }
      // Keep one decimal place
      royalty.value = parseFloat(bigInt.toFormat(1).toString()).toString();
    };
    const handleComfirm = (data: any) => {
      category.value = data;
    };
    // Calibration optimization
    const asyncRoyalty = (v) => {
      if (new BigNumber(royalty.value)) {
      }
    };
    // Collection name
    const collcetionname = (val: string) => {
      if (regExchangeName.test(name.value)) {
        return true;
      }
      return false;
    };
    const collcetiondesc = (val: string) => {
      if (collectibleRules.test(desc.value)) {
        return true;
      }
      return false;
    };
    const showPopover = ref(false);
    const showPopover1 = ref(false);
    const showPopover2 = ref(false);
    const showPopover3 = ref(false);
    const showPopover4 = ref(false);
    return {
      asyncRoyalty,
      t,
      active,
      onSubmit,
      blurRoyalty,
      name,
      desc,
      royalty,
      category,
      meta_url,
      toreturn,
      loading,
      handleCategory,
      setAmountModal,
      handleComfirm,
      collcetionname,
      collcetiondesc,
      showPopover,
      showPopover1,
      showPopover2,
      showPopover3,
      showPopover4,
    };
  },
};
</script>
<style lang="scss" scoped>
.block {
  display: block;
}
:deep(){
  .van-field__error-message {
    margin-top: 4px;
  }
}
:deep(.van-icon-question) {
  color: #b3b3b3;
  font-size: 14px;
}
.highSpan {
  color: #037cd6;
  line-height: 14px;
}

.page-container {
  padding-bottom: 100px;


  :deep() {
    .van-cell-group--inset {
      overflow: scroll;
    }
    .van-field__control--min-height {
      min-height: auto;
    }
    .van-field__right-icon {
      color: #037cd6;
    }

    .van-cell {
      padding: 0;
      &::after {
        display: none;
      }
    }
    .van-cell-group--inset {
      margin: 0 27px;
      padding-bottom: 1px;
    }
    .form-tit {
      position: relative;
      .warning {
        color: red;
      }
    }
  }

  .dotted-box {
    width: 45vw;
    margin: 0 auto;
  }
  .loading-bg {
    background: rgba(244, 250, 255, 1);
    .tit-big {
      line-height: 21px;
    }
    .step {
      width: 17px;
      height: 17px;
      background-color: #037cd6;
      color: #fff;
      text-align: center;
      border-radius: 50%;
    }
    .step2 {
      width: 17px;
      height: 17px;
      background-color: #68b1e6;
      color: #fff;
      text-align: center;
      border-radius: 50%;
    }
    .step3 {
      width: 16px;
      height: 16px;
      background-color: #fff;
      border: 1PX solid #b3b3b3;
      color: #b3b3b3;
      text-align: center;
      border-radius: 50%;
    }
    .dotted-line {
      text-align: center;
      width: 88%;
      height: 0px;
      border-bottom: 1px dashed #037cd6;
    }
    .dotted-line2 {
      margin-top: 2px;
      text-align: center;
      width: 80px;
      height: 0px;
      border: 1PX dashed #979797;
      transform: scale(0.8);
    }
    .tit-small {
      color: #037cd6;
    }
    .now {
      color: #68b1e6;
    }
    .no {
      color: #b3b3b3;
    }
  }
  .content {
    margin-top: 45px;
  }
  .tit-small {
    color: #bbbbbb;
    margin-top: 5px;
  }
  .form-button {
    position: fixed;
    right: 0px;
    left: 0px;
    bottom: 26px;
  }
  .icon-box {
    margin-top: 50px;
    .iconele {
      width: 175px;
      height: 175px;
      border-radius: 50%;
      overflow: hidden;
      background-size: cover;
      background-repeat: no-repeat;
      background-position: left 0 top 0 right 0 bottom 0;
      .iconinner {
        width: 110px;
        height: 110px;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: left 0 top 0 right 0 bottom 0;

        img {
          display: block;
          width: 40%;
        }
      }
    }
  }
  .tip-info {
    width: 255px;
    margin: 0 auto;
    color: #848484;
  }
  .text {
    border-radius: 3px;
    border: 2px solid #e8e9eb;
  }
}
</style>