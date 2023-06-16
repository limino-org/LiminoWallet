<template>
  <div class="guide-step2" id="guide-step2-page">
    <div class="text-center f-24 title">{{ t("createAccountpage.terms") }}</div>
    <div class="text-center f-12 tit-content">
      {{ t("createAccountpage.serviceandPrivacyNotice") }}
    </div>
    <div class="selection-box">
      <div class="tit terms flex between hover" @click="toservice">
        <div class="f-12">{{ t("createAccountpage.service") }}</div>
        <div class="f-12 flex between">
          <div class="check-icons mr-24">
            <i class="iconfont icon-duihao" v-if="checked && !check"></i>
            <i class="iconfont icon-cuowuguanbiquxiao" v-if="check"></i>
          </div>
          <i class="iconfont icon-youjiantou" color="#9F54BA"></i>
        </div>
      </div>
      <div class="tit privacy flex between hover" @click="toprivacy">
        <div class="f-12">{{ t("createAccountpage.privacy") }}</div>
        <div class="f-12 flex between">
          <div class="check-icons mr-24">
            <i class="iconfont icon-duihao" v-if="checked1 && !check1"></i>
            <i class="iconfont icon-cuowuguanbiquxiao" v-if="check1"></i>
          </div>
          <i class="iconfont icon-youjiantou" color="#9F54BA"></i>
        </div>
      </div>
    </div>
    <!-- <div class="flex check left">
      <van-checkbox shape="square" icon-size="14px" v-model="checkAll" @change="handleChange" />
      <div class="tit-small f-12 ml-10 lh-16">{{t("createAccountpage.userAgreement")}}</div>
    </div> -->
    <div class="form-button">
      <div class="m-center pl-22 pr-22 flex between">
        <van-button round block plain type="primary" @click="toback">{{
          t("createAccountpage.back")
        }}</van-button>
        <van-button round block type="primary" @click="togo">{{
          t("createAccountpage.continue")
        }}</van-button>
      </div>
    </div>
  </div>
  <!-- Terms of service -->
  <TermsService v-model="showService" @select="handleSelect" />

  <!-- Privacy policy -->
  <PrivacyPolicy v-model="showPrivacy" @select="handleSelect2" />
</template>
<script lang="ts">
import { Icon, Checkbox, Button, Toast } from "vant";
import { useRoute, useRouter } from "vue-router";
import { ref, Ref, computed, toRaw, SetupContext, onMounted, watch } from "vue";
import TermsService from "@/popup/components/termsservice/index.vue";
import PrivacyPolicy from "@/popup/components/privacypolicy/index.vue";
import { useI18n } from "vue-i18n";
import { useToast } from "@/popup/plugins/toast";
export default {
  name: "guide-step2",
  components: {
    [Icon.name]: Icon,
    [Checkbox.name]: Checkbox,
    [Button.name]: Button,
    TermsService,
    PrivacyPolicy,
  },
  setup() {
    const { t } = useI18n();
    const checked = ref(false);
    const checked1: Ref<boolean> = ref(false);
    const check = ref(false);
    const check1 = ref(false);
    const router = useRouter();
    const { $toast } = useToast();
    const toback = () => {
      router.push({
        name: "guide-step1",
      });
    };
    const togo = () => {
      !checked.value ? (check.value = true) : "";
      !checked1.value ? (check1.value = true) : "";
      if (!checked.value || !checked1.value) {
        $toast.warn(t("createAccountpage.serviceandPrivacyNotice"));
      } else {
        router.push({
          name: "loginAccount-create-step1",
        });
      }
    };

    //  service
    const showService: Ref<boolean> = ref(false);
    const toservice = () => {
      console.log("11");
      showService.value = true;
    };
    //  Laws and regulations
    const showPrivacy: Ref<boolean> = ref(false);
    const toprivacy = () => {
      console.log("12");
      showPrivacy.value = true;
    };
    const handleSelect = (v: any) => {
      checked.value = v;
      check.value = false
    };
    const handleSelect2 = (v: any) => {
      checked1.value = v;
      check1.value = false
    };

    return {
      t,
      checked1,
      checked,
      check,
      check1,
      toback,
      togo,
      toservice,
      toprivacy,
      showService,
      showPrivacy,
      handleSelect,
      handleSelect2,
    };
  },
};
</script>
<style lang='scss' scoped >
.icon-youjiantou {
  font-size: 16px;
}
.guide-step2 {
  .title {
    font-weight: 700;
    padding-top: 77px;
  }
  .tit-content {
    color: #b3b3b3;
    margin-top: 10px;
  }
  .selection-box {
    height: 160px;
    // width: 318px;
    border: 1px solid #e4e7e8;
    margin: 22px 27px;
    .tit {
      color: #9F54BA;
      height: 80px;
      line-height: 80px;
      padding-right: 15px;
      padding-left: 15px;
    }
    .terms {
      position: relative;
      &::after {
        display: block;
        content: "";
        position: absolute;
        height: 1px;
        border-bottom: 1px solid #e4e7e8;
        left: 17.5px;
        right: 17.5px;
        bottom: 0;
      }
    }
  }
  .tit-small {
    color: #b3b3b3;
  }
  .form-button {
    display: flex;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 50px;
    button:nth-of-type(1) {
      margin-right: 20px;
    }
  }
  .check {
    margin-top: 26px;
    margin-left: 27px;
  }
  .check-icons {
    .icon-duihao {
      color: #3aae55;
      font-size: 13px;
    }
    .icon-cuowuguanbiquxiao {
      color: #d73a49;
      font-size: 15px;
    }
  }
}
</style>