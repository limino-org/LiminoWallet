import localforage from "localforage";
import store from '@/popup/store/index'
import { btcNetworks, getBTCNetwork } from "../utils/btc/config";
import { toRaw } from "vue";
import { NetWorkData, netWorklist } from "../enum/network";
import { ContactInfo, clone } from "./modules/account";
import { useBroadCast } from '@/popup/utils/broadCost'
import { coinTypes } from "../enum/coinType";
import { guid } from "../utils";
import i18n from "@/popup/language/index";

const { handleUpdate } = useBroadCast()

interface DBRes {
    listTable: LocalForage,
    penddingTable: LocalForage,
    searchParamsTable: LocalForage,
    networksTable: LocalForage,
    contactsTable: LocalForage,
    recentlistTable: LocalForage
}


export const getDB = (address = '', netId = store.state.account.currentNetwork.id, coinTypeName = store.state.account.coinType.name): DBRes => {
    const newNetId = netId || store.state.account.currentNetwork.id
    const newCoinTypeName = coinTypeName || store.state.account.coinType.name
    const name = `TX-${newCoinTypeName}-${newNetId.toUpperCase()}`
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

    const contactsTable = localforage.createInstance({
        name,
        storeName: `CONTACTS-TABLE`
    })

    const recentlistTable = localforage.createInstance({
        name,
        storeName: `RECENTLIST-TABLE`
    })
    return {
        listTable,
        penddingTable,
        searchParamsTable,
        networksTable,
        contactsTable,
        recentlistTable
    };
}


export const getNetworkList = async (type = '') => {
    const { networksTable } = getDB()
    const keys = await networksTable.keys()
    const nets = await Promise.all(keys.map(id => networksTable.getItem(id)))
    if(!type){
        return nets
    }
    return nets.filter((item: any) => item.type == type)
}

export const modifNetWork = (network: NetWorkData) => {
    const { networksTable } = getDB()
    return networksTable.setItem(network.id, clone(network))

}

export const deleteNetWork = (id: string) => {
    const { networksTable } = getDB()
    return networksTable.removeItem(id)
}

export const addNetWork = (network: NetWorkData) => {
    const { networksTable } = getDB()
    return networksTable.setItem(network.id, clone(network))
}

export const initDBData = async () => {
    const { networksTable, contactsTable } = getDB()
    // ETH add type: ETH property
    const localNetworkList = store.state.account.netWorkList
    // BTC btcNetworks
    const keys = await networksTable.keys()
    if (!keys.length) {
        const ethList = toRaw(localNetworkList).length ? toRaw(localNetworkList) : netWorklist
        for await (const item of ethList) {
            await networksTable.setItem(item.id, clone(item))
        }
        for await (const item of btcNetworks) {
            await networksTable.setItem(item.id, clone(item))
        }
        store.commit('account/CLEAR_NETWORK')
        store.commit('account/CLEAR_NETWORKSCOINTYPE')

    } else {
        // mix [...netWorklist,...btcNetworks] => nets
        // const allNetworks = [...netWorklist,...btcNetworks]
        // const currentNetwork = store.state.account.currentNetwork
        // const newCurrentNet = allNetworks.find((item: NetWorkData) => item.id == currentNetwork.id)
        // store.commit('account/UPDATE_NETWORK', newCurrentNet)
        // for await (const net of allNetworks) {
        //     await networksTable.setItem(net.id, clone(net))
        // }
    }

    // contacts async
        if(store.state.account.contacts.length){
            const { contactsTable: ETHContactsTable } = getDB(store.state.account.accountInfo.address, "wormholes-network-1", 'ETH')
            const contacts = clone(store.state.account.contacts)
            for await (const contact of contacts) {
                ETHContactsTable.setItem(contact.id, clone(contact))
            }
            store.dispatch('account/CLEAR_CONTACT')
        }

}
const ins = {
    getDB,
}

export const getTxList = async (address: string = ''): Promise<any> => {
    const listTable = getDB(address).listTable
    const keys = await listTable.keys() || []

    return new Promise(async (resolve, reject) => {
        if (!keys.length) {
            resolve([])
            return
        }
        const list = []
        for await (const txId of keys) {
            list.push(await listTable.getItem(txId))
        }
        if (store.state.account.coinType.value == 0) {
            resolve(list.sort((a, b) => b.blockNumber - a.blockNumber))
        }
        if (store.state.account.coinType.value == 1) {
            resolve(list.sort((a, b) => new Date(b.blockTime).getTime() - new Date(a.blockTime).getTime()))
        }
    })
}

export const saveTxList = async (address: string = '', list: Array<any>): Promise<any> => {
    const listTable = getDB(address || store.state.account.account.address).listTable
    return new Promise((resolve, reject) => {
        if (address) {
            list.forEach(item => {
                if (item.txId) {
                    listTable.setItem(item.txId, clone(item))
                }
            })
            resolve(list)
        } else {
            reject("address or list parameter can't be null")
        }
    })

}

export const getPenddingList = async (address: string = ''): Promise<any> => {
    const penddingTable = getDB(address).penddingTable
    const keys = await penddingTable.keys() || []
    return new Promise(async (resolve, reject) => {
        if (!keys.length) {
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


export const removePenddingRecord = async (address: string = '', id = ''): Promise<any> => {
    const penddingTable = getDB(address).penddingTable
    const keys = await penddingTable.keys() || []
    return penddingTable.removeItem(id)
}

export const getSearchParams = async (address: string = ''): Promise<any> => {
    const searchParamsTable = getDB(address).searchParamsTable
    return searchParamsTable.getItem(`SEARCH-PARAMS`)
}

export const setSearchParams = async (address: string = '', pageInfo: any = {}): Promise<any> => {
    const searchParamsTable = getDB(address).searchParamsTable
    return searchParamsTable.setItem(`SEARCH-PARAMS`, clone(pageInfo))
}

export const getMainTx = async (address: string = ''): Promise<any> => {
    const pageInfo = await getSearchParams(address)
    const list = await getTxList(address)
    return {
        list: list || [],
        page: '1',
        total: 0,
        ...pageInfo
    }
}

export const setMainTx = async (address: string = '', info: any): Promise<any> => {
    console.log('set', info)
    const { list, page, total } = info
    await saveTxList(address, list)
    await setSearchParams(address, { page, total })
}

export const clearCache = async () => {
    const { networksTable } = getDB()
    const keys = await networksTable.keys()
    const nets: any = await Promise.all(keys.map(id => networksTable.getItem(id)))
        for await (const coin of coinTypes) {
            for await (const net of nets) {
                const { id, type, value } = net
                const name = `TX-${type}-${id.toUpperCase()}`
                await localforage.dropInstance({
                    name,
                })
            }
        }

}

export const getContactsList = ():Promise<Array<ContactInfo>> => {
    const contactsTable = getDB().contactsTable
    return new Promise(async(resolve, reject) => {
        const keys = await contactsTable.keys() || []
        if (!keys.length) {
            resolve([])
            return
        }
        const list = []
        for await (const id of keys) {
            list.push(await contactsTable.getItem(id))
        }
        resolve(list)
    })
}

export const addContact = async (contact: ContactInfo) => {
    const contactsTable = getDB().contactsTable
    const { id, address } = contact
    if(!id){
        return Promise.reject('id can not be null')
    }
    const list = await getContactsList()
    const data = list.find(item => item.address.toUpperCase() == address.toUpperCase())
    if(data){
        return Promise.reject(i18n.global.t('contacts.alreadyexists'))
    }
    await contactsTable.setItem(id, clone(contact)).then(() => handleUpdate())
}

export const modifContact = async (contact: ContactInfo) => {
    return addContact(contact)
}
export const deleteContact = async (id: string) => {
    const contactsTable = getDB().contactsTable
    return contactsTable.removeItem(id).then(() => handleUpdate())
}


interface RecentListRes {
    data: {
        [key: number]: ContactInfo
    },
    list: Array<ContactInfo>
}

export const getRecentList = async ():Promise<RecentListRes> => {
    const recentlistTable = getDB().recentlistTable
    return new Promise(async(resolve, reject) => {
        const keys = await recentlistTable.keys()
        const data = {}
        const list = []
        if(!keys.length){
            resolve({data, list})
            return
        }
        for await (const id of keys) {
            const rec = await recentlistTable.getItem(id)
            data[id] = rec
            list.push(rec)
        }
        resolve({data,list})
    })

}

export const addRecentList = async (address: string) => {
    const recentlistTable = getDB().recentlistTable
    if(!address){
        return Promise.reject("addr can't be null")
    }
    const myAccount = store.state.account.accountList.find(item => item.address.toUpperCase() == address.toUpperCase())
    const recent: ContactInfo = {
        address,
        id: guid(),
        date: new Date().getTime(),
        name: '-'

    }
    if(myAccount) {
        recent.name = myAccount.name
        recent.icon = myAccount.icon
    }
    const {list, data} = await getRecentList()
    const exist = list.find(item => item.address == recent.address)
    if(exist) {
        const id = exist.id
        await recentlistTable.removeItem(id)
    }
    const { list: newList } = await getRecentList()
    const newkeys = await recentlistTable.keys()
    if(newkeys.length && newkeys.length > 20){
        const [a] = newList.sort((a,b) => a.date - b.date)
        await recentlistTable.removeItem(a.id)
    }
    await recentlistTable.setItem(recent.id, clone(recent))
}

export default ins