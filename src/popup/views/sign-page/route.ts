export default {
    path: "/sign-page",
    name: "sign-page",
    component:() =>  import("@/popup/views/sign-page/index.vue"),
    meta: {
        auth: true
    }
  };
  