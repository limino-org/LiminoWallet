export default {
    path: "/receive",
    name: "receive",
    redirect: { name: "receive-choose" },
    component:() =>  import("@/popup/views/receive/index.vue"),
    children: [
      {
        path: "/receive/choose",
        name: "receive-choose",
        component:() =>  import("@/popup/views/receive/pages/choose/index.vue"),
        meta: {
          auth: true,
          title:'receive-choose',
        },
      },
      {
        path: "/receive/choose-code",
        name: "receive-choose-code",
        component:() =>  import("@/popup/views/receive/pages/receiveCode/index.vue"),
        meta: {
          auth: true,
          title:'Receive',

        },
      },
    ],
  }