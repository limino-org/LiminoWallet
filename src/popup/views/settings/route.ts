export default  {
    path: "/settings",
    name: "settings",
    component:() =>  import("@/popup/views/settings/index.vue"),
    redirect: { name: "settingsHome" },
    children: [
      {
        path: "/settings/index",
        name: "settingsHome",
        component:() =>  import("@/popup/views/settings/pages/home/index.vue"),
        meta: {
          auth: true,
        },
      },
      {
        path: "/settings/networkList",
        name: "networkList",
        component:() =>  import("@/popup/views/settings/pages/networkList/index.vue"),
        meta: {
          auth: true,
        },
      },
      {
        path: "/settings/addNetwork",
        name: "addNetwork",
        component: () => import("@/popup/views/settings/pages/addNetwork/index.vue"),
        meta: {
          auth: true,
        },
      },
      {
        path: "/settings/language",
        name: "language",
        component:() =>  import("@/popup/views/settings/pages/language/index.vue"),
        meta: {
          auth: true,
        },
      },
      {
        path: "/settings/contacts-add",
        name: "contacts-add",
        component:() =>  import("@/popup/views/settings/pages/contacts/add.vue"),
        meta: {
          auth: true,
          title:'Contacts'
        },
      },
      {
        path: "/settings/contacts-list",
        name: "contacts-list",
        component: () => import("@/popup/views/settings/pages/contacts/list.vue"),
        meta: {
          auth: true,
          title:'Contacts'
        },
      },
      {
        path: "/settings/contacts-choose",
        name: "contacts-choose",
        component: () => import("@/popup/views/settings/pages/contacts/choose.vue"),
        meta: {
          auth: true,
          title:'Contacts'
        },
      },
      {
        path: "/settings/resetPwd-step1",
        name: "resetPwd-step1",
        component:() =>  import("@/popup/views/settings/pages/resetPwd/step1.vue"),
        meta: {
          auth: false,
          title:'resetPwd-step1'
        },
      },
      {
        path: "/settings/resetPwd-step2",
        name: "resetPwd-step2",
        component:() =>  import("@/popup/views/settings/pages/resetPwd/step2.vue"),
        meta: {
          auth: true,
          title:'resetPwd-step2'
        },
      },
      {
        path: "/settings/export-privateKey",
        name: "export-privateKey",
        component:() =>  import("@/popup/views/settings/pages/exportPrivateKey/index.vue"),
        meta: {
          auth: true,
          title:'Private key export'
        },
      },
      {
        path: "/settings/recovery-phrase",
        name: "recovery-phrase",
        component:() =>  import("@/popup/views/settings/pages/recoveryPhrase/index.vue"),
        meta: {
          auth: true,
          title:'Secret Recovery Phrase'
        },
      },
      {
        path: "/settings/transaction-history",
        name: "transaction-history",
        component:() =>  import("@/popup/views/settings/pages/transactionHistory/step1.vue"),
        meta: {
          auth: true,
          tltle:'Transation History'
        },
      },
      {
        path: "/settings/account-management",
        name: "account-management",
        component: () => import("@/popup/views/settings/pages/accountManagement/step1.vue"),
        meta: {
          auth: true,
          tltle:'Account Management'
        },
      },
      {
        path: "/settings/snft-creator",
        name: "snft-creator",
        component: () => import("@/popup/views/settings/pages/snftCreator/index.vue"),
        meta: {
          auth: true,
          tltle:'Snft Creator'
        },
      },
      {
        path: "/settings/account-name",
        name: "account-name",
        component: () => import("@/popup/views/settings/pages/accountManagement/step2.vue"),
        meta: {
          auth: true,
          tltle:'Account Management'
        },
      },
      
    ],
  }