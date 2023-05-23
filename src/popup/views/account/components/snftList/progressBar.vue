<template>
  <div class="progress-bar" ref="barref">
    <div class="lh-14 f-12 ratio">
      {{ $t("sendSNFT.ratio") }}: 1:{{ ratio }}
      <van-popover v-model:show="showPopover" theme="dark" placement="top" class="popover-btn-tip">
        <p class="f-12 p-10" style="margin: 0">{{t('transferNft.radioTip')}}</p>
        <template #reference>
          <van-icon
            name="question"
            @mouseover="showPopover = true"
            @mouseleave="showPopover = false"
          />
        </template>
      </van-popover>
    </div>
    <div class="bar mt-4">
      <div :style="{ width: `${width <= 100 ? width : 100}%` }" class="h-10 bar-line-box">
        <div
          :class="`bar-scroll ${width > 0 ? 'scorll-enter-active' : ''}`"
        ></div>
      </div>
      <!-- cross line -->
      <div
        :class="`bar-line line${idx}`"
        v-for="(item, idx) in 10"
        :key="item"
      ></div>
      <!-- bubble -->

      <div class="bubble">
        <div class="num">{{maxRadio}}</div>
      </div>
    </div>
    <div class="flex between scale">
      <span></span>
      <span class="scale-r">{{ value }}/{{ total }}</span>
    </div>
  </div>
</template>
<script lang="ts">
import { BigNumber } from "bignumber.js";
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { Icon, Popover } from "vant";
import { useI18n } from "vue-i18n";
export default defineComponent({
  name: "progress-bar",
  components: {
    [Icon.name]: Icon,
    [Popover.name]: Popover,
  },
  props: {
    //current value
    value: {
      type: Number,
      default: 0,
    },
    // already owned
    own: {
      type: Number,
      default: 0,
    },
    // The total scale
    total: {
      type: Number,
      default: 256,
    },
    // Convertible proportion
    ratio: {
      type: Number,
      default: 0.15,
    },
    maxRadio: {
      type: Number,
      default: 0.271
    }
  },
  setup(props: any) {
    const width = ref(0);
    const barref = ref(null);
    watch(
      () => props.value,
      () => {
        const { value, total } = props;
        const nw = Number(
          new BigNumber(value).div(total).multipliedBy(100).toFixed(2)
        );
        width.value =  nw > 100 ? 100 : nw
        console.log('width', width.value, value, total)
      },{
        immediate: true,
      }
    );
    const showPopover = ref(false);
    const showPopover2 = ref(true);
    onMounted(() => {
      // Lazy loading animation encapsulation
      const intersectionObserver = new IntersectionObserver((entries) => {
        if (entries[0].intersectionRatio <= 0) return;
        const { value, total } = props;
        console.log("Loaded new items");
        let time = setTimeout(() => {
          width.value = Number(
            new BigNumber(value).div(total).multipliedBy(100).toFixed(2)
          );
          clearTimeout(time);
        });
      });
      intersectionObserver.observe(barref.value);
    });
    const {t} = useI18n()
    return {
      width,
      t,
      barref,
      showPopover,
      showPopover2,
    };
  },
});
</script>
<style lang="scss" scoped>
.bubble {
  border: 1px solid #3AAE55;
  border-radius: 7px;
  position: relative;

  &::after {
    content: "";
    width: 0;
    height: 0;
    border: 5px solid;
    position: absolute;
    bottom: -7px;
    left: 75%;
    transform: translateX(-50%);
    border-color: #fff transparent transparent;
  }
  &::before {
    content: "";
    width: 0;
    height: 0;
    border: 5px solid;
    position: absolute;
    bottom: -8px;
    left: 75%;
    transform: translateX(-50%);
    border-color: #3AAE55 transparent transparent;
  }
}

.progress-bar {
  padding: 4px 10px 7px 10px;
  background: #fff;
  color: #bbbbbb;
  border-radius: 5px;
  .ratio {
  }
  .bar {
    height: 10px;
    background: #e4e7e8;
    border-radius: 10px;
    position: relative;
    // overflow: hidden;
    .bar-line-box {
      border-radius: 10px;
      overflow: hidden;
    }
    &-scroll {
      width: 0px;
      height: 100%;
      border-top-left-radius: 10px;
      border-bottom-left-radius: 10px;
      background: linear-gradient(90deg, #ddf2e2 0%, #85e19b 100%);
    }
    .bar-line {
      width: 1px;
      height: 5px;
      border-right: 1px solid #fff;
      position: absolute;
      top: 2.5px;
    }
    .line0 {
      left: 10%;
    }
    .line1 {
      left: 20%;
    }
    .line2 {
      left: 30%;
    }
    .line3 {
      left: 40%;
    }
    .line4 {
      left: 50%;
    }
    .line5 {
      left: 60%;
    }
    .line6 {
      left: 70%;
    }
    .line7 {
      left: 80%;
    }
    .line8 {
      left: 90%;
    }
    .bubble {
      min-width: 20px;
      line-height: 10px;
      border-radius: 10px;
      color: #fff;
      text-align: center;
      font-size: 12px;
      position: absolute;
      right: 0px;
      top: -16px;
      .num {
        color: #3AAE55;
        padding: 0 4px;
        font-size: 12px;
        // transform: scale(0.8);
      }
    }
  }
  .scale {
    font-size: 12px;
    line-height: 14px;
    margin-top: 4px;
    color: #b3b3b3;
  }
}
.scale-r {
  color: #3AAE55;
}
.scorll-enter-active {
  animation: scroll-in 1s ease forwards;
}
@keyframes scroll-in {
  0% {
    width: 0px;
  }

  100% {
    width: 100%;
  }
}

@media screen and (max-width: 750px) {
  .bubble{
    &::before{
      bottom: -10px;
    }
    &::after {
      border: 4px solid;
      border-color: #fff transparent transparent;
    }
  }
}
</style>
