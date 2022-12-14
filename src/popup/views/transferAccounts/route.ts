export default {
    path: "/transferAccount",
    name: "transferAccounts",
    redirect: { name: "send" },
    component: () => import("@/popup/views/transferAccounts/index.vue"),
    children: [
      {
        path: "/transferAccount/send",
        name: "send",
        component: () => import("@/popup/views/transferAccounts/pages/send/index.vue"),
        meta: {
          auth: true,
          title:'send',
          keepAlive: true,
        },
      },
      {
        path: "/transferAccount/gasFee",
        name: "gasFee",
        component: () => import("@/popup/views/transferAccounts/pages/send/gasFee.vue"),
        meta: {
          auth: true,
          title:'send',
          keepAlive: true,
        },
      },
    ],
  }