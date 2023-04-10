import localforage from "localforage";
import store from '@/popup/store/index'
import { btcNetworks, getBTCNetwork } from "../utils/btc/config";
import { toRaw } from "vue";
import { NetWorkData, netWorklist } from "../enum/network";
import { clone } from "./modules/account";
import { useBroadCast } from '@/popup/utils/broadCost'

const { handleUpdate } = useBroadCast()

interface DBRes {
    listTable: LocalForage,
    penddingTable: LocalForage,
    searchParamsTable: LocalForage,
    networksTable: LocalForage
}

export const getDB = (address = ''): DBRes => {
    const coinType = store.state.account.coinType
    const networkId = store.state.account.currentNetwork.id
    const net = getBTCNetwork()
    console.warn('net', net)
    const netType =coinType.value == 0 ? networkId : getBTCNetwork().name
    const name = `TX-${coinType.name}-${netType.toUpperCase()}`
    const addr = (address ? address : store.state.account.accountInfo.address).toUpperCase()
    const searchParamsTable = localforage.createInstance({
        name,
        storeName: `SEARCH-TABLE-${addr}`
    })
    const listTable = localforage.createInstance({
        name,
        storeName: `LIST-TABLE-${addr}`
    })
    const penddingTable = localforage.createInstance({
        name,
        storeName: `PENDDING-TABLE-${addr}`
    })

    const networksTable = localforage.createInstance({
        name: 'localforage',
        storeName: `NETWORKS-TABLE`
    })

    return {
        listTable,
        penddingTable,
        searchParamsTable,
        networksTable
    };
}


export const getNetworkList = async() => {
    const { networksTable } = getDB()
    const keys = await networksTable.keys()
    const nets = await Promise.all(keys.map(id => networksTable.getItem(id)))
    return nets.filter((item: any) => item.type == store.state.account.coinType.name)
}

export const modifNetWork = (network: NetWorkData) => {
    const { networksTable } = getDB()
    return networksTable.setItem(network.id, clone(network))
    
}

export const deleteNetWork = (id : string) => {
    const { networksTable } = getDB()
    return networksTable.removeItem(id)
}



export const addNetWork = (network: NetWorkData) => {
    const { networksTable } = getDB()
    return networksTable.setItem(network.id, clone(network))
}

export const initDBData = async() => {
    console.warn('init DB Data...')
    const { networksTable } = getDB()
    // ETH add type: ETH property
    const localNetworkList = store.state.account.netWorkList
    // BTC btcNetworks
    console.log('networksTable.keys()', toRaw(localNetworkList), await networksTable.keys())
    const keys = await networksTable.keys()
    if(!keys.length) {
        const ethList = toRaw(localNetworkList).length ? toRaw(localNetworkList) : netWorklist
        console.log('ethList', ethList)
        for await (const item of ethList) {
           await networksTable.setItem(item.id, clone(item))
        }
        for await (const item of btcNetworks) {
           await networksTable.setItem(item.id, clone(item))
        }

    }
    store.commit('account/CLEAR_NETWORK')
    store.commit('account/CLEAR_NETWORKSCOINTYPE')
}


const ins = {
    getDB,

}

export const getTxList = async(address: string = ''): Promise<any> => {
    const listTable = getDB(address).listTable
    const keys = await listTable.keys() || []
    
    return new Promise(async(resolve, reject) => {
        if(!keys.length){
            resolve([])
            return
        }
        const list = []
        for await (const txId of keys) {
            list.push(await listTable.getItem(txId))
        }
        if(store.state.account.coinType.value == 0) {
            resolve(list.sort((a,b) => b.blockNumber - a.blockNumber))
        }
        if(store.state.account.coinType.value == 1) {
            resolve(list.sort((a,b) => b.date - a.date))
        }
    })
}

export const saveTxList = async(address: string = '', list: Array<any>): Promise<any> => {
    console.warn('save list', address, list)
    const listTable = getDB(address || store.state.account.account.address).listTable
    return new Promise((resolve,reject) => {
        if(address) {
            list.forEach(item => {
                if(item.txId) {
                    listTable.setItem(item.txId, item)
                }
            })
            resolve(list)
        } else {
            reject("address or list parameter can't be null")
        }
    })

}

export const getPenddingList =async (address: string = ''): Promise<any> => {
    const penddingTable = getDB(address).penddingTable
    console.warn('penddingTable', penddingTable)
    const keys = await penddingTable.keys() || []
    return new Promise(async(resolve, reject) => {
        if(!keys.length){
            resolve([])
            return
        }
        const list = []
        for await (const txId of keys) {
            list.push(await penddingTable.getItem(txId))
        }
        resolve(list)
    })
}


export const getSearchParams = async (address : string = ''): Promise<any> => {
    const searchParamsTable = getDB(address).searchParamsTable
    return searchParamsTable.getItem(`SEARCH-PARAMS`)
}


export const setSearchParams = async (address : string = '', pageInfo: any = {}): Promise<any> => {
    const searchParamsTable = getDB(address).searchParamsTable
    return searchParamsTable.setItem(`SEARCH-PARAMS`, pageInfo)
}


export const getMainTx = async (address: string = ''):Promise<any> => {
   const pageInfo = await getSearchParams(address)
   const list = await getTxList(address)
   return {
    list,
    ...pageInfo
   }
}

export const setMainTx = async (address: string = '', info: any): Promise<any> => {
    const {list,page,total} = info
    await saveTxList(address, list)
    await setSearchParams(address, {page,total})
}

export default ins