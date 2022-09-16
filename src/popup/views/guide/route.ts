// Boot page routing
export default {
    path: "/guide",
    name: "guide",
    component: () => import("@/popup/views/guide/index.vue"),
    children: [
      {
        path: "/guide/step1",
        name: "guide-step1",
        component: () => import("@/popup/views/guide/pages/step1.vue"),
        meta: {
          auth: false,
        },
      },
      {
        path: "/guide/step2",
        name: "guide-step2",
        component: () => import("@/popup/views/guide/pages/step2.vue"),
        meta: {
          auth: false,
        },
      },
    ],
}