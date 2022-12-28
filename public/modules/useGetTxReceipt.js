import { ethers } from './ethers.js'
import { getWallet, toHex } from './common.js'
import { localforage } from './localforage.js'
import BigNumber from './bignumber.js'
export const useGetTxReceipt = () => {
  async function waitTxQueueResponse() {
    
    const local = await localforage.getItem("vuex") || null
    const { id } = local.account.currentNetwork
    const from = local.account.accountInfo.address
    const queuekey = `txQueue-${id}-${from.toUpperCase()}`
    return new Promise(async(resolve, reject) => {
        const list  = await localforage.getItem(queuekey)
        const txQueue = list && list.length ? list : []
        if (!txQueue.length) {
          resolve(true)
        }
        try {
          const newWallet = await getWallet()
          for await (const iterator of txQueue) {
            let {hash, transitionType, nft_address, blockNumber, network, txType, txId, sendData} = iterator
            const data1 = await newWallet.provider.waitForTransaction(hash);
            let convertAmount = ''
            if(nft_address) {
              if(transitionType && transitionType == '6') {
                const len = nft_address.length
                switch(len) {
                  case 42:
                    break;
                  case 41:
                    nft_address += '0'
                    break;
                  case 40:
                    nft_address += '00'
                    break;
                  case 39:
                    nft_address += '000'
                    break;
                }
                
                const blocknum = ethers.utils.hexValue(data1.blockNumber - 1)
                const nftAccountInfo = await newWallet.provider.send(
                  "eth_getAccountInfo",
                  [nft_address,  blocknum]
                );
                const {MergeLevel, MergeNumber} = nftAccountInfo
                if(MergeLevel === 0) {
                  convertAmount = new BigNumber(MergeNumber).multipliedBy(0.03).toNumber()
                }else if(MergeLevel === 1) {
                  convertAmount = new BigNumber(MergeNumber).multipliedBy(0.143).toNumber()
                } else if(MergeLevel === 2) {
                  convertAmount = new BigNumber(MergeNumber).multipliedBy(0.271).toNumber()
                } else if(MergeLevel === 3) {
                  convertAmount = new BigNumber(MergeNumber).multipliedBy(0.65).toNumber()
                }
              }
            }
            DEL_TXQUEUE({ ...iterator,txId });
            UPDATE_TRANSACTION({ ...iterator,txId, receipt: data1,sendData:{...sendData,convertAmount} });
          }
          resolve(true)
        } catch (err) {
          console.error(err)
          reject(err)
        }
    })
  }

  // Delete data from a queue
  async function DEL_TXQUEUE(tx) {
    const {network:{id}, txId, from} = tx
    const queueKey = `txQueue-${id}-${from.toUpperCase()}`
    const list = await localforage.getItem(queueKey)
    const txQueue = list && list.length ? list : []
    const newList = txQueue.filter((item) => item.txId.toUpperCase() != txId.toUpperCase())
    await localforage.setItem(queueKey, newList)

  }


  async function UPDATE_TRANSACTION(da) {
    console.warn('UPDATE_TRANSACTION----', da)
    const { receipt, sendData, txType, network, transitionType, type, data , value, gasPrice, gasLimit, txId, tokenAddress, amount, isCancel} = da
    const {hash, nonce, from, to } = sendData
    const { id, currencySymbol } = network
    const date = new Date()
    const newReceipt = clone({
      date,
      hash,
      from,
      gasLimit,
      gasPrice,
      nonce,
      to,
      type,
      value,
      transitionType: transitionType || null,
      txType,
      network: clone(network),
      data,
      sendStatus: receipt ? 'success': 'pendding',
      sendData: clone(sendData),
      receipt: clone(receipt),
      tokenAddress,
      amount,
      isCancel: isCancel || null,
      txId
    })
    const formAdd = from.toUpperCase();
    const txListKey = `txlist-${id}-${formAdd}`
    let txList= await localforage.getItem(txListKey)
    if(txList && txList.length) {
      if(txList && txList.length) {
        for(let i=0;i< txList.length;i++){
          const item = txList[i]
          if(item.txId === txId){
            txList[i] = newReceipt
          }
        }
      }
    }
    await localforage.setItem(txListKey, txList)
    DEL_TXQUEUE(da)
    // let time = setTimeout(() => {
    //   eventBus.emit('txUpdate', newReceipt)
    //   clearTimeout(time)
    // },0)
  }


  return {
    waitTxQueueResponse
  }
}


/**
 * Encapsulate transactions
 * @param txType Transaction type
 * @param receipt Data confirmed on the chain
 * @param tx Transaction return data
 * @returns
 */
 export function handleGetTranactionReceipt(
  txType,
  receipt,
  tx,
  network
) {
  const { from, to, value, nonce, hash, transitionType, nft_address, convertAmount } = tx;
  const { gasUsed, status, effectiveGasPrice, type, blockNumber } = receipt;
  const date = new Date();
  let newType = txType;
  // If it is a contract transaction and to is 0xFFFFFF, rewrite to swap type
  if (
    txType == 'contract' && to &&
    to.toUpperCase() ==
    "0xffffffffffffffffffffffffffffffffffffffff".toUpperCase()
  ) {
    newType = 'swap';
  }
  const rec = {
    txType: newType,
    type,
    status,
    from,
    to,
    value,
    date,
    nonce,
    gasUsed,
    hash,
    effectiveGasPrice,
    blockNumber,
    transitionType: transitionType || '',
    nft_address: nft_address || '',
    convertAmount: convertAmount || '',
    network
  };
  return rec;
}


function clone(obj) {
  if (obj && typeof obj == 'object') {
    return JSON.parse(JSON.stringify(obj));
  }
  return {}
}