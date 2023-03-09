<template>

<h1>BTC TEST</h1>
    <div class="p-20">
        <div class="p-20">
            <h2>from address: {{ fromAddress }}</h2>
            <h2>from privateKey: {{ fromPrivateKey }}</h2>
            <h2>from WIF: {{ fromWIF }}</h2>
            <h2>from balance: {{ fromBalance }} WEI</h2>
        </div>

        <div class="p-20" >
            <h2>to address: {{ toAddress }}</h2>
            <h2>to privateKey: {{ toPrivateKey }}</h2>
            <h2>to WIF: {{ toWIF }}</h2>
            <h2>to balance: {{ toBalance }} WEI</h2>
        </div>
    </div>

    <button @click="handleSend">send 10 WEI to. </button>
    <div>
        <h2>NETWORK TESTNET</h2>
    </div>


</template>
<script lang="ts" setup>
import { onMounted, ref } from "vue";
import  bitcore from 'bitcore-lib'
import axios from 'axios'
import { ethers } from "ethers";
// http://192.168.1.235:18443/ 
const { PrivateKey, Address, Networks, Transaction } = bitcore
console.log('bitcore', bitcore)
console.log('bitcore', PrivateKey)

const fetcher = (url: string) => axios.get(url).then(res => res.data);
const baseUrl = `https://api.bitcore.io/api/BTC/testnet`
// https://api.bitcore.io/api/BTC/testnet/address/mh7P1mUdhUpZL2qquFH8CCfQugR1o7641Y/balance

const getBalance = (address: string) => {
    const url = `${baseUrl}/address/${address}/balance`
    return fetcher(url)
}



// const Insight = require('bitcore-insight').Insight;
// let insight = new Insight('testnet');
// console.log('insight', insight)
const fromKey = new PrivateKey('8702c1cb58d2cda0b9bd735224b9f02323f40bbacd0d85bf53069e91dbc3541e');
console.log('fromKey', fromKey.toString())
const fromPrivateKey = ref(fromKey.toString())
const fromAddress = ref(fromKey.toAddress(Networks.testnet).toString())
const fromWIF = ref(fromKey.toWIF())
const fromBalance = ref(0)



const toKey = new PrivateKey('07d4db365dd98ac5e9b188323054fbe57c61bdb527f101e67b701d529cad5c6b');
console.log('oldKey', toKey.toString())
const toPrivateKey = ref(toKey.toString())
const toAddress = ref(toKey.toAddress(Networks.testnet).toString())
const toWIF = ref(toKey.toWIF())
const toBalance = ref(0)


const handleSend = () => {
    const transaction = new Transaction()
    console.log('Transaction', transaction)
}


const handleUpdateBalance = async() => {
    const formBan = await getBalance(fromAddress.value)
    const toBan = await getBalance(toAddress.value)
    fromBalance.value = formBan.balance
    toBalance.value = toBan.balance
    console.log('formBan', formBan)
    console.log('toBan', toBan)
}
// NETWORK

console.log('testnet', Networks.testnet)
// bitcore.Networks.defaultNetwork = bitcore.Networks.testnet;
onMounted(async() => {
    handleUpdateBalance()
})
</script>