import { AccountInfo } from "@/popup/store/modules/account";
import moment from "moment";
import { utils } from "ethers";
import { web3 } from "@/popup/utils/web3";
import BigNumber from "bignumber.js";
import { useI18n } from "vue-i18n";
import { useStore } from "vuex";
import { computed } from "vue";


import i18n from '@/popup/language/index'
import store from "@/popup/store";
// Mask address
export const addressMask = (v: string) => {
  if (!v) {
    return "";
  }
  const f = v.substring(0, 6);
  const e = v.substring(v.length - 4, v.length);
  return `${f}****${e}`;
};

/**
 * Send / receive
 * @param myAddress
 * @param item
 */
export const transactionTarget = (accountInfo: AccountInfo, item: any) => {
  const { t } = useI18n();
  if (!accountInfo) {
    return "";
  }
  const { address } = accountInfo;
  if (!address) {
    return "";
  }
  try {
    const { to, from } = item;
    if (address.toUpperCase() == from.toUpperCase()) {
      return t("wallet.send");
    }
    if (address.toUpperCase() == to.toUpperCase()) {
      return t("wallet.takeover");
    }
  } catch (err) {
    return "";
  }
};

/**
 * Convert timestamp to date
 */
export const formatDate = (time: number, format = "MMMM.DD") => {
  if(time){
    return moment(time).format(format);
  }
 return ''
};

// Convert BigNumber amount to eth
export const formatEther = (v: any) => {
  if (v) {
    return utils.formatEther(v);
  }
  return "";
};

// Convert BigNumber amount to toWei
export const parseEther = (v: any) => {
  if (v) {
    return utils.parseEther(utils.formatEther(v));
  }
  return "";
};

// Calculate eth transfer transaction fee
export const ethTractionPrice = (gas: string, gasPrice: string) => {
  if (!gas || !gasPrice) return "";
  const p1 = utils.parseEther(gas);
  const p2 = utils.parseEther(gasPrice);
  return utils.formatEther(p1.mul(p2));
};

// Calculate the maximum threshold of eth transfer
export const ethMaxPrice = (maxGas: string, gasPrice: string) => {
  if (!maxGas || !gasPrice) return "";
  const p1 = utils.parseEther(maxGas);
  const p2 = utils.parseEther(gasPrice);
  return utils.formatEther(p1.mul(p2));
};
type EstimateGasParams = {
  to: string;
  data: string;
};
// Method to estimate the gas consumption of the transaction by executing a message call.
export const getestimateGas = (params: EstimateGasParams) => {
  return web3.eth.estimateGas(params);
};
// Calculate total cost
export const gasTotal = (price: string = "0", deposit: string = "0") => {
  if (!deposit || !price) return "";
  const p = new BigNumber(price).plus(deposit).toNumber();
  return decimal(p.toString());
};

// Keep N decimal places
export function decimal(v: string, length: number = 6) {
  if (!v) return "";
  return new BigNumber(v).toFixed(length, 1).toString()
}

// Return total transaction amount through transaction
export function calcTransaitionTotal(data: any = null) {
  if (!data) return "";
  const { receipt } = data;
  if (!receipt) return "";
  const { gasUsed } = receipt;
}


// 返回nft图片
export const nftImgUrl = (v: any) => {
  const { exchanger_addr } = v;
  let url = "";
  // url = `${imgHttpUrl}/c${exchanger_addr}/img/nft/${nft_contract_addr}/image/${nft_token_id}.jpg`
};
export const scientificToNumber = (num:any) => {
  if(/\d+\.?\d*e[\+\-]*\d+/i.test(num)) {
    let zero = '0';
    let parts = String(num).toLowerCase().split('e');
    let e = parts[1];
    let zeroLen = Math.abs(Number(e));
    let sign = Number(e) / zeroLen;
    let beforeArr = parts[0].split('.');
    if(sign < 0) {
      num = zero + '.' + new Array(zeroLen).join(zero) + beforeArr.join('');
    } else {
      let dec = beforeArr[1];
      if(dec) {
        zeroLen = zeroLen - dec.length;
        num = beforeArr.join('') + new Array(zeroLen + 1).join(zero);
      }
    }
  }
  return num;
}
/**
 * 大数字转换，将大额数字转换为万、千万、亿等
 * @param value 数字值
 */
export function bigNumberTransform(value: any) {
  const newValue = ["", "", ""];
  let fr = 1000;
  let num = 3;
  let text1 = "";
  let fm = 1;
  while (value / fr >= 1) {
    fr *= 10;
    num += 1;
    // console.log('数字', value / fr, 'num:', num)
  }
  if (num <= 4) {
    // 千
    // @ts-ignore
    newValue[0] = parseInt(value / 1000) + "";
    newValue[1] = "千";
  } else if (num <= 8) {
    // 万
    // @ts-ignore

    text1 = parseInt(num - 4) / 3 > 1 ? "千万" : "万";
    // tslint:disable-next-line:no-shadowed-variable
    fm = text1 === "万" ? 10000 : 10000000;
    if (value % fm === 0) {
      // @ts-ignore

      newValue[0] = parseInt(value / fm) + "";
    } else {
      // @ts-ignore

      newValue[0] = parseFloat(value / fm).toFixed(2) + "";
    }
    newValue[1] = text1;
  } else if (num <= 16) {
    // 亿
    text1 = (num - 8) / 3 > 1 ? "千亿" : "亿";
    text1 = (num - 8) / 4 > 1 ? "万亿" : text1;
    text1 = (num - 8) / 7 > 1 ? "千万亿" : text1;
    // tslint:disable-next-line:no-shadowed-variable
    fm = 1;
    if (text1 === "亿") {
      fm = 100000000;
    } else if (text1 === "千亿") {
      fm = 100000000000;
    } else if (text1 === "万亿") {
      fm = 1000000000000;
    } else if (text1 === "千万亿") {
      fm = 1000000000000000;
    }
    if (value % fm === 0) {
      // @ts-ignore

      newValue[0] = parseInt(value / fm) + "";
    } else {
      // @ts-ignore

      newValue[0] = parseFloat(value / fm).toFixed(2) + "";
    }
    newValue[1] = text1;
  }
  if (value < 1000) {
    newValue[0] = value + "";
    newValue[1] = "";
  }
  return newValue.join("");
}

// 数字转换成js数字源语返回
export const toNumber = (v: string) => new BigNumber(v).toExponential(10);

// amount兑换成美元
export const toUsd = (v: string | number, keepDotLength = 18) => {
  if (!v) {
    return 0;
  }
  return new BigNumber(v)
    .multipliedBy(0.5)
    .toFixed(keepDotLength, 1)
    .toString();
};

// 在主网Wormholes的时候返回 兑换美元前面+ ≈$23，否则不返回
export const toUsdSymbol = (v: string | number, keepDotLength = 6) => {
  const store = useStore();
  const showstr = toUsd(v,keepDotLength)
  const currentNetwork = computed(() => store.state.account.currentNetwork)
  const { chainId } = currentNetwork.value
  return chainId == 51888 ? `≈ $${showstr}`:''
}

// wei价格换成10进制
export const weiToNumber = (v: number) => {
  return v ? utils.formatEther(v) : v;
};

// snft地址 转换成erb
//  根据合成等级计算erb价格
// 合成级别对应的兑换价格
// 0: 100000000000000000
// 1: 150000000000000000
// 2: 225000000000000000
// 3: 300000000000000000
export const snftToErb = (address) => {
  let erbNumber = null;
  switch (address.length) {
    // snft 碎片
    case 42:
      erbNumber = utils.formatEther("100000000000000000");
      break;
      // snft
    case 40:
      erbNumber = utils.formatEther("150000000000000000");
      break;
      // 合集
    case 39:
      erbNumber = utils.formatEther("225000000000000000");
      break;
      // 期
    case 38:
      erbNumber = utils.formatEther("300000000000000000");
      break;
  }
  return erbNumber;
};


// 返回交易状态
export function transactionStatus(status: number){
  if(status == 1){
    return i18n.global.t('transationHistory.confirmed')
  }
  if(status == 0){
    return i18n.global.t('transationHistory.failed')
  }
}
// 返回交易形式
export function transactiontxType(status: string){
  if(status == 'send'){
    return i18n.global.t('transationHistory.send')
  }
  if(status=='contract'){
    return i18n.global.t('transationHistory.contract')
  }
  if(status == 'swap'){
    return i18n.global.t('transationHistory.swap')
  }
  if(status=='other'){
    return i18n.global.t('transationHistory.other')
  }
  if(status == 'recive'){
    return i18n.global.t('transationHistory.recive')
  }
 
}