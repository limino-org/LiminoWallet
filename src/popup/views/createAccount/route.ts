// Boot page routing
export default {
  path: "/loginAccount",
  name: "loginAccount",
  component:()=> import("@/popup/views/createAccount/index.vue"),
  children: [
    {
      path: "/loginAccount/create-step1",
      name: "loginAccount-create-step1",
      component: () => import("@/popup/views/createAccount/pages/create.vue"),
      meta: {
        auth: false,
      },
    },
    {
      path: "/loginAccount/create-step2",
      name: "loginAccount-create-step2",
      component: () => import("@/popup/views/createAccount/pages/createing.vue"),
      meta: {
        auth: false,
      },
    },
    {
      path: "/loginAccount/step1",
      name: "loginAccount-step1",
      component: () => import("@/popup/views/createAccount/pages/login-01.vue"),
      meta: {
        auth: false,
      },
    }, 
    {
      path: "/loginAccount/export-mnemonic",
      name: "loginAccount-export-mnemonic",
      component:() =>  import("@/popup/views/createAccount/pages/mnemonic.vue"),
      meta: {
        auth: false,
      },
    },
    {
      path:"/loginAccount/import-mnemonic",
      name:"loginAccount-mnemonic-import",
      component:() =>  import("@/popup/views/createAccount/pages/mnemonic-import.vue"),
      meta: {
        auth: false,
      },
    },
    {
      path:"/loginAccount/createing",
      name:"loginAccount-createing",
      component:() =>  import("@/popup/views/createAccount/pages/createing.vue"),
      meta: {
        auth: false,
      },
    },
    {
      path:"/loginAccount/start-page",
      name:"loginAccount-start-page",
      component:() =>  import("@/popup/views/createAccount/pages/start-page.vue"),
      meta: {
        auth: false,
      },
    },
    // {
    //   path: "/loginAccount/create-step",
    //   name: "create-step",
    //   component: () => import("@/views/guidance/createing.vue"),
    //   meta: {
    //     auth: false,
    //   },
    // },
  ],
}