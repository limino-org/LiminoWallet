import { ethers } from './ethers.js'
import { getWallet, toHex } from './common.js'
import { localforage } from './localforage.js'
import BigNumber from './bignumber.js'
export const useGetTxReceipt = () => {
  async function waitTxQueueResponse() {
    const local = await localforage.getItem("vuex") || null
    const { id, chainId } = local.account.currentNetwork
    const { address } = local.account.accountInfo
    const queuekey = `txQueue-${id}-${chainId}-${address.toUpperCase()}`
    return new Promise(async(resolve, reject) => {
        const list  = await localforage.getItem(queuekey)
        const txQueue = list && list.length ? list : []
        if (!txQueue.length) {
          resolve(true)
        }
        try {
          const newWallet = await getWallet()
          for await (const iterator of txQueue) {
            let {hash, transitionType, nft_address, blockNumber, network, txType} = iterator
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

            const rep = handleGetTranactionReceipt(
              txType || 'other',
              data1,
              {...iterator, convertAmount},
              network
            );
            DEL_TXQUEUE({ ...iterator });
            PUSH_TRANSACTION({ ...rep });
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
    const {network:{id}} = tx
    const queueKey = `txQueue-${id}`
    const list = await localforage.getItem(queueKey)
    const txQueue = list && list.length ? list : []
    const newList = txQueue.filter((item) => item.hash.toUpperCase() != tx.hash.toUpperCase())
    await localforage.setItem(queueKey, newList)

  }


  async function PUSH_TRANSACTION(value) {
    const { from, network } = value;
      const txNetwork = {...network};
      const {id, currencySymbol} = txNetwork
      const formAdd = from.toUpperCase();
      const txListKey = `txlist-${id}`
      let txList = await localforage.getItem(txListKey)
      if(txList && typeof txList == 'object') {
        const receipt = {...value,symbol:currencySymbol}
        if(txList[formAdd] && txList[formAdd].length) {
          const hasHash = txList[formAdd].find((tx) => tx.hash.toUpperCase() == value.hash.toUpperCase())
          !hasHash ? txList[formAdd].unshift(clone(receipt)) : ''
        } else {
          txList[formAdd] = [clone(receipt)]
        }
      } else {
        const receipt = {...value,symbol:currencySymbol}
        txList = {
          [formAdd]:[clone(receipt)]
        }
      }
      DEL_TXQUEUE(value)
      // save txlist
      localforage.setItem(txListKey, clone(txList))
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