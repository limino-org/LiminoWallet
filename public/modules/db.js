import { localforage } from './localforage.js'
import { clone, getStore, guid } from './common.js';




export const coinTypes = [
    { name: "ETH", color: "#037CD6", value: 0, address: '' },
    { name: "BTC", color: "orange", value: 1, address: '' },
  ]


export const  getDB = async (address = '', netId = '', coinTypeName = '') => {
    const store = await getStore()
    const newNetId = netId || store.account.currentNetwork.id
    const newCoinTypeName = coinTypeName || store.account.coinType.name
    const name = `TX-${newCoinTypeName}-${newNetId.toUpperCase()}`
    const addr = (address ? address : store.account.accountInfo.address).toUpperCase()
    console.log('storeName', name, addr)
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
    const { networksTable } = await getDB()
    const keys = await networksTable.keys()
    const nets = await Promise.all(keys.map(id => networksTable.getItem(id)))
    if(!type){
        return nets
    }
    return nets.filter((item) => item.type == type)
}

export const modifNetWork = async(network) => {
    const { networksTable } =await getDB()
    console.warn('modif', network)
    return networksTable.setItem(network.id, clone(network))

}

export const deleteNetWork = async(id) => {
    const { networksTable } = await getDB()
    return networksTable.removeItem(id)
}

export const addNetWork = async(network) => {
    const { networksTable } = await getDB()
    return networksTable.setItem(network.id, clone(network))
}


const ins = {
    getDB,
}

export const getTxList = async (address = '')=> {
    const {listTable} =  await getDB(address)
    const keys = await listTable.keys() || []

    return new Promise(async (resolve, reject) => {
        if (!keys.length) {
            resolve([])
            return
        }
        const store = await getStore()
        const list = []
        for await (const txId of keys) {
            list.push(await listTable.getItem(txId))
        }
        if (store.account.coinType.value == 0) {
            resolve(list.sort((a, b) => b.blockNumber - a.blockNumber))
        }
        if (store.account.coinType.value == 1) {
            resolve(list.sort((a, b) => new Date(b.blockTime).getTime() - new Date(a.blockTime).getTime()))
        }
    })
}

export const saveTxList = async (address = '', list = []) => {
    console.warn('save list', address, list)
    const store = await getStore()
    const {listTable} = await getDB(address || store.account.account.address)
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

export const getPenddingList = async (address = '') => {
    const {penddingTable} = await getDB(address)
    console.warn('penddingTable', penddingTable)
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

export const getSearchParams = async (address = '') => {
    const {searchParamsTable} = await getDB(address)
    return searchParamsTable.getItem(`SEARCH-PARAMS`)
}

export const setSearchParams = async (address = '', pageInfo = {}) => {
    const {searchParamsTable} = await getDB(address)
    return searchParamsTable.setItem(`SEARCH-PARAMS`, clone(pageInfo))
}

export const getMainTx = async (address = '') => {
    const pageInfo = await getSearchParams(address)
    const list = await getTxList(address)
    return {
        list,
        ...pageInfo
    }
}

export const setMainTx = async (address = '', info = {}) => {
    const { list, page, total } = info
    await saveTxList(address, list)
    await setSearchParams(address, { page, total })
}

export const clearCache = async () => {
    const { networksTable } = await getDB()
    const keys = await networksTable.keys()
    const nets = await Promise.all(keys.map(id => networksTable.getItem(id)))
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

export const getContactsList = async () => {
    const {contactsTable} = await getDB()
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

export const addContact = async (contact = {}) => {
    const {contactsTable} = await getDB()
    const { id, address } = contact
    if(!id){
        return Promise.reject('id can not be null')
    }
    const list = await getContactsList()
    const data = list.find(item => item.address.toUpperCase() == address.toUpperCase())
    if(data){
        return Promise.reject('The contact already exists')
    }
    await contactsTable.setItem(id, clone(contact))
}

export const modifContact = async (contact = {}) => {
    return addContact(contact)
}
export const deleteContact = async (id) => {
    const {contactsTable} = await getDB()
    return contactsTable.removeItem(id)
}



export const getRecentList = async () => {
    const {recentlistTable} = await getDB()
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

export const addRecentList = async (address = '') => {
    const {recentlistTable} = await getDB()
    if(!address){
        return Promise.reject("addr can't be null")
    }
    const store = await getStore()
    const myAccount = store.account.accountList.find(item => item.address.toUpperCase() == address.toUpperCase())
    const recent = {
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