// Transaction module routing
export default {
  path: "/transactionDetails",
  name: "transactionDetails",
  component:() =>  import("@/popup/views/transactionDetails/index.vue"),
  children: [
    {
      path: "/transactionDetails/step1",
      name: "transactionDetails-step1",
      component:() =>  import("@/popup/views/transactionDetails/pages/step1.vue"),
      meta: {
        auth: true,
      },
    },
    
  ],
};
