import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { Toast } from "vant";
import { computed, onMounted, ref, Ref, watch } from "vue";
import { ethers } from "ethers";
import { encode, decode } from 'js-base64';

import {
  ExchangeStatus,
  getWallet,
  handleGetTranactionReceipt,
  TransactionTypes,
  TransactionReceipt,
} from "@/popup/store/modules/account";
import { hashMessage } from "@/popup/utils/ether";
import { useSign } from "@/popup/views/sign/hooks/sign";
import { web3 } from "@/popup/utils/web3";

import {
  createExchange,
  getSysParams,
  getExchangeSig,
  checkAuth,
  setExchangeSig,
  is_install
} from "@/popup/http/modules/common";
const erbAbi = require("@/popup/assets/json/erbAbi.json");
import { utils } from "ethers";
import i18n from "@/popup/language/index";
import { useTradeConfirm } from "@/popup/plugins/tradeConfirmationsModal";
import router from "@/popup/router";

// 一键交易所
export const useExchanges = () => {
  const {$tradeConfirm} = useTradeConfirm()
  // 是否展示一键交易所的弹层
  const showCreateExchange: Ref<boolean> = ref(false);
  // 展示第二页的弹层
  const showExchange: Ref<boolean> = ref(false);
  // 展示第三页的弹层
  const showExchange1: Ref<boolean> = ref(false);
  // 实际进度
  const currentRate: Ref<number> = ref(0);
  // 目标进度
  const rate: Ref<number> = ref(0);
  // 交易所链接
  const exchangeUrl: Ref<string> = ref("");
  // 后台链接
  const adminUrl: Ref<string> = ref("");
  // 创建交易所成功的状态
  const ready: Ref<boolean> = ref(false);
  // 进度条速度
  const speed: Ref<number> = ref(2);
  const { dispatch, state, commit } = useStore();
  const { toSign, sign } = useSign();

  // 第二笔交易
  const send2 = async (
    amount: number = 200,
    exchange_name: string,
    callBack = () => { }
  ) => {
    const wallet = await getWallet();
    const contractWithSigner = await getContract();
    const { address } = wallet;
    const data = await contractWithSigner.functions.payForRenew({
      value: ethers.utils.parseEther(amount + ""),
    });
    $tradeConfirm.update({
      status:"approve"
    })
    localStorage.setItem("tx2", JSON.stringify(data));

    rate.value = 70;
    console.log("一键交易所", data);
    const receipt = await wallet.provider.waitForTransaction(data.hash);
    if(receipt.status != 1) {
      $tradeConfirm.update({
        status:"fail"
      })
    }
    localStorage.setItem("receipt2", JSON.stringify(receipt));
    const symbol = state.account.currentNetwork.currencySymbol
    const rep: TransactionReceipt = handleGetTranactionReceipt(
      TransactionTypes.contract,
      receipt,
      data,
      symbol
    );
    dispatch("account/updateAllBalance");
    commit("account/PUSH_TRANSACTION", rep);
    const { status } = receipt;
    if (status == 0) {
      resetData();
      Toast(i18n.global.t("userexchange.transactionfailed"));
      return;
    }
    rate.value = 80;
    const params = await generateSign(exchange_name);
    // 发送数据开交易所
    const sendData = {
      address,
      params: `'${JSON.stringify(params)}'`,
    };
    sessionStorage.setItem('sendData', JSON.stringify(sendData))
    // Toast.loading({
    //   message: i18n.global.t("userexchange.loading"),
    //   forbidClick: true,
    //   loadingType: "spinner",
    // });
    const res = await is_install(address)
    console.log('111', res.code);
    if (res.code == 'true') {
      speed.value = 100;
      rate.value = 100;
      $tradeConfirm.update({
        status:"success",
        callBack(){
          router.replace({name:"createExchangeSuccess",query:{firstTime: 'true'}})
        },
      })
      return Promise.resolve()
    }
    try {
      // 发送给一键交易所接口
      const val: any = await createExchange(sendData);
      if (val.code == "true") {
        rate.value = 90;
        let time = setTimeout(async () => {
          try {
            const data = await authExchange();
            speed.value = 100;
            rate.value = 100;
            Toast(i18n.global.t("userexchange.success"));
            dispatch('account/getExchangeStatus')
            ready.value = true;
            $tradeConfirm.update({
              status:"success",
              callBack(){
                router.replace({name:"createExchangeSuccess",query: {firstTime:'true'}})
              },
            })
            callBack ? callBack() : "";
          } catch (err: any) {
            Toast(err.msg);
            $tradeConfirm.update({
              status:"fail",
              failBack(){
                  
              }
            })
          } finally {
            let time = setTimeout(() => {
              resetData();
              clearTimeout(time);
            }, 3000);
          }
          clearTimeout(time);
        }, 10000);
      } else {
        resetData();
        $tradeConfirm.update({
          status:"fail",
          failBack(){
                  
          }
        })
        Toast(i18n.global.t("userexchange.buildfailed"));
      }
    } catch (err: any) {
      Toast(err);
      resetData();
      $tradeConfirm.update({
        status:"fail",
        failBack(){
                  
        }
      })
    }
  };

  /**
   * 生成一个签名的交易所授权信息
   */
  const generateSign = async (name: string) => {
    const wallet = await getWallet();
    const blockNumber = await wallet.provider.getBlockNumber();
    const exchanger_owner: string = wallet.address;
    const to: string = "0x7fBC8ad616177c6519228FCa4a7D9EC7d1804900";
    const exchange_name: string = name
    // const block_number: number = blockNumber + 86400;
    // const sign_exchange_owner = await wallet.signMessage(exchange_owner);
    // const sign_to = await wallet.signMessage(to);
    // const sign_block_number = await wallet.signMessage(block_number);
    const newstr = hashMessage(`${exchanger_owner}${to}${blockNumber}`)
    return new Promise(async (resolve, reject) => {
      const sigstr = await signParams(newstr)
      const params = {
        type: "exchange_auth",
        exchange_name,
        version: 1, //授权版本(固定)
        exchanger_owner, //一键交易所创建者地址(钱包地址)
        to, // 被授权者地址(固定地址，由李工提供)
        block_number: blockNumber, // 授权时链的区块高度，用于确定授权有效性(从区块浏览器获得,如果拿不到就先写死)
        sig: sigstr, //签名规则如下方解释
      };
      resolve(params)
    })


  };
  // 连合约，发交易
  const getContract = async () => {
    const wallet = await getWallet();
    const { URL } = state.account.currentNetwork;
    let provider = ethers.getDefaultProvider(URL);
    const { abi } = erbAbi;
    const contractAddress = state.account.contractAddress
    if (!contractAddress) {
      return Promise.reject("error contractAddress cant't be null")
    }
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const contractWithSigner = contract.connect(wallet);
    return Promise.resolve(contractWithSigner);
  };

  const resetData = () => {
    showExchange1.value = false;
    showCreateExchange.value = false;
    showExchange.value = false;
    currentRate.value = 0;
    ready.value = false;
    speed.value = 4;
    rate.value = 0;
  };

  // 发送一键开交易所交易
  const sendTo = async (name: string, amount: number, amount2: number,fee_rate:number) => {
    const wallet = await getWallet();
    const { address } = wallet;
    try {
      rate.value = 60;
      // 发送开设交易所的费用 100ERB 至官方公司账户  连公司自己的节点
      const baseName = encode(name);
      const str = `wormholes:{"version": "0","type": 11,"fee_rate": ${fee_rate},"name":"${baseName}","url":"www.wormhlesexchanger.com"}`;
      console.warn("exchanger-name----------------", str);
      const data3 = toHex(str);
      console.warn("exchanger-name2----------------", data3);
      const tx1 = {
        from:address,
        to: address,
        value: ethers.utils.parseEther(amount + ""),
        data: `0x${data3}`,
      };

      wallet.sendTransaction(tx1).then((receipt: any) => {
        const { hash } = receipt;
        localStorage.setItem("tx1", JSON.stringify(receipt));
        if (Number(amount2) == 0) {
          $tradeConfirm.update({
            status:"approve"
          })
        }
        wallet.provider.waitForTransaction(hash).then(async (receipt2: any) => {
          const { status } = receipt2;
          const symbol = state.account.currentNetwork.currencySymbol
          const rep: TransactionReceipt = handleGetTranactionReceipt(
            TransactionTypes.default,
            receipt2,
            receipt,
            symbol
          );
          dispatch("account/updateAllBalance");
          commit("account/PUSH_TRANSACTION", rep);
          localStorage.setItem("receipt1", JSON.stringify(receipt2));
          if (status == 0) {
            Toast(i18n.global.t("userexchange.transferfailed"));
            return false;
          }
          if (Number(amount2) != 0) {
            // 发送第二笔
            send2(amount2, name);
          } else {
            speed.value = 100;
            rate.value = 100;
            ready.value = true;
            if(receipt2.status == 1){
              $tradeConfirm.update({
                status:"success",
                callBack(){
                  router.replace({name:"createExchangeSuccess",query:{firstTime:"true"}})
                },
              })
            } else {
              $tradeConfirm.update({
                status:"fail",
                failBack(){
                  
                }
              })
            }
          }
        });
      });
    } catch (err: any) {
      Toast(err.reason);
      $tradeConfirm.update({
        status:"fail",
        failBack(){
                  
        }
      })
      resetData();
    }
  };

   // Miner pledge
   const sendToPledge = async (name: string, amount: number, isServer: boolean) => {
    // const wallet = await getWallet();
    // const { address } = wallet;
    const wallet = await getWallet()
    const gasPrice = await wallet.provider.getGasPrice()
    try {
      rate.value = 60;
      const str = `wormholes:{"type":9,"version":"v0.0.1"}`
      const data3 = toHex(str);
      const tx1 = {
        from: wallet.address,
        to: "0x7fBC8ad616177c6519228FCa4a7D9EC7d1804900",
        value: ethers.utils.parseEther(amount + ''),
        data: `0x${data3}`,
      };

      wallet.sendTransaction(tx1).then((receipt: any) => {
        const { hash } = receipt;
        localStorage.setItem('tx1', JSON.stringify(receipt))
        wallet.provider
        .waitForTransaction(hash).then(async (receipt2:any) => {
          const { status } = receipt2
          localStorage.setItem('receipt1', JSON.stringify(receipt2))
          if(status == 0){
            Toast(i18n.global.t('userexchange.transferfailed'))
            return false
          }
          // send second
          if (isServer) {
            send2(200,name)
          } else {
            currentRate.value = 100
          }
        })
      }).catch((err: any) => {
        Toast(err.reason);
        resetData();

      });
    } catch (err: any) {
    }
  };
  /**
   * 授权一键交易所
   * @returns
   */
  const authExchange = async () => {
    const wallet = await getWallet();
    const number = await wallet.provider.getBlockNumber();
    const block_number = utils.hexlify(number + 6307200);
    const { address } = wallet;
    const d: any = await getSysParams(address);
    const { exchangeraddr } = d.data;
    const newParams = {
      exchanger_owner: address,
      to: exchangeraddr,
      block_number,
    };
    const str = `${address}${exchangeraddr}${block_number}`;
    const newstr = hashMessage(str);
    return new Promise(async (resolve, reject) => {
      const sigstr = await signParams(newstr)
      setExchangeSig(wallet.address, { ...newParams, sig: sigstr })
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  // 查询交易所状态
  /**
   *
   * @returns
   * exchanger_flag bool == true 成功 第一笔  交易所质押金额（最小100，最大账户余额）
   * status number == 2 成功 第二笔  托管服务费  固定200
   *
   */
  const exchangeStatus = async () => {
    try {
      let wallet = await getWallet();
      const status = await checkAuth(wallet.address);
      return Promise.resolve(status.data);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * 一键开交易所
   * @param name 交易所名称
   * @param amount 第一笔交易金额
   * @param amount2 第二笔交易金额
   */
  const createExchanges = async (
    name: string,
    amount: number,
    amount2: number,
    fee_rate: number
  ) => {
    console.log('name',name)
    console.log('amount',amount)
    console.log('amount2',amount2)
    console.log('fee_rate',fee_rate)
    const exchangeStatus: ExchangeStatus = state.account.exchangeStatus;
    const { exchanger_flag } = exchangeStatus;
    if (!exchanger_flag) {
      $tradeConfirm.open({
        approveMessage: i18n.global.t('createExchange.create_approve'),
        successMessage: i18n.global.t('createExchange.create_waiting'),
        wattingMessage: i18n.global.t('createExchange.create_success'),
        failMessage: i18n.global.t('createExchange.create_wrong')
      })
      
      sendTo(name, amount, amount2, fee_rate);
    } else {
      Toast(i18n.global.t('createExchange.alreadyopenedanexchange'));
    }
  };

  /**
   * 关闭交易所
   */
  const closeExchanges = async () => {
    const wallet = await getWallet();
    const { address } = wallet;
    const str = `wormholes:{"version":"0.0.1","type":12}`;
    const data3 = toHex(str);
    const tx1 = {
      from: address,
      to: address,
      value: ethers.utils.parseEther("0"),
      data: `0x${data3}`,
    };
    return new Promise((resolve, reject) => {
      wallet
        .sendTransaction(tx1)
        .then((receipt: any) => {
          const { hash } = receipt;
          localStorage.setItem("close-exchange-tx", JSON.stringify(receipt));
          wallet.provider
            .waitForTransaction(hash)
            .then(async (receipt2: any) => {
              const symbol = state.account.currentNetwork.currencySymbol
              const rep: TransactionReceipt = handleGetTranactionReceipt(
                TransactionTypes.contract,
                receipt2,
                receipt,
                symbol
              );
              dispatch("account/updateAllBalance");
              commit("account/PUSH_TRANSACTION", rep);
              resolve(receipt2);
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  // 修改托管服务费/质押金额
  const modifExchangeBalance = async (
    amount: number,
    amount2: number,
    name,
    callBack = () => { }
  ) => {
    const wallet = await getWallet();
    const { address } = wallet;
    // 追加质押金额
    const str = `wormholes:{"version": "0.0.1","type": 21}`;
    const data3 = toHex(str);
    const tx1 = {
      from: address,
      to: address,
      value: ethers.utils.parseEther(amount + ""),
      data: `0x${data3}`,
    };

    // 发送第一笔质押金额
    try {
      const data1 = await wallet.sendTransaction(tx1);
      localStorage.setItem("data1", JSON.stringify(data1));
      const receipt1 = await wallet.provider.waitForTransaction(data1.hash);
      const symbol = state.account.currentNetwork.currencySymbol
      const rep: TransactionReceipt = handleGetTranactionReceipt(
        TransactionTypes.contract,
        receipt1,
        data1,
        symbol
      );
      dispatch("account/updateAllBalance");
      commit("account/PUSH_TRANSACTION", rep);
      localStorage.setItem("tx1", JSON.stringify(receipt1));
    } catch (err) {
      return Promise.reject(err);
    }

    // 如果托管服务费不等于0
    const exchangeStatus: ExchangeStatus = state.account.exchangeStatus;
    // 发送第二笔托管服务费
    if (amount2 > 0 && exchangeStatus.status != 2) {
      try {
        await send2(amount2, name, callBack);
      } catch (err) {
        return Promise.reject(err);
      }
    } else {
      // 如果不发送第二笔，直接cakkback
      callBack();
    }

    return Promise.resolve();
  };

  // 发送授权信息
  const sendAuthData = async (address: string) => {
    try {
      const d: any = await getSysParams(address);
      const data = await authExchange();
    } catch (err) {

    }
  }

  // 两笔交易都成功的时候，查询交易所是否生成成功,如果没有继续走后面的流程
  const initExchangeData = async () => {
    const wallet = await getWallet()
    const { address } = wallet
    const res = await wallet.provider.send('eth_getAccountInfo', [address, "latest"])
    const { ExchangerName, BlockNumber } = res
    let exchange_name = decode(ExchangerName);
    try {
      // 如果交易所没有部署成功，重新部署
      const insdata = await is_install(address)
      if (insdata.code == 'false') {
        // 交易所没有部署成功，重新部署，和签名给后台
        const params = await generateSign(exchange_name);
        // 发送数据开交易所
        const sendData = {
          address,
          params: `'${JSON.stringify(params)}'`,
        };
        // 发送给一键交易所接口
        const val: any = await createExchange(sendData);
        if (val.code == "true") {
          let time = setTimeout(async () => {
            sendAuthData(address)
            clearTimeout(time);
          }, 10000);
          return
        }
      } else {
        // 查询 setExchangeSig 是否发成功,没有的话重新发
        const data = await getExchangeSig(address)
        if (!data.data) {
          sendAuthData(address)
        }
      }




    } catch (err) {
      console.error(err)
    }

  }
  return {
    createExchanges,
    showCreateExchange,
    showExchange,
    showExchange1,
    currentRate,
    rate,
    exchangeUrl,
    adminUrl,
    ready,
    speed,
    generateSign,
    exchangeStatus,
    closeExchanges,
    modifExchangeBalance,
    initExchangeData,
    sendToPledge
  };
};

export function toHex(str: string) {
  if (str === "") return "";
  var hexCharCode = [];
  for (var i = 0; i < str.length; i++) {
    hexCharCode.push(str.charCodeAt(i).toString(16));
  }
  return hexCharCode.join("");
}


// sign
export async function signParams(sstr: string) {
  try {
    const wallet = await getWallet()
    let sig = ''
    sig = ethers.utils.joinSignature(new ethers.utils.SigningKey(wallet.privateKey).signDigest(sstr))
    return Promise.resolve(sig)
  } catch (err) {
    return Promise.reject(err)
  }
}