import { AccountInfo } from "@/popup/store/modules/account"
import moment from 'moment'
import { utils} from 'ethers'
import { web3 } from "@/popup/utils/web3";
import BigNumber from "bignumber.js";
import { useI18n } from 'vue-i18n'
import { useStore } from "vuex";
import { computed } from "vue";
import i18n from '@/popup/language/index'
import { getInput } from "@/popup/store/modules/txList";
import store from '@/popup/store/index'
const txTypes = [14,15,16,17,18,19,20,27]

type EstimateGasParams = {
  to: string;
  data: string;
};
// Mask the address
export const addressMask = (v: string) => {
    if (!v) {
        return ''
    }
    const f = v.substring(0, 8)
    const e = v.substring(v.length - 6, v.length)
    return `${f}****${e}`
}




/**
 * Send/receive
 * @param myAddress 
 * @param item 
 */
export const transactionTarget = (accountInfo: AccountInfo, item: any) => {
    const {t}=useI18n()
    if (!accountInfo) {
        return ''
    }
    const { address } = accountInfo
    if (!address) {
        return ''
    }
    try {
        const { to, from } = item
        if (address.toUpperCase() == from.toUpperCase()) {
            return (t('wallet.send'))
        }
        if (address.toUpperCase() == to ? to.toUpperCase() : '') {
            return (t('wallet.takeover'))
        }
    } catch (err) {
        return ''
    }
}

/**
 * Converts the timestamp to a date
 */
export const formatDate = (time: number, format = 'MMMM-DD') => {
    return moment(time).format(format)
}

export const formatBTCTxDate =(data: any) => {
  const {blockTime,sendStatus,date,blockTimeNormalized} = data
  if(sendStatus === 'pendding') {
    return formatDate(date, "MM/DD")+' ' + i18n.global.t("transactionDetails.at") +' ' + formatDate(date, "HH:mm ")
  }

  return formatDate(blockTime, "MM/DD")+' ' + i18n.global.t("transactionDetails.at")+' ' + formatDate(blockTime, "HH:mm ")
}

export const formatTxDate = (data: any) => {
  const {timestamp,sendStatus,date} = data
  if(sendStatus === 'pendding') {
    return formatDate(date, "MM/DD")+' ' + i18n.global.t("transactionDetails.at") +' ' + formatDate(date, "HH:mm ")
  }

  return formatDate(timestamp * 1000, "MM/DD")+' ' + i18n.global.t("transactionDetails.at")+' ' + formatDate(timestamp * 1000, "HH:mm ")
}


// Convert BigNumber amount to ETH
export const formatEther = (v: any) => {
    if (v) {
        return utils.formatEther(v)
    }
    return ''
}
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
// Convert bigNumber amount to toWei
export const parseEther = (v: any) => {
    if (v) {
        return  utils.parseEther(utils.formatEther(v))
    }
    return ''
}

// The amount is converted into US dollars
export const toUsd = (v: string | number, keepDotLength = 18) => {
    if (!v) {
      return 0;
    }
    return new BigNumber(v)
    .multipliedBy(0.5)
    .toFixed(keepDotLength, 1)
    .toString();
  };

// Calculate ETH transfer transaction fees
export const ethTractionPrice = (gas: string, gasPrice: string) => {
    if (!gas || !gasPrice) return ''
    const p1 = utils.parseEther(gas)
    const p2 = utils.parseEther(gasPrice)
    return utils.formatEther(p1.mul(p2))
}

// Calculate the maximum ETH transfer threshold
export const ethMaxPrice = (maxGas: string, gasPrice: string) => {
    if (!maxGas || !gasPrice) return ''
    const p1 = utils.parseEther(maxGas)
    const p2 = utils.parseEther(gasPrice)
    return utils.formatEther(p1.mul(p2))
}

//Method to estimate the GAS usage of a transaction by performing a message call.
export const getestimateGas = (params: EstimateGasParams) => {
    return web3.eth.estimateGas(params)
}
// Calculate total expenses
export const gasTotal = (price: string = '0', deposit:string = '0' ) => {
    if (!deposit || !price) return ''
    const p = new BigNumber(price).plus(deposit).toNumber()
    return decimal(p.toString())
}

// I'm going to keep n decimal places
export function decimal(v: string, length: number = 6) {
    if (!v) return "";
    return new BigNumber(v).toFixed(length, 1).toString()
  }
  
export function decimalCopy (v: string, length: number = 6) {
    if (!v) return "";
    return new BigNumber(v).toFixed(length, 1)
}
//Keeping N decimal places returns the total amount of transactions through the transaction record
export function calcTransaitionTotal(data: any = null) {
    if(!data)return ''
    const { receipt } = data
    if(!receipt)return ''
    const { gasUsed } = receipt
}



//On the main net Wormholes when return exchange USD before + ≈$23, otherwise do not return
export const toUsdSymbol = (v: string | number, keepDotLength = 6) => {
    const store = useStore();
    const showstr = toUsd(v,keepDotLength)
    const currentNetwork = computed(() => store.state.account.currentNetwork)
    const { chainId } = currentNetwork.value
    return chainId == 51888 ? `≈ $${showstr}`:''
  }

export function transactionBTCStatus(txData: any) {
  const {sendStatus} = txData
  if(sendStatus && sendStatus === 'pendding') return i18n.global.t('transationHistory.pendding')
  if(sendStatus === 'success') {
    return i18n.global.t('transationHistory.successly')
  }
  return i18n.global.t('transationHistory.failed')
}
  // Return to transaction status
export function transactionStatus(txData: any){
  const {status,sendStatus, sendType} = txData
  if(sendType && sendType === 'cancel') return i18n.global.t('transationHistory.canceled')
  if(sendType && sendType === 'speed') return i18n.global.t('transationHistory.accelerated')
  if(sendStatus && sendStatus === 'pendding') return i18n.global.t('transationHistory.pendding')
  return status ? i18n.global.t('transationHistory.successly') : i18n.global.t('transationHistory.failed')
  }
  // Return to form of transaction
  export function transactiontxType(status: string){
    if(status == 'send' || status == 'other'){
      return i18n.global.t('transationHistory.send')
    }
    if(status=='contract'){
      return i18n.global.t('transationHistory.contract')
    }
  }

  export const handleSendStatus = (data: any) => {
    const {status,sendStatus} = data
    if(sendStatus && sendStatus === 'pendding') return sendStatus
    return status ? 'success' : 'fail'
  }

  export const handleBTCSendStatus = (data: any) => {
    const {sendStatus} = data
    if(sendStatus && sendStatus === 'pendding') return sendStatus
    return sendStatus == 'success' ? 'success' : 'fail'
  }

  export const txTypeToIcon = (data: any) => {
    const myAddr = store.state.account.accountInfo.address.toUpperCase()
    const { to, from, txType, input, jsonData} = data
    if(txType === 'wormholes') {
      if(jsonData){
        if(jsonData.type == 6) {
          return 'icon-bottom'
        }
       if(txTypes.includes(jsonData.type)) {
         return 'icon-arrowTop'
       }
      }
   }
    if(txType == 'contract') return 'icon-caozuo-xunhuan1'
    const bigTo = to ? to.toUpperCase() : ''
    const bigFrom = from.toUpperCase()
    if((myAddr === bigTo && bigFrom !== myAddr)) return 'icon-bottom'
    if(bigTo !== bigFrom || bigTo === bigFrom) return 'icon-arrowTop'
  }



  export const handleTxType = (item: any) => {
    const { to, from, contractAddress, sendStatus , txType, input} = item
    const myAddr = store.state.account.accountInfo.address.toUpperCase()
    if(txType === 'wormholes') {
       const data = getInput(input)
       if(data){
        if(data.type == 6) {
          const { nft_address } = data
          const level = getSNFTLevel(nft_address)
          return `S-NFT(${level}) ` + i18n.global.t('common.conver')
        }
        if(data.type == 1) {
          const { nft_address } = data
          const level = getSNFTLevel(nft_address)
          if(to ? to.toUpperCase() : '' == myAddr) {
            return `S-NFT(${level}) ` + i18n.global.t('transactiondetails.recive')
          } else {
            return `S-NFT(${level}) ` + i18n.global.t('transationHistory.send')
          }
        }
        if(txTypes.includes(data.type)) {
          return i18n.global.t('transationHistory.send')
        }
       }
    }
    if(sendStatus && sendStatus === 'pendding') {
      if(txType === 'contract') {
        return i18n.global.t('transationHistory.contract')
      }
      return i18n.global.t('transationHistory.send')
    }
  
    if(txType === 'contract') return i18n.global.t('transationHistory.contract')
    console.warn('item', item)
    const bigTo = to ? to.toUpperCase() : ''
    const bigFrom = from.toUpperCase()
    if(bigTo === bigFrom)return i18n.global.t('transationHistory.send')
    if(bigTo === bigFrom || myAddr === bigTo) return i18n.global.t('transactiondetails.recive')
    if(bigTo !== bigFrom) return i18n.global.t('transationHistory.send')
    }

    function getSNFTLevel (nft_addr: string) {
      const len = nft_addr.length
      let levels = 'L0'
      switch(len){
        case 42:
          levels = 'L0';
          break;
        case 41:
          levels = 'L1';
          break;
        case 40:
          levels = 'L2';
          break;
        case 39:
          levels = 'L3';
          break;
      }
      return levels
    }

  // export const handleTxType = (item: any) => {
  // const { to, from, contractAddress, sendStatus , txType, input} = item
  // const myAddr = store.state.account.accountInfo.address.toUpperCase()
  // if(txType === 'wormholes') {
  //    const data = getInput(input)
  //    if(data){
  //     if(data.type == 6) {
  //       return i18n.global.t('common.conver')
  //     }
  //     if(txTypes.includes(data.type)) {
  //       return i18n.global.t('transationHistory.send')
  //     }
  //    }
  // }
  // if(sendStatus && sendStatus === 'pendding') {
  //   if(txType === 'contract') {
  //     return i18n.global.t('transationHistory.contract')
  //   }
  //   return i18n.global.t('transationHistory.send')
  // }

  // if(txType === 'contract') return i18n.global.t('transationHistory.contract')
  // const bigTo = to ?to.toUpperCase() :''
  // const bigFrom = from.toUpperCase()
  // if(bigTo === bigFrom)return i18n.global.t('transationHistory.send')
  // if(bigTo === bigFrom || myAddr === bigTo) return i18n.global.t('transactiondetails.recive')
  // if(bigTo !== bigFrom) return i18n.global.t('transationHistory.send')
  // }

  export const handleTxTypeString = (item: any) => {
  const { to, from, contractAddress, sendStatus , txType, input} = item
  const myAddr = store.state.account.accountInfo.address.toUpperCase()
  if(txType === 'wormholes') {
     const data = getInput(input)
     if(data){
      if(data.type == 6) {
        return 'Conver'
      }
      if(data.type == 1) {
        if(to ? to.toUpperCase() : '' == myAddr) {
          return 'S-NFT ' + i18n.global.t('transactiondetails.recive')
        } else {
          return 'S-NFT ' + i18n.global.t('transationHistory.send')
        }
      }
      if(txTypes.includes(data.type)) {
        return 'Send'
      }
     }
  }
  if(sendStatus && sendStatus === 'pendding') {
    if(txType === 'contract') {
      return 'Contract'
    }
    return 'Send'
  }

  if(txType === 'contract') return 'Contract'
  const bigTo = to ?to.toUpperCase() :''
  const bigFrom = from.toUpperCase()
  if(bigTo === bigFrom)return 'Send'
  if(bigTo === bigFrom || myAddr === bigTo) return 'Receive'
  if(bigTo !== bigFrom) return 'Send'
  }
  export const transactionStatusClass = (data: any) => {
    const {status,sendStatus} = data
    if(sendStatus && sendStatus === 'pendding') return 'waitting'
    return status ? 'success' : 'failed'
  }

  export const transactionBTCStatusClass = (data: any) => {
    const {sendStatus} = data
    if(sendStatus && sendStatus === 'pendding') return 'waitting'
    return sendStatus == 'success' ? 'success' : 'failed'
  }

export const transferBTCAmountText = (data: any) => {
  const {sendStatus,from, to, value} = data
  const val = new BigNumber(value).div(100000000).toString()
  if(sendStatus == 'pendding') {
    return val
  }
  if(sendStatus == 'success') {
    return '-' + val
  }
  return val
}

  export const transferAmountText = (data: any) => {
    const { to, from, contractAddress, value, input, convertAmount, sendStatus, status, tokenAddress, amount, txType, jsonData } = data
    const myAddr = store.state.account.accountInfo.address.toUpperCase()
    if(sendStatus && sendStatus === 'pendding'){
      if(tokenAddress) {
        return amount
      } else {
        const val = utils.formatEther(value)
        return val
      }
    }
    const val = new BigNumber(value).div(1000000000000000000).toString()
    if(txType === 'wormholes') {
      if(jsonData){
        if(jsonData.type == 6) {
          return '+' + convertAmount
        }
        if(jsonData.type == 26 || jsonData.type == 12) {
          return '+' + val
        }
       if(txTypes.includes(jsonData.type)) {
         return '-' + val
       }
      }
   }

    if(jsonData) {
    // @ts-ignore
    let { type, nft_address } = jsonData
    if(type && Number(type) === 6 && nft_address) return '+' + convertAmount
    }
    if(!status)return val
    if(contractAddress) return val
    const bigTo = to ?to.toUpperCase() :''
    const bigFrom = from.toUpperCase()
    if(bigTo === bigFrom) return '-' + val
    if((myAddr == bigTo && myAddr !== bigFrom)) return '+' + val
    if(bigTo !== bigFrom) return '-' + val

  }










// nft img url
export const nftImgUrl = (v: any) => {
  const { exchanger_addr } = v;
  let url = "";
  // url = `${imgHttpUrl}/c${exchanger_addr}/img/nft/${nft_contract_addr}/image/${nft_token_id}.jpg`
};

/**
 * Large number conversion, converts large numbers into tens of millions, tens of millions, billions, etc
 * @param value number
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
  }
  if (num <= 4) {
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

//The number is converted into JS digit source language and returned
export const toNumber = (v: string) => new BigNumber(v).toExponential(10);





// Wei Change the price to decimal
export const weiToNumber = (v: number) => {
  return v ? utils.formatEther(v) : v;
};

// SNFT addresses are converted to ERBs
//  Calculate ERB price based on synthetic grade
// The exchange price corresponding to the composite level
// 0: 100000000000000000
// 1: 150000000000000000
// 2: 225000000000000000
// 3: 300000000000000000
export const snftToErb = (address) => {
  let erbNumber = null;
  switch (address.length) {
    // snft chip
    case 42:
      erbNumber = utils.formatEther("95000000000000000");
      break;
      // snft
    case 40:
      erbNumber = utils.formatEther("143000000000000000");
      break;
      // compilations
    case 39:
      erbNumber = utils.formatEther("271000000000000000");
      break;
      // expect
    case 38:
      erbNumber = utils.formatEther("650000000000000000");
      break;
  }
  return erbNumber;
};




export const transferAmount = (data: any) => {
  const {transitionType, value, convertAmount} = data
  const transferNumber = utils.formatEther(value)
  if(!transitionType) return '-' + transferNumber
  if(transitionType === '6') return '+' + convertAmount
  // if(transitionType === '10' || transitionType === '12') return '+' + transferNumber
  return '-' + transferNumber
}