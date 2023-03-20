<template>
  <h1 class="m-20">BTC TEST</h1>
  <div class="card p-20">
    <h2>发起交易</h2>
    <div class="p-20">
      <h2>from address: {{ fromAddress }}</h2>
      <h2>from privateKey: {{ fromPrivateKey }}</h2>
      <h2>from WIF: {{ fromWIF }}</h2>
      <h2>from balance: {{ fromBalance }} WEI</h2>
    </div>

    <div class="p-20">
      <h2>to address: {{ toAddress }}</h2>
      <h2>to privateKey: {{ toPrivateKey }}</h2>
      <h2>to WIF: {{ toWIF }}</h2>
      <h2>to balance: {{ toBalance }} WEI</h2>
    </div>
    <h2>发交易 50000 wei to</h2>
    <button @click="handleSend">send 100 WEI to.</button>
  </div>

  <div class="card p-20">
    <h2>通过私钥导入账号</h2>
    <input type="text" v-model="importPrivateKey" />
    <button @click="handleImport">导入</button>
    <h2>{{ importAddr }}</h2>
  </div>

  <div class="card p-20">
    <h2>通过助记词创建子账号</h2>
    <input type="text" v-model="importMnemonic" />
    <button @click="handleAdd">创建子账号</button>
    <div>账户下标{{ pathIndex }}</div>
    <div class="accrountList">
      <div v-for="item in accountList" :key="item.address">
        <div>私钥：{{ item.privateKey }}</div>
        <div>地址：{{ item.address }}</div>
        <div>下标：{{ item.pathIndex }}</div>
      </div>
    </div>
  </div>


  <div class="card p-20">
    <h2>获取某个地址的余额</h2>
    <input type="text" v-model="balanceAddress" />
    <button @click="handleGetBalance">获取</button>
    <h2>{{ theBalanceAddress }}</h2>
  </div>

  <div class="card p-20">
    <h2>通过私钥签名</h2>
    Message<input type="text" v-model="signmsg" />

    私钥<input type="text" v-model="signtPrivateKey" />
    <button @click="handleSign">签名</button>
    <h2>{{ signStr }}</h2>
    
  </div>
  
  <div class="card p-20">
    <h2>解析签名数据</h2>
    <div>Message<input type="text" v-model="signmsg2" /></div>
    <div>sign<input type="text" v-model="sign2" /></div>
    <div>Address<input type="text" v-model="address2" /></div>
    <button @click="handleVerifySignFun">解析签名数据</button>
    <h2>{{ signStr }}</h2>
    
  </div>

</template>
<script lang="ts" setup>
import { onMounted, ref } from "vue";
import bitcore from "bitcore-lib";
const { PrivateKey, Address, Networks, Transaction } = bitcore;
import useBTC from '@/popup/utils/btc/index'
import { BTCWallet } from '@/popup/utils/btc/BTCWallet'
import { network } from "../utils/btc/config";

const { handleImportMnemonic, getBalance, handleImportPrivateKey, handleSignWithPrivateKey, handleVerifySign, handleSendTransaction } = useBTC()

console.log("bitcore", bitcore);
console.log("bitcore", PrivateKey);

const wallet = new BTCWallet("8702c1cb58d2cda0b9bd735224b9f02323f40bbacd0d85bf53069e91dbc3541e", network)
wallet.provider.getBalance().then(res => console.log('getbalance---', res))
console.log('wallet', wallet)
// const Insight = require('bitcore-insight').Insight;
// let insight = new Insight('testnet');
// console.log('insight', insight)
const fromKey = new PrivateKey(
  "8702c1cb58d2cda0b9bd735224b9f02323f40bbacd0d85bf53069e91dbc3541e"
, Networks.testnet);
console.log("fromKey", fromKey.publicKey.toString());
const fromPrivateKey = ref(fromKey.toString());
const fromAddress = ref(fromKey.toAddress().toString());
const fromPublicKey = ref()
const fromWIF = ref(fromKey.toWIF());
const fromBalance = ref(0);

const toKey = new PrivateKey(
  "07d4db365dd98ac5e9b188323054fbe57c61bdb527f101e67b701d529cad5c6b"
  , Networks.testnet);
console.log("oldKey", toKey.toString());
const toPrivateKey = ref(toKey.toString());
const toAddress = ref(toKey.toAddress().toString());
const toWIF = ref(toKey.toWIF());
const toBalance = ref(0);

const handleSend = async () => {
  const transaction = new Transaction();
  console.log("Transaction", transaction);
  await handleSendTransaction(fromPrivateKey.value,  fromAddress.value, toAddress.value, 100)
  handleUpdateBalance()
};

const handleUpdateBalance = async () => {
  const formBan = await getBalance(fromAddress.value);
  const toBan = await getBalance(toAddress.value);
  fromBalance.value = formBan.balance;
  toBalance.value = toBan.balance;
  console.log("formBan", formBan);
  console.log("toBan", toBan);
};
// NETWORK

// 导入私钥 importAddr
const importAddr = ref();
const importPrivateKey = ref();
const handleImport = async() => {
    const account = await handleImportPrivateKey(importPrivateKey.value)
    importAddr.value = account.address
    importPrivateKey.value = account.privateKey
}

// 导入助记词
const importMnemonic = ref();
const accountList = ref([]);
const pathIndex = ref(0)
const handleAdd = async () => {
   const data = await handleImportMnemonic(importMnemonic.value, pathIndex.value)
   pathIndex.value = pathIndex.value + 1
   accountList.value.push(data)
}

// 获取某个地址的余额
const balanceAddress = ref()
const theBalanceAddress = ref(0)
const handleGetBalance = async () => {
    const myBalance = await getBalance(balanceAddress.value)
    theBalanceAddress.value = myBalance
}


// 通过私钥签名
const signStr = ref()
const signmsg = ref()
const signtPrivateKey = ref()
const handleSign = () => {
  const sign = handleSignWithPrivateKey(signmsg.value, signtPrivateKey.value)
  signStr.value = sign
}


const signmsg2 = ref()
const sign2 = ref()
const address2 = ref()
const handleVerifySignFun = () => {
  handleVerifySign(address2.value,signmsg2.value, sign2.value)
}
console.log("testnet", Networks.testnet);
// bitcore.Networks.defaultNetwork = bitcore.Networks.testnet;
onMounted(async () => {
  handleUpdateBalance();
});
</script>
<style lang="scss">
.card {
  border: 1px solid #ddd;
  margin: 10px;
}
</style>