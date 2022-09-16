export default {
    path: "/tokens",
    name: "tokens",
    component:() =>  import("@/popup/views/tokens/index.vue"),
    children: [
      {
        path: "/tokens/import",
        name: "tokens-import",
        component:() =>  import("@/popup/views/tokens/pages/import.vue"),
        meta: {
          auth: true,
        },
      },
    ],
  };
  