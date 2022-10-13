import { getWallet } from './common.js'
import { localforage } from './localforage.js'
export const useGetTxReceipt = () => {
  async function waitTxQueueResponse() {
    const wallet = await getWallet()
    const list = await localforage.getItem('txQueue')
    const txQueue = list && list.length ? list : []
    if (!txQueue.length) {
      return Promise.resolve()
    }
    try {
      for await (const iterator of txQueue) {
        const { network, hash, txType } = iterator
        const data1 = await wallet.provider.waitForTransaction(hash);
        const rep = handleGetTranactionReceipt(
          txType,
          data1,
          iterator,
          network
        );
        DEL_TXQUEUE({ ...iterator });
        PUSH_TRANSACTION({ ...rep });
      }
      return Promise.resolve()
    } catch (err) {
      console.log(err)
      return Promise.reject(err)
    }
  }

  // Delete data from a queue
  async function DEL_TXQUEUE(tx) {
    const list = await localforage.getItem('txQueue')
    const txQueue = list && list.length ? list : []
    const newList = txQueue.filter(item => item.hash.toUpperCase() != tx.hash.toUpperCase())
    await localforage.setItem('txQueue', newList)

  }


  async function PUSH_TRANSACTION(value) {
    const { to, from, tokenAddress, network } = value;
    const txNetwork = { ...network };
    const { id, currencySymbol } = txNetwork
    const formAdd = from.toUpperCase();
    const txListKey = `txlist-${id}`
    let txList = await localforage.getItem(txListKey)
    if (txList && typeof txList == 'object') {
      const receipt = { ...value, symbol: currencySymbol }
      delete receipt.network
      if (txList[formAdd] && txList[formAdd].length) {
        const hasHash = txList[formAdd].find(tx => tx.hash.toUpperCase() == value.hash.toUpperCase())
        !hasHash ? txList[formAdd].unshift(clone(receipt)) : ''
      } else {
        txList[formAdd] = [clone(receipt)]
      }
    } else {
      const receipt = { ...value, symbol: currencySymbol }
      delete receipt.network
      txList = {
        [formAdd]: [clone(receipt)]
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
  const { from, to, value, nonce, hash } = tx;
  const { gasUsed, status, effectiveGasPrice, type } = receipt;
  const date = new Date();
  let newType = txType;
  // If it is a contract transaction and to is 0xFFFFFF, rewrite to swap type
  if (
    txType == 'contract' &&
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