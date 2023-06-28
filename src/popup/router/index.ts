import {
  createRouter,
  createWebHashHistory,
  RouteRecordRaw,
  createWebHistory,
} from "vue-router";
import { useLogin } from "@/popup/components/navHeader/hooks/login";
import { getQuery, getURLPath } from "@/popup/utils/utils";
import guide from '@/popup/views/guide/route'
import createAccount from '@/popup/views/createAccount/route'
import mnemonic from '@/popup/views/mnemonic/route'
import home from '@/popup/views/home/route'
import setting from '@/popup/views/settings/route'
import createNft from '@/popup/views/createNft/route'
import sendSnft from '@/popup/views/sendSnft/route'
import sendNft from '@/popup/views/sendNft/route'
import transactionDetails from '@/popup/views/transactionDetails/route'
import receiveAccount from '@/popup/views/receive/route'
import importAccount from '@/popup/views/importAccount/route'
import transferAccount from '@/popup/views/transferAccounts/route'
import tokens from '@/popup/views/tokens/route'
import signPage from '@/popup/views/sign-page/route'
import { getCookies } from "../utils/jsCookie";
import store from "@/popup/store";
import connect from '@/popup/views/connect/route'
import generateNFT from '@/popup/views/generateNFT/route'

const routes: Array<RouteRecordRaw> = [
  // Transactions
  {
    path: "/transactionList",
    name: "transactionList",
    component:() => import("@/popup/views/account/transactionList/index.vue"),
    meta: {
      auth: true,
    },
  },
  // Import by mnemonic
  {
    path: "/importByMnemonic",
    name: "importByMnemonic",
    component:() =>  import("@/popup/views/account/importByMnemonic/index.vue"),
    meta: {
      auth: false,
    },
  },
  // Create new password
  {
    path: "/newwallet",
    name: "newwallet",
    component: () =>
      import("@/popup/views/account/creatwallet/newwallet/index.vue"),
    meta: {
      auth: false,
    },
  },

  // Select token
  {
    path: "/currencyList",
    name: "currencyList",
    component:() =>  import("@/popup/views/account/currencyList/index.vue"),
    meta: {
      auth: true,
    },
  },
  // transfer accounts
  transferAccount,
  // Collection
  receiveAccount,
  {
    path: "/addtokens",
    name: "addtokens",
    component:() =>  import("@/popup/views/account/addtokens/index.vue"),
    meta: {
      auth: true,
    },
  },
  // Export private key
  {
    path: "/inputpage",
    name: "inputpage",
    component: () =>
      import("@/popup/views/account/privatekeyexport/inputpage.vue"),
    meta: {
      auth: true,
    },
  },
  {
    path: "/successpage",
    name: "successpage",
    component: () =>
      import("@/popup/views/account/privatekeyexport/successpage.vue"),
    meta: {
      auth: true,
    },
  },
  // Successfully created the exchange
  {
    path: "/createsuccessexchange",
    name: "createsuccessexchange",
    component:() =>  import("@/popup/views/account/createsuccess/index.vue"),
    meta: {
      auth: true,
    },
  },
  {
    path: "/payment",
    name: "payment",
    component:() =>  import("@/popup/views/payment/index.vue"),
    redirect: { name: "step1" },
    children: [
      {
        path: "/payment/step1",
        name: "step1",
        component:() =>  import("@/popup/views/payment/step1/index.vue"),
        meta: {
          auth: true,
        },
      },
      {
        path: "/payment/step2",
        name: "step2",
        component: () => import("@/popup/views/payment/step2/index.vue"),
        meta: {
          auth: true,
        },
      },
      {
        path: "/payment/sendLink",
        name: "sendLink",
        component:() =>  import("@/popup/views/payment/sendLink/index.vue"),
        meta: {
          auth: true,
        },
      },
    ],
  },
  // Single signature
  {
    path: "/sign",
    name: "sign",
    component:() =>  import("@/popup/views/sign/index.vue"),
    meta: {
      auth: true,
    },
  },
    // Multiple signatures
  {
    path:'/multipleSign',
    name:"multipleSign",
    component:() => import('@/popup/views/multipleSign/index.vue'),
    meta: {
      auth: true,
    },
  },
  {
    path: "/nft-sign",
    name: "nft-sign",
    component:() =>  import("@/popup/views/nftSign/index.vue"),
    meta: {
      auth: true,
    },
  },
 
  {
    path: "/transaction",
    name: "transaction",
    component:() =>  import("@/popup/views/transaction/index.vue"),
    meta: {
      // authentication
      auth: true,
    },
  },
  // NFT transaction
  {
    path: "/nft-transaction",
    name: "nft-transaction",
    component:() =>  import("@/popup/views/nftTransaction/index.vue"),
    meta: {
      auth: true,
    },
  },
  {
    name: "nft-detail",
    path: "/nft-detail",
    component:() =>  import("@/popup/views/account/nftDetail/index.vue"),
    meta: {
      auth: true,
    },
  },
  // v2.0
  guide,
  // Mnemonic module
  mnemonic,
  createAccount,
  // Homepage module
  home,
  // Setup module
  setting,
  //Cast NFT
  createNft,
  // Send NFT, sendnft
  sendSnft,
  sendNft,
  // token
  tokens,
  // transaction details
  transactionDetails,
  // Imported account
  importAccount,
  // Purchase module
  // autograph
  signPage,
  connect,
  generateNFT

];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to,from,savedPosition){
    return {
      top: 0
    }
  }
});

router.beforeEach(async(to, form, next) =>  {
  console.warn('route-----',to, form)
 // @ts-ignore
 await store.restored; 
 const { name, meta } = to;
 const { auth } = meta;

 const { authentication, hasAccount } = useLogin();
 const hasAccountFlag = await hasAccount();

 // Whether the password is valid
 const query = getQuery();
 const password = await getCookies('password')
 
// Wallet not created -> Boot page
const filterNames1 = ['guide-step1','guide-step2','loginAccount-create-step1','loginAccount-create-step2','loginAccount-step1','loginAccount-step2','loginAccount-export-mnemonic','loginAccount-mnemonic-import','loginAccount-createing']
if(!hasAccountFlag && !password && !filterNames1.includes(name.toString())) {
  console.log('11111111111111111111111111',name,filterNames1)
  next({
    name: "guide-step1"
  })
  return
}
// Created, not logged in -> Logged in page
if(hasAccountFlag && !password && name != 'loginAccount-step1' && name != 'resetPwd-step1') {
  console.log('2222222222222222222222222222222222222',password,hasAccountFlag)

  const newQuery = {...query}
  const path = getURLPath()
  path != '/loginAccount/step1' && path != '/' ? newQuery.backUrl = path : ''
   next({
     name: "loginAccount-step1",
     query:newQuery,
   });
   return
}

if(hasAccountFlag && password && form.fullPath == '/' && to.fullPath == '/' && name != 'wallet'){
  next({
    name:'wallet'
  })
  return
}

const filterNames2 = ['connect','sign','send']
const filterNames3 = ['guide-step1','loginAccount-step1']

if(hasAccountFlag && password && form.fullPath == '/' && name != 'wallet' && !filterNames2.includes(to.name.toString())) {
  if(filterNames3.includes(to.name.toString())) {
    next({name:"wallet"})
    return
  }
  console.log('33333333333333333333333333333333')
  next()
  return
}

if(hasAccountFlag && password && filterNames3.includes(to.name.toString())) {
  next({name:"wallet"})
  return
}
console.log('4444444444444444444444444444444444444444444')
next()

});
// @ts-ignore
window.router = router
export default router;
