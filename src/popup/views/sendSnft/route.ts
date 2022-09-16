// Send snft module route
export default {
  path: "/sendSnft",
  name: "sendSnft",
  component:() =>  import("@/popup/views/sendSnft/index.vue"),
  children: [
    {
      path: "/sendSnft/step1",
      name: "sendSnft-step1",
      component: () => import("@/popup/views/sendSnft/pages/step1.vue"),
      meta: {
        auth: true,
      },
    },
    {
      path: "/sendSnft/step2",
      name: "sendSnft-step2",
      component: () => import("@/popup/views/sendSnft/pages/step2.vue"),
      meta: {
        auth: true,
      },
    },
    
  ],
};
