
// @ts-nocheck
import { getTransitionsPage } from '@/popup/http/modules/account'
import store from '../index'
import { getWallet } from './account'
import localforage from 'localforage'
import eventBus from '@/popup/utils/bus'
import { utils } from 'ethers'
import { web3 } from '@/popup/utils/web3'
console.warn('web3', web3)
import BigNumber from 'bignumber.js'
import { guid } from '@/popup/utils'
import { getDB, getMainTx, getPenddingList, setMainTx } from '../db'
const page_size = '100'
const page_size_int = Number(page_size)
let timeOut = 8000
let timeOut2 = 2000
interface State {
    time: any
}
let time = null
let time2 = null
export default {
    actions: {
        async updateRecordPage({ commit, state }: any, { transactions: list, total, hasRecord }) {
            const typerec = typeof hasRecord
            const wallet = await getWallet()
            const addr = store.state.account.accountInfo.address.toUpperCase()
            let txInfo = await getMainTx(addr)
            if (list && list.length) {
                const realList = txInfo && txInfo.list.length ?  txInfo.list.filter(item => !item.sendType) : []
                if ((txInfo && total >= realList.length) || !txInfo) {
                    try {
                        for await (const item of list) {
                            const convertAmount = await getConverAmount(wallet, item)
                            item['convertAmount'] = convertAmount
                        }
                    } catch (err: any) {
                        console.error('err:', err)
                    }
                }
            }
            const realList = txInfo && txInfo.list.length ?  txInfo.list.filter(item => !item.sendType) : []

            if (list && list.length >= 1) {
                txInfo.page = Number(txInfo.page) + 1 + ''
            }
            const newList = unRepet(txInfo.list, list).sort((a, b) => b.blockNumber - a.blockNumber)
            txInfo.list = txInfo.list && txInfo.list.length ? newList : [...list].sort((a, b) => b.blockNumber - a.blockNumber)
            txInfo.total = total
            console.warn('set 0', txInfo)
            await setMainTx(addr, txInfo)
            eventBus.emit('loopTxListUpdata', txInfo.list)
            const realList = txInfo && txInfo.list.length ?  txInfo.list.filter(item => !item.sendType) : []
            if (!list || realList.length >= total && typeof hasRecord == 'undefined') {
                if (time) {
                    clearInterval(time)
                }
            }
            if (total <= realList.length) {
                if (time && typeof hasRecord == 'undefined') {
                    clearInterval(time)
                }
                return
            }


        },
        async asyncAddrRecord({ commit, state, dispatch }: any) {
            const addr = store.state.account.accountInfo.address.toUpperCase()
            /**
             * Check whether synchronization is complete based on total and the current page number
             * Synchronize block browser transaction records
             * step 1. If it has not been synchronized, synchronize from the first page
             * step 2. If the data has been synchronized before, synchronize the first page (the latest data is in reverse order) and search until there are duplicate data
             * step 3. Get the transaction log data and store it in the cache
             *         The obtained transaction record data is compared with the local cache. If it does not exist, it is appended directly. If it does exist, it is discarded
             *         Store the page numbers in the cache when you're done
             */

            if (addr) {
                let txInfo = null
                try {
                    txInfo = await getMainTx(addr)
                } catch (err) {

                }
                if (!txInfo) {
                    txInfo = {
                        page: '1',
                        list: [],
                        total: 0
                    }
                }
                /**
                 * 1.It's not synchronized. It's straight to the last page
                 * 2.Out of sync:
                 *      1>.complete synchronously
                 *          Start synchronization from the first page. If no duplicate data is encountered, check page + 1
                 *          If duplicate data is encountered, synchronization is complete
                 *      2>.Out of sync
                 *          Continue to complete the previous synchronization
                 */
                const params = {
                    addr,
                    page_size,
                    page: txInfo.page
                }
                const { total, transactions } = await getTransitionsPage(params)
                if(transactions && transactions.length) {
                    for(let i =0;i<transactions.length;i++){
                        const item = transactions[i]
                        item.txId = guid()
                        if(item.input == '0x') {
                            item.txType = 'normal'
                        } else {
                            const json = getInput(item.input)
                            if(json) {
                                item.txType = 'wormholes'
                                item.jsonData = json
                            } else {
                                item.txType = 'contract'
                            }
                        }
                    }
                }
                await dispatch('updateRecordPage', { transactions, total })
                return { total, transactions,...params,txInfo }
            }
            return null
        },
        // Synchronize the latest transaction records
        async asyncUpdateList({ commit, stte, dispatch }: any, { total }) {
            const addr = store.state.account.accountInfo.address.toUpperCase()
            let page = '1'
            const txInfo = await getMainTx(addr)
            const realList = txInfo && txInfo.list.length ?  txInfo.list.filter(item => !item.sendType) : []
            return new Promise(async(resolve) => {
                if (total > realList.length) {
                    const hasRecord1 = await handleUpdateList()
                    if (!hasRecord1) {
                        resolve()
                        clearInterval(time2)
                        return 
                    }
                    time2 = setInterval(async () => {
                        const hasRecord = await handleUpdateList()
                        if (!hasRecord) {
                            resolve()
                            clearInterval(time2)
                        } 
                    }, timeOut2)
                } else {
                    resolve()
                }
            })

            async function handleUpdateList() {
                const params = {
                    addr,
                    page_size: 10,
                    page
                }
                const txInfo = await getMainTx(addr)
                const hashList = txInfo.list.map(item => item.hash.toUpperCase())
                const { total, transactions } = await getTransitionsPage(params)
                if(transactions && transactions.length) {
                    for(let i=0;i<transactions.length;i++){
                        const item = transactions[i]
                        item.txId = guid()
                        if(item.input == '0x') {
                            item.txType = 'normal'
                        } else {
                            const json = getInput(item.input)
                            if(json) {
                                item.txType = 'wormholes'
                                item.jsonData = json
                            } else {
                                item.txType = 'contract'
                            }
                        }
                        let diffList = txInfo.list && txInfo.list.length ? txInfo.list.slice(0, 10) : txInfo.list
                        const txQueue = await getPenddingList(addr) || []
                        
                        for await (let [sameIdx,child] of diffList.entries()) {
                            if(child.hash.toUpperCase() == item.hash.toUpperCase() && item.status != child.status){
                                if(sameIdx > -1) {
                                    txInfo.list[sameIdx] = item
                                    await setMainTx(addr, txInfo)
                                    eventBus.emit('sameNonce', child.hash)
                                    for await (const [idx,iterator] of txQueue.entries()) {
                                        if(iterator.nonce === diffList[sameIdx].nonce) {
                                            txQueue.splice(idx,1)
                                            // await getDB(addr).then(async(penddingTable) => {
                                            //    await penddingTable.remove(iterator.txId)
                                            // })
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                let newList = []
                if(transactions && transactions.length) {
                    newList = transactions.filter(item => !hashList.includes(item.hash.toUpperCase()))
                }
                console.warn('newList', newList)

                let hasRecord = false
                if (transactions && transactions.length >= 10) {
                    if (newList && newList.length == transactions.length) {
                        hasRecord = true
                        page = Number(page) + 1 + ''
                    } else {
                        hasRecord = false
                    }
                } else {
                    hasRecord = false
                }
                
                await dispatch('updateRecordPage', { transactions: newList, total, hasRecord })
                return hasRecord
            }

        },
        async loopAsyncTxList({ commit, state, dispatch }: any) {
            const network = store.state.account.currentNetwork
            const addr = store.state.account.accountInfo.address
            const wallet = await getWallet()
            // When you are currently on a wormholes network, synchronize transaction records from the block browser
            return new Promise(async(resolve) => {
                if (network.id === 'wormholes-network-1') {
                    try {
                        const res = await dispatch('asyncAddrRecord')
                    const txInfo = await getMainTx(addr)
                    const realList = txInfo && txInfo.list.length ?  txInfo.list.filter(item => !item.sendType) : []
                    // 记录的length不等于total的时候
                    if(realList.length === res.total) {
                        return resolve({total:res.total})
                    }
                    if(res){
                        const { total } = res
                            time = setInterval(async () => {
                                const txInfo = await await getMainTx(addr)
                                const realList = txInfo && txInfo.list.length ?  txInfo.list.filter(item => !item.sendType) : []
                                if (realList.length < total) {
                                    const info = await dispatch('asyncAddrRecord')
                                    if(info.total === txInfo.list.length) {
                                        resolve({ total })
                                        clearInterval(time)
                                    }
                                } else {
                                    resolve({ total })
                                    clearInterval(time)
                                }
                               
                            }, timeOut)
                            
                    } else {
                        resolve({ total: res.total})
                        clearInterval(time)
                    }
                    resolve({total: res.total})
                    } catch(err){
                        console.error(err)
                    }
                    return Promise.resolve({total: realList.length})
                }
                resolve({total:realList.length}) 
            })

        },
    },
    namespaced: true,
}


export function getInput(input) {
    if (input) {
        try {
            const wormStr = web3.utils.toAscii(input)
            const [nullstr, jsonstr] = wormStr.split('wormholes:')
            let jsonData = null
            if (jsonstr) {
                jsonData = JSON.parse(jsonstr)
            }
            return jsonData
        } catch (err) {
            console.error('err', err)
            return null
        }
    }
    return null
}


function unRepet(list, list2) {
    const obj = {}
    console.warn('list 1', list, list2)
    if(list && list.length){
        list.forEach(item => {obj[item.hash.toUpperCase()] = item})
    }
    if(list2 && list2.length) {
        list2.forEach(item => {obj[item.hash.toUpperCase()] = item})
    }
    const newList = []
    console.warn('obj', obj)
    Object.keys(obj).forEach(key => {
        newList.unshift(obj[key])
    })
    console.warn('newList', newList)
    return newList
}

export async function getConverAmount(wallet, data) {
    const { input, blockNumber } = data
    if (input && blockNumber) {
        let jsonData = getInput(input)
        if(jsonData) {
            const { type, nft_address } = jsonData
            if (type && type == 6 && nft_address) {
                const len = nft_address.length
                switch (len) {
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
                const nftAccountInfo = await wallet.provider.send(
                    "eth_getAccountInfo",
                    [nft_address, web3.utils.toHex((blockNumber - 1).toString())]
                );
                const { MergeLevel, MergeNumber } = nftAccountInfo
                //  @ts-ignore
                const { t0, t1, t2, t3 } = store.state.configuration.setting.conversion
    
                let convertAmount = 0
                if (MergeLevel === 0) {
                    convertAmount = new BigNumber(MergeNumber).multipliedBy(t0).toNumber()
                } else if (MergeLevel === 1) {
                    convertAmount = new BigNumber(MergeNumber).multipliedBy(t1).toNumber()
                } else if (MergeLevel === 2) {
                    convertAmount = new BigNumber(MergeNumber).multipliedBy(t2).toNumber()
                } else if (MergeLevel === 3) {
                    convertAmount = new BigNumber(MergeNumber).multipliedBy(t3).toNumber()
                }
                return convertAmount
            }
            return 0
        }
        return 0
    }
    return 0
}


function clone(params = {}) {
    return JSON.parse(JSON.stringify(params))
  }
  
export const stopLoop = () => {
    clearInterval(time)
    clearInterval(time2)
}