export default {
  path: "/importAccount",
  name: "importAccount",
  component:() =>  import("@/popup/views/importAccount/index.vue"),
  children: [
    {
      path: "/importAccount/step1",
      name: "importAccount-step1",
      component:() =>  import("@/popup/views/importAccount/pages/step1.vue"),
      meta: {
        auth: true,
      },
    },
  ],
}