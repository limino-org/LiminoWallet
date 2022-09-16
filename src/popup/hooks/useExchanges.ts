import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { Toast } from "vant";
import { computed, onMounted, ref, Ref, watch } from "vue";
import { ethers } from "ethers";
import { ExchangeStatus, getWallet, TransactionReceipt, handleGetTranactionReceipt, TransactionTypes } from "@/popup/store/modules/account";
import { hashMessage } from "@/popup/utils/ether";
import { useSign } from "@/popup/views/sign/hooks/sign";
import { web3 } from "@/popup/utils/web3";
import { encode, decode } from 'js-base64';

import {
  createExchange,
  getSysParams,
  getExchangeSig,
  checkAuth,
  setExchangeSig,
  is_install
} from "@/popup/http/modules/common";
const erbAbi = require("@/popup/assets/json/erbAbi.json");
import { useTradeConfirm } from "@/popup/plugins/tradeConfirmationsModal";
import router from "@/popup/router";
import { useI18n } from "vue-i18n";
import { utils } from "ethers";
import i18n from "@/popup/language/index";
import store from "@/popup/store";
import BigNumber from "bignumber.js";
import { TradeStatus } from "@/popup/plugins/tradeConfirmationsModal/tradeConfirm";


// 一键交易所
export const useExchanges = () => {
  const { $tradeConfirm } = useTradeConfirm()
  // 是否展示一键交易所的弹层
  const showCreateExchange: Ref<boolean> = ref(false);
  // 展示第二页的弹层
  const showExchange: Ref<boolean> = ref(false);
  // 展示第三页的弹层
  const showExchange1: Ref<boolean> = ref(false);


  // 交易所链接
  const exchangeUrl: Ref<string> = ref("");
  // 后台链接
  const adminUrl: Ref<string> = ref("");
  // 创建交易所成功的状态
  const ready: Ref<boolean> = ref(false);

  const { dispatch, state, commit, getters } = useStore();
  const { toSign, sign } = useSign();

  const sendTx2 = async (amount: any, callBack?: Function) => {
   try {
    const wallet = await getWallet()
    const contractWithSigner = await getContract();
    const { address } = wallet
    const data = await contractWithSigner.functions.payForRenew({
      value: ethers.utils.parseEther(amount + ''),
    });
    callBack ? callBack() : "";
    localStorage.setItem('tx2', JSON.stringify(data))
    // debugger
    console.log("一键交易所", data);
    $tradeConfirm.update({ status: "approve" })
    const receipt = await wallet.provider.waitForTransaction(data.hash)
    localStorage.setItem('receipt2', JSON.stringify(receipt))
    const symbol = state.account.currentNetwork.currencySymbol
    const rep: TransactionReceipt = handleGetTranactionReceipt(
      TransactionTypes.contract,
      receipt,
      data,
      symbol
    );
    const { status } = receipt;
    if (status == 0) {
      $tradeConfirm.update({ status: "fail" })
      resetData();
      Toast(i18n.global.t("userexchange.transactionfailed"));
      return Promise.reject()
    }
    dispatch("account/updateAllBalance");
    commit("account/PUSH_TRANSACTION", rep);
    return Promise.resolve(receipt)
   }catch(err){
    $tradeConfirm.update({ status: "fail" })
    console.log(err)
    console.log("==========err2=============")
    Toast(err.toString());
    resetData();
    return Promise.reject()
   }
  }

  // 第二笔交易
  const send2 = async (amount: number = 200, exchange_name: string, callBack = () => { }, isDialog = true) => {
    if(isDialog) {
      $tradeConfirm.open({
        approveMessage: i18n.global.t('createExchange.create_approve'),
        successMessage: i18n.global.t('createExchange.create_waiting'),
        wattingMessage: i18n.global.t('createExchange.create_success'),
        failMessage: i18n.global.t('createExchange.create_wrong'),
        callBack: () => { router.replace({ name: "exchange-management" }) },
        failBack: () => { router.replace({ name: "exchange-management" }) }
      })
    }

    const wallet = await getWallet()
    const {address} = wallet
    try {
      const receipt = await sendTx2(amount)
      const { status } = receipt;
      if (status == 0) {
        $tradeConfirm.update({ status: "fail" })
        resetData();
        Toast(i18n.global.t("userexchange.transactionfailed"));
        return;
      }
      const params = await generateSign(exchange_name);
      // 发送数据开交易所
      const sendData = {
        address,
        params: `'${JSON.stringify(params)}'`,
      };
      console.log(sendData)
      // 发送给一键交易所接口
      const val: any = await createExchange(sendData);
      if (val.code == "true") {
        let time = setTimeout(async () => {
          try {
            const data = await authExchange();
            ready.value = true;
            $tradeConfirm.update({ status: "success" })
            callBack ? callBack() : "";
          } catch (err: any) {
            $tradeConfirm.update({ status: "fail" })
            resetData();
          }
          clearTimeout(time);
        }, 8000);
      } else {
        resetData();
        $tradeConfirm.update({ status: "fail" })
        return;
      }
    } catch (err) {
      $tradeConfirm.update({ status: "fail" })
      resetData();
    }
  }

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
    return new Promise((resolve, reject) => {
      toSign({
        sig: newstr,
        address: wallet.address,
        call: async (sigstr: string) => {
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
        },
      });
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
      throw new Error("error contractAddress cant't be null")
    }
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const contractWithSigner = contract.connect(wallet);
    return contractWithSigner
  };



  const resetData = () => {
    showExchange1.value = false;
    showCreateExchange.value = false;
    showExchange.value = false;
    ready.value = false;

  };

  // 发送一键开交易所交易
  const sendTo = async (name: string, amount: number, isServer: boolean, fee_rate?: number) => {
    const wallet = await getWallet();
    const exchangeStatus: ExchangeStatus = state.account.exchangeStatus
    const {
      status: newStatus,
      exchanger_flag
    } = exchangeStatus
    const { address } = wallet;
    const baseName = encode(name);
    try {
      const rate_str: number = fee_rate? new BigNumber(fee_rate).multipliedBy(10).toNumber() : 100
      // 发送开设交易所的费用 100ERB 至官方公司账户  连公司自己的节点
      const str = `wormholes:{"version": "0","type": 11,"fee_rate": ${rate_str},"name":"${baseName}","url":""}`;
      // const str = `wormholes:{"type":"9", "proxy_address":"0x591813F0D13CE48f0E29081200a96565f466B212", "version":"0.0.1"}`
      const data3 = toHex(str);
      const tx1 = {
        from: address,
        to: address,
        value: ethers.utils.parseEther(amount + ''),
        data: `0x${data3}`,
      };
      // debugger
      wallet.sendTransaction(tx1).then((receipt: any) => {
        const { hash } = receipt;
        localStorage.setItem('tx1', JSON.stringify(receipt))
        if(!isServer){
          $tradeConfirm.update({status:"approve"})
        }
        wallet.provider
          .waitForTransaction(hash).then(async (receipt2: any) => {
            const { status } = receipt2
            localStorage.setItem('receipt1', JSON.stringify(receipt2))
            const symbol = state.account.currentNetwork.currencySymbol
            const rep: TransactionReceipt = handleGetTranactionReceipt(
              TransactionTypes.default,
              receipt2,
              receipt,
              symbol
            );
            commit("account/PUSH_TRANSACTION", rep);
            if(!isServer) {
              if(status == 0) {
                $tradeConfirm.update({status:"fail"})
              } else {
                $tradeConfirm.update({status:"success",callBack(){router.replace({name:"exchange-management"})}})
              }
            }
            // 发送第二笔
            if (isServer) {
              if(!exchanger_flag && newStatus == 2){
                $tradeConfirm.update({status:"success",callBack(){router.replace({name:"exchange-management"})}})
                return
              }
              send2(200, name)
            }
          })

      }).catch((err: any) => {
        Toast(err.reason);
        if(!isServer){
          $tradeConfirm.update({status:"fail"})
        }
        resetData();

      });
    } catch (err: any) {
      if(!isServer){
        $tradeConfirm.update({status:"fail"})
      }
    }
  };

  // 矿工质押
  const sendToPledge = async (amount: number, proxy_address?: string) => {
    // const wallet = await getWallet();
    const wallet = await getWallet()
    const { address } = wallet;
    // const gasPrice = await wallet.provider.getGasPrice()
    $tradeConfirm.open({
      approveMessage: i18n.global.t('minerspledge.create_approve'),
      successMessage: i18n.global.t('minerspledge.create_waiting'),
      wattingMessage: i18n.global.t('minerspledge.create_success'),
      failMessage: i18n.global.t('minerspledge.create_wrong')
    })

    try {
      if (proxy_address) {
        const sigstr = `${proxy_address}${address}`
        debugger
        // 代理质押
        await toSign({
          address: proxy_address,
          sig: sigstr,
          isAdmin: false,
          call: (sign: string) => {
            debugger
            sendPledge(amount, proxy_address, sign)
          }
        })

        return
      }
      // 普通质押
      sendPledge(amount, '', '')
    } catch (err: any) {
      console.error(err)
      $tradeConfirm.update({ status: "fail" })
    }
  };


  const sendPledge = async (amount: number, proxy_address: string, proxy_sign: string) => {
    try {
      const wallet = await getWallet()
      const { address } = wallet
      const str = `wormholes:{"type":9,"proxy_address":"${proxy_address}","proxy_sign":"${proxy_sign}","version":"v0.0.1"}`
      console.warn('str', str)
      const data3 = toHex(str);
      const tx1 = {
        to: address,
        value: ethers.utils.parseEther(amount + ''),
        data: `0x${data3}`,
      };
      console.warn('tx1', tx1)
      console.warn('amount', amount)


      const receipt: any = await wallet.sendTransaction(tx1)
      localStorage.setItem('质押tx', JSON.stringify(receipt))

      $tradeConfirm.update({ status: "approve" })
      const { hash } = receipt;
      const receipt2 = await wallet.provider.waitForTransaction(hash)
      localStorage.setItem('质押收据', JSON.stringify(receipt2))

      const symbol = state.account.currentNetwork.currencySymbol
      const rep: TransactionReceipt = handleGetTranactionReceipt(
        TransactionTypes.default,
        receipt2,
        receipt,
        symbol
      );
      commit("account/PUSH_TRANSACTION", rep);
      console.log("我确实发送了");
      const { status } = receipt2
      localStorage.setItem('receipt1', JSON.stringify(receipt2))
      if (status == 0) {
        $tradeConfirm.update({ status: "fail" })
        Toast(i18n.global.t('userexchange.transferfailed'))
        return false
      } else {
        localStorage.setItem('质押receipt', JSON.stringify(receipt2))
        $tradeConfirm.update({
          status: "success", callBack() {
            router.replace({ name: "wallet" })
          }
        })
      }
    } catch (err) {
      $tradeConfirm.update({ status: "fail" })
      console.error(err)
    }
  }

  /**
   * 授权一键交易所
   * @/popupreturns
   */
  const authExchange = async () => {
    const wallet = await getWallet();
    const number = await wallet.provider.getBlockNumber();
    const block_number = utils.hexlify((number) + 6307200);
    const { address } = wallet;
    // 等三十秒再往下跑
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 30000)
    })
    const d: any = await getSysParams(address);
    const { exchangeraddr } = d.data;
    const newParams = {
      exchanger_owner: address,
      to: exchangeraddr,
      block_number,
    };
    const str = `${address}${exchangeraddr}${block_number}`;
    const newstr = hashMessage(str);
    return new Promise((resolve, reject) => {
      //@/popupts-ignore
      toSign({
        sig: newstr,
        address: wallet.address,
        call: async (sigstr: string) => {
          const params = { ...newParams, sig: sigstr }
          sessionStorage.setItem('params', JSON.stringify(params))
          setExchangeSig(wallet.address, params)
            .then((res) => {
              resolve(res);
            })
            .catch((err) => {
              reject(err);
            });
        },
      });
    });
  };

  // 查询交易所状态
  /**
   *
   * @/popupreturns 
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

  // 一键开交易所
  const createExchanges = async (name: string, amount: number,  fee_rate?: number) => {
    const exchangeStatus: ExchangeStatus = state.account.exchangeStatus
    const {
      status,
      exchanger_flag
    } = exchangeStatus
    console.log(status)
    console.log(exchanger_flag)
    // debugger
    // 两笔没交
    if ((status != 2 && exchanger_flag == false) || (!exchanger_flag && status == 2)) {
      $tradeConfirm.open({
        approveMessage: i18n.global.t('createExchange.create_approve'),
        successMessage: i18n.global.t('createExchange.create_waiting'),
        wattingMessage: i18n.global.t('createExchange.create_success'),
        failMessage: i18n.global.t('createExchange.create_wrong')
      })
      sendTo(name, amount, true, fee_rate);
      return
    }
    // 第一笔交了，第二笔没交
    if (exchanger_flag == true && status != 2) {
      $tradeConfirm.open({
        approveMessage: i18n.global.t('createExchange.create_approve'),
        successMessage: i18n.global.t('createExchange.create_waiting'),
        wattingMessage: i18n.global.t('createExchange.create_success'),
        failMessage: i18n.global.t('createExchange.create_wrong')
      })
      send2(200, name)
    }
    if (!exchanger_flag && status == 2) {
      sendTo(name, amount, false, fee_rate);
    }
  };

  const closeExchanges = async () => {
    $tradeConfirm.open({
      approveMessage: i18n.global.t('minerspledge.close_approve'),
      successMessage: i18n.global.t('minerspledge.close_waiting'),
      wattingMessage: i18n.global.t('minerspledge.close_success'),
      failMessage: i18n.global.t('minerspledge.close_wrong')
    })
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
          $tradeConfirm.update({ status: "approve" })
          const { hash } = receipt;
          localStorage.setItem("close-exchange-tx", JSON.stringify(receipt));
          wallet.provider
            .waitForTransaction(hash)
            .then(async (receipt2: any) => {
              const symbol = state.account.currentNetwork.currencySymbol
              const rep: TransactionReceipt = handleGetTranactionReceipt(
                TransactionTypes.default,
                receipt2,
                receipt,
                symbol
              );
              commit("account/PUSH_TRANSACTION", rep);
              await dispatch("account/getExchangeStatus");
              resolve(receipt2);
              const { status } = receipt2
              if (status == 0) {
                $tradeConfirm.update({ status: "fail" })
              } else {
                $tradeConfirm.update({ status: "success", callBack() { router.replace({ name: "wallet" }) } })
              }
            }).catch((err: any) => {
              $tradeConfirm.update({ status: "fail" })
            });
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  };

  // 发送授权信息
  const sendAuthData = async (address: string) => {
    try {
      const d: any = await getSysParams(address);
      const data = await authExchange();
    } catch (err) {

    }
  };

  // 两笔交易都成功的时候，查询交易所是否生成成功,如果没有继续走后面的流程
  const initExchangeData = async () => {
    const wallet = await getWallet()
    const { address } = wallet
    const res = await wallet.provider.send('eth_getAccountInfo', [address, "latest"])
    const { ExchangerName, BlockNumber } = res
    let exchange_name = decode(ExchangerName);
    try {
      // 如果交易所没有部署成功，重新部署
      const res = await is_install(address)
      // 查询 setExchangeSig 是否发成功,没有的话重新发
      const data = await getExchangeSig(address)
      if (res.data && !data.data) {
        sendAuthData(address)
      }
    } catch (err) {
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
      }
    }

  }

  // 修改托管服务费/质押金额
  const modifExchangeBalance = async (
    name: string,
    callBack = () => { }
  ) => {
    // 发送第二笔托管服务费
    try {
      await send2(200, name);
    } catch (err) {
      return Promise.reject(err);
    }
    return Promise.resolve();
  };




  // 追加质押金额
  const addExchangeBalance = async (
    amount: number,
  ) => {
    debugger
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
    $tradeConfirm.open({
      callBack: () => {
        router.replace({ name: 'wallet' })
      },
      failBack: () => {
        router.replace({ name: 'wallet' })
      }
    })
    // 发送第一笔质押金额
    try {
      const data1 = await wallet.sendTransaction(tx1);
      $tradeConfirm.update({ status: TradeStatus.approve })
      localStorage.setItem("data1", JSON.stringify(data1));
      const receipt1 = await wallet.provider.waitForTransaction(data1.hash);
      const symbol = state.account.currentNetwork.currencySymbol
      const rep: TransactionReceipt = handleGetTranactionReceipt(
        TransactionTypes.default,
        receipt1,
        data1,
        symbol
      );
      dispatch("account/updateAllBalance");
      commit("account/PUSH_TRANSACTION", rep);
      $tradeConfirm.update({ status: TradeStatus.success })
      localStorage.setItem("tx1", JSON.stringify(receipt1));
    } catch (err) {
      $tradeConfirm.update({ status: TradeStatus.fail })
      return Promise.reject(err);
    }
    return Promise.resolve();
  };

  // 减少质押金额
  const miunsExchangeBalance = async (amount: number) => {
    const wallet = await getWallet();
    const { address } = wallet;
    const str = `wormholes:{"type":22,"version":"v0.0.1"}`;
    const data3 = toHex(str);
    const tx1 = {
      from: address,
      to: address,
      value: ethers.utils.parseEther(amount + ""),
      data: `0x${data3}`,
    };
    $tradeConfirm.open({
      callBack: () => {
        router.replace({ name: 'wallet' })
      },
      failBack: () => {
        router.replace({ name: 'wallet' })
      }
    })
    try {
      const data1 = await wallet.sendTransaction(tx1);
      $tradeConfirm.update({ status: TradeStatus.approve })
      localStorage.setItem("data1", JSON.stringify(data1));
      const receipt1 = await wallet.provider.waitForTransaction(data1.hash);
      $tradeConfirm.update({ status: TradeStatus.success })
      const symbol = state.account.currentNetwork.currencySymbol
      const rep: TransactionReceipt = handleGetTranactionReceipt(
        TransactionTypes.default,
        receipt1,
        data1,
        symbol
      );
      dispatch("account/updateAllBalance");
      commit("account/PUSH_TRANSACTION", rep);
      localStorage.setItem("tx1", JSON.stringify(receipt1));
    } catch (err) {
      $tradeConfirm.update({ status: TradeStatus.fail })
      return Promise.reject(err);
    }
  }
  return {
    createExchanges,
    showCreateExchange,
    showExchange,
    showExchange1,
    exchangeUrl,
    adminUrl,
    ready,
    generateSign,
    exchangeStatus,
    close,
    closeExchanges,
    sendTo,
    sendToPledge,
    initExchangeData,
    modifExchangeBalance,
    addExchangeBalance,
    miunsExchangeBalance,
    send2,
    sendTx2,
    getContract
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
