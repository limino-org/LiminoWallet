import { ethers } from './ethers.js'
import { getProvider, getStore, getWallet, guid, openTabPopup, toHex } from './common.js'

import BigNumber from './bignumber.js'
import { getDB, getContactsList, getPenddingList, setMainTx, getMainTx, getTxList, saveTxList } from './db.js'
import { notices } from './notices.js'


export const  toTradeHistory = async (txid) => {
  const url = `chrome-extension://${chrome.runtime.id}/home.html#/settings/transaction-history?hash=${txid}&backUrl=home`
  chrome.tabs.create({ url: url })
}

export const useGetTxReceipt = (time = 300000) => {
  async function waitTxQueueResponse() {
    const store = await getStore()
    const from = store.account.accountInfo.address
    const currentNetwork = store.account.currentNetwork
    return new Promise(async (resolve, reject) => {
      const receiptList = []
      //  const newWallet = await getWallet()
      try {
        if (store.account.coinType.value == 0) {
          const list = await getPenddingList(from) || []
          console.warn('list--', list)
          const txQueue = list && list.length ? list : []
          if (!txQueue.length) {
            resolve([])
          }
          for await (const iterator of txQueue) {
            let { hash, transitionType, nft_address, blockNumber, network, txType, txId, amount, isCancel, sendData, date, value, nonce } = iterator
            const txList = await getTxList(from)
            let hashArr = []
            const sameNonceTx = txList.find((item) => item.nonce === nonce)
            hashArr = !sameNonceTx ? [hash] : [hash, sameNonceTx.hash]
            console.warn('222', iterator)
            const {list, wallet} = await waitForTransactions(hashArr, time)

            for await (const data1 of list) {
              console.log('wait..', receiptList)
              receiptList.push(data1)
              let convertAmount = ''
              // if (transitionType && transitionType == '6') {
              //   const len = nft_address.length
              //   switch (len) {
              //     case 42:
              //       break;
              //     case 41:
              //       nft_address += '0'
              //       break;
              //     case 40:
              //       nft_address += '00'
              //       break;
              //     case 39:
              //       nft_address += '000'
              //       break;
              //   }
              //   const nftAccountInfo = await wallet.provider.send(
              //     "eth_getAccountInfo",
              //     [nft_address, ethers.utils.hexValue((data1.blockNumber - 1))]
              //   );
              //   const { MergeLevel, MergeNumber } = nftAccountInfo
              //   //  @ts-ignore
              //   const { t0, t1, t2, t3 } = store.configuration.setting.conversion

              //   if (MergeLevel === 0) {
              //     convertAmount = new BigNumber(MergeNumber).multipliedBy(t0).toNumber()
              //   } else if (MergeLevel === 1) {
              //     convertAmount = new BigNumber(MergeNumber).multipliedBy(t1).toNumber()
              //   } else if (MergeLevel === 2) {
              //     convertAmount = new BigNumber(MergeNumber).multipliedBy(t2).toNumber()
              //   } else if (MergeLevel === 3) {
              //     convertAmount = new BigNumber(MergeNumber).multipliedBy(t3).toNumber()
              //   }
              // }
              await DEL_TXQUEUE({ ...iterator, txId, txType })
              console.warn('network', network)
              const newtx = {
                receipt: data1,
                network,
                sendData,
                txId,
                date,
                cointype: store.account.coinType,
                value
              }
              await PUSH_TRANSACTION({ ...newtx, txId: guid() })
            }
          }
        }
        if (store.account.coinType.value == 1) {
          const myAddr = store.account.accountInfo.address
          const { penddingTable } = await getDB(myAddr)
          const keys = await penddingTable.keys() || []

          for await (const iterator of keys) {
            const txId = iterator
            const { penddingTable } = await getDB(myAddr)
            const txInfo = await penddingTable.getItem(txId)
            // @ts-ignore
            const { value } = txInfo
            const hashArr = [txInfo.hash]
            console.warn('wait btc', iterator)
            const {list} = await waitForTransactions(hashArr, time)
            for await (const data1 of list) {
              await DELBTC_TXQUEUE({ ...txInfo, cointype: store.account.coinType })
              await PUSHBTC_TRANSACTION({ ...txInfo, ...data1, value, sendStatus: 'success', cointype: store.account.coinType })
              receiptList.push(data1)
            }

          }
        }

        resolve(receiptList)
      } catch (err) {
        reject(err)
      }

    })
  }

  // Delete data from a queue
  const DEL_TXQUEUE = async (tx) => {
    const { network: { id, type }, txId, from } = tx
    if (txId && from) {
      const { penddingTable } = await getDB(from, id, type)
      await penddingTable.removeItem(txId)
    }
    return tx
  }

  const PUSH_TRANSACTION = async (da) => {
    console.warn('push', da)
    const { receipt, sendData, network, txId, value, date, sendType, txType, network: { id, type } } = da
    const { convertAmount, nonce, data } = sendData
    const {
      blockHash,
      blockNumber,
      cumulativeGasUsed,
      effectiveGasPrice,
      gasUsed,
      transactionHash,
      from,
      to,
      contractAddress,
      transactionIndex,
      status,
    } = receipt
    /**
     * blockHash: "0x1482d2f2e879c9e02fe79469609d4e1c6ffed21c8b3cc09617df6b9228e81a08"
     * blockNumber:60454
     * contractAddress: null
        convertAmount: 0
        cumulativeGasUsed: 21000
        from: "0x612dfa56dca1f581ed34b9c60da86f1268ab6349"
        gas: 21000
        gasPrice: 1200000000
        gasUsed: 21000
        hash: "0xc3b29fb20ac5ff813a9371e7d6d2913e450d950759a06a1d71fd866a3960978a"
        input: "0x"
        nonce: 0
        status: 1
        timestamp: 1672376574
        to: "0x352deea28e6b15620c75acf0debe6aacbda965c9"
        transactionIndex: 0
        value: "230000000000000000"
     */
    const newReceipt = {
      blockHash,
      blockNumber,
      contractAddress,
      cumulativeGasUsed: ethers.utils.formatUnits(cumulativeGasUsed, 'wei'),
      from,
      gasPrice: ethers.utils.formatUnits(effectiveGasPrice, 'wei'),
      gasUsed: Number(ethers.utils.formatUnits(gasUsed, 'wei')),
      hash: transactionHash,
      nonce,
      to,
      input: data,
      transactionIndex,
      convertAmount,
      timestamp: Math.floor(new Date(date).getTime() / 1000),
      status,
      value: value ? ethers.utils.formatUnits(value, 'wei') : '0',
      txId,
      sendType,
      txType
    }
    // if (data) {
    //   const convertAmount = await getConverAmount(wallet, { input: data, blockNumber })
    //   newReceipt['convertAmount'] = convertAmount
    // }
    const { listTable } = await getDB(from, id, type)
    await listTable.setItem(txId, clone(newReceipt))
    return newReceipt
  }


  const UPDATE_TRANSACTION = async (da) => {
    const state = store.account
    const { receipt, sendData, network, txId, value, date } = da
    const { id, type } = network
    const { convertAmount, nonce, data } = sendData
    const {
      blockHash,
      blockNumber,
      cumulativeGasUsed,
      effectiveGasPrice,
      gasUsed,
      transactionHash,
      from,
      to,
      contractAddress,
      transactionIndex,
      status,
    } = receipt
    /**
     * blockHash: "0x1482d2f2e879c9e02fe79469609d4e1c6ffed21c8b3cc09617df6b9228e81a08"
     * blockNumber:60454
     * contractAddress: null
        convertAmount: 0
        cumulativeGasUsed: 21000
        from: "0x612dfa56dca1f581ed34b9c60da86f1268ab6349"
        gas: 21000
        gasPrice: 1200000000
        gasUsed: 21000
        hash: "0xc3b29fb20ac5ff813a9371e7d6d2913e450d950759a06a1d71fd866a3960978a"
        input: "0x"
        nonce: 0
        status: 1
        timestamp: 1672376574
        to: "0x352deea28e6b15620c75acf0debe6aacbda965c9"
        transactionIndex: 0
        value: "230000000000000000"
     */
    const newReceipt = {
      blockHash,
      blockNumber,
      contractAddress,
      cumulativeGasUsed: ethers.utils.formatUnits(cumulativeGasUsed, 'wei'),
      from,
      gasPrice: ethers.utils.formatUnits(effectiveGasPrice, 'wei'),
      gasUsed: Number(ethers.utils.formatUnits(gasUsed, 'wei')),
      hash: transactionHash,
      nonce,
      to,
      input: data,
      transactionIndex,
      convertAmount,
      timestamp: Math.floor(new Date(date).getTime() / 1000),
      status,
      value: value ? ethers.utils.formatUnits(value, 'wei') : '0',
      txId
    }
    if (data) {
      const convertAmount = await getConverAmount(wallet, { input: data, blockNumber })
      newReceipt['convertAmount'] = convertAmount
    }
    const { listTable } = await getDB(formAdd, id, type)
    await listTable.setItem(txId, clone(newReceipt))
    if (newReceipt.status) {
      await DEL_TXQUEUE(da, id, type)
    }
    return newReceipt
  }

  const DELBTC_TXQUEUE = async (tx) => {
    const { txId, from, network: { id, type } } = tx
    if (txId) {
      const { penddingTable } = await getDB(from, id, type)
      await penddingTable.removeItem(txId)
      // eventBus.emit('delTxQueue', tx)
    }
    return tx
  }

  const PUSHBTC_TRANSACTION = async (da) => {
    const { from, network: { id, type } } = da
    const { listTable } = await getDB(from, id, type)
    await listTable.setItem(da.txId, clone(da))
    // eventBus.emit('txPush', clone(da))
  }




  return {
    waitTxQueueResponse
  }
}


export async function waitForTransactions(hashs, time = null) {
  const store = await getStore()
  const currentNetwork = store.account.currentNetwork
  const coinType = store.account.coinType
  const { URL } = currentNetwork

  let data = null
  const list = []
  if(hashs.length) {
    if(coinType.value == 0) {
      const wallet = await getWallet()
      const provider = await getProvider()
      removeAllListeners(wallet, hashs, time)
      if (hashs.length && provider) {
        try {
          for await (const hash of hashs) {
            if (time != null) {
              data = await provider.waitForTransaction(hash, null, time)
              list.push(data)
            } else {
              data = await provider.waitForTransaction(hash)
              list.push(data)
            }
            const { status, transactionHash } = data
            const title = status ? chrome.i18n.getMessage('sendSuccessed') :chrome.i18n.getMessage('sendFailed')
            notices({ title, message: transactionHash, data: data || {}, clickCallback: () => toTradeHistory(transactionHash) })
          }
        }catch(err){
    
        } finally {
          if(wallet) {
            removeAllListeners(wallet, hashs, time)
          }
        }
    
      }
      return Promise.resolve({list, wallet})

    }
    if(coinType.value == 1) {
      console.warn('cointype', coinType)
      console.log('hashs', hashs, time)
      if (hashs.length) {
        try {
          for await (const hash of hashs) {
            if (time != null) {
              data = await waitBTCTx(hash, time)
              list.push(data)
            } else {
              data = await waitBTCTx(hash)
              list.push(data)
            }
            console.log('tx data', data)
            const { txid } = data
            const title = chrome.i18n.getMessage('sendSuccessed')
            notices({ title, message: txid, data: data || {}, clickCallback: () => toTradeHistory(txid) })
          }
        }catch(err){
          console.error(err)
        }
      }
      return Promise.resolve({ list })
    }
  }
 
}


export async function removeAllListeners(newwallet) {
  if(newwallet && newwallet.provider) {
    newwallet.provider.removeAllListeners()
  }
}

function clone(obj) {
  if (obj && typeof obj == 'object') {
    return JSON.parse(JSON.stringify(obj));
  }
  return {}
}

let waitIns = null
let waitIns2 = null
const delay = 5000
async function waitBTCTx(txId, time = null){
  const store = await getStore()
  const {URL} = store.account.currentNetwork
  const getUrl = `${URL}/tx/${txId}`
  if(waitIns){
    clearInterval(waitIns)
  }
  if(waitIns2){
    clearTimeout(waitIns2)
  }
  return new Promise((resolve, reject) => {
    if(!time) {
      waitIns = setInterval(() => {
        getFetch(getUrl).then(res => {
          console.warn('get btc tx', res)
          resolve(res)
          clearInterval(waitIns)
        })
      }, delay)
    } else {
        waitIns = setInterval(() => {
          getFetch(getUrl).then(res => {
            resolve(res)
            clearInterval(waitIns)
            clearTimeout(waitIns2)
          })
        }, delay)
        waitIns2 = setTimeout(() => {
          clearInterval(waitIns)
          clearTimeout(waitIns2)
          reject('wait tx err:timeout')
        },time)
    }

  })
}


function getFetch(url, params = {}){
  return new Promise((resolve, reject) => {
    fetch(url, {
      method: 'get',
      headers: {
        'Content-type': 'application/json'
      },
    })
      .then(response => {
        console.warn('fetch', response)
        return response.json()
      })
      .then(data => resolve(data))
      .catch(err => reject(err))
  })
}