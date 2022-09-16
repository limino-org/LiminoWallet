
export default {
    path: "/connect",
    name: "connect",
    component:()=> import("@/popup/views/connect/index.vue"),
    meta: {
        auth: true
    }
  }
