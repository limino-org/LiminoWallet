<template>
    <NavHeader :hasRight="false"  title="LiminoWallet"></NavHeader>
    <div>
        <div class="flex center p-20">
            <textarea @blur="handleSig" class="text" name="" id="" cols="30" rows="10" v-model="sign"></textarea>
        </div>
        <!-- Ordinary signature -->
        <div class="mb-10 f-12 ml-20 mr-20">{{  t("sign.ordinarysignature")  }}</div>
        <div class="p-10 sig-text mb-30 ml-20 mr-20 van-hairline--surround">
            {{  sig1  }} <i class="iconfont icon-copy" @click="handleCopy(1)"></i>
        </div>
        <!-- Background signature -->
        <div class="mb-10 f-12 ml-20 mr-20">{{  t("sign.exchangesignature")  }}</div>
        <div class="p-10 sig-text van-hairline--surround ml-20 mr-20">
            {{  sig2  }} <i class="iconfont icon-copy" @click="handleCopy(2)"></i>
        </div>
    </div>
</template>
<script lang="ts">
import { Loading, Sticky, Icon, Field, Button, Toast } from "vant";
import NavHeader from "@/popup/components/navHeader/index.vue";
import { useRoute, useRouter } from "vue-router";
import { useSign } from "../sign/hooks/sign";
import { onMounted, ref, Ref } from "vue";
import useClipboard from "vue-clipboard3";
import { useI18n } from "vue-i18n";
import { getWallet } from "@/popup/store/modules/account";
import { hashMessage } from "@ethersproject/hash";
import { ethers } from "ethers";

export default {
    name: "sign-page",
    components: {
        [Field.name]: Field,
        [Button.name]: Button,
        [Icon.name]: Icon,
        [Sticky.name]: Sticky,
        NavHeader,
    },
    setup() {
        const { t } = useI18n();
        const sign = ref("");
        const sig1 = ref("");
        const sig2 = ref("");
        const { toClipboard } = useClipboard();

        const handleSig = async () => {
            if (!sign.value) {
                Toast(t("sign.nodatatosign"));
                return;
            }
            const wallet = await getWallet();
            sig1.value = await wallet.signMessage(sign.value);
            const hash = hashMessage(sign.value);
            sig2.value = ethers.utils.joinSignature(
                new ethers.utils.SigningKey(wallet.privateKey).signDigest(hash)
            );
        };

        const handleCopy = (v) => {
            if (v == 1) {
                toClipboard(sig1.value);
                Toast(t("sign.copysuccessfully"));
            }
            if (v == 2) {
                toClipboard(sig2.value);
                Toast(t("sign.copysuccessfully"));
            }
        };
        return {
            t,
            sign,
            sig1,
            sig2,
            handleSig,
            handleCopy,
        };
    },
};
</script>
<style lang="scss" scoped>
.text {
    width: 100%;
    padding: 10px;
}

.sig-text {
    word-break: break-all;
    position: relative;

    i {
        position: absolute;
        font-size: 14px;
        cursor: pointer;
        right: 5px;
        bottom: 5px;
    }
}
</style>