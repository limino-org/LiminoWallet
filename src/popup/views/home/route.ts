// Mnemonic module routing
export default {
  path: "/home",
  name: "home",
  redirect: { name: "wallet" },
  component: () => import("@/popup/views/home/index.vue"),
  children: [
    {
      path: "/home/wallet",
      name: "wallet",
      component: () => import("@/popup/views/home/pages/wallet/index.vue"),
      meta: {
        auth: true,
      },
    },
    {
      path: "/home/create-auto-exchange",
      name: "createAutoExchange",
      component: () =>
        import("@/popup/views/home/pages/bourse/index.vue"),
      meta: {
        auth: true,
      },
    },
    {
      path: '/home/exchange-management',
      name: 'exchange-management',
      component: () => import('@/popup/views/home/pages/bourse/exchange-management.vue'),
      meta: {
        auth: true
      }
    },
    {
      path: '/home/preposition-bourse',
      name: 'prepositionBourse',
      component: () => import('@/popup/views/home/pages/bourse/perosition-bourse.vue'),
      meta: {
        auth: true
      }
    },
    {
      path: '/home/bourse',
      name: 'bourse',
      component: () => import('@/popup/views/home/pages/bourse/index.vue'),
      meta: {
        auth: true
      }
    },
    // Open a one touch Exchange page
    {
      path: "/home/miners-pledge",
      name: "minersPledge",
      component: () =>
          import("@/popup/views/home/pages/miners/index.vue"),
      meta: {
        auth: true,
      },
    },
    {
      path: "/home/miners-dealData",
      name: "minersDeal",
      component: () =>
          import("@/popup/views/home/pages/miners/deal.vue"),
      meta: {
        auth: true,
      },
    },
    // Increase the pledge amount and close the exchange
    // {
    //   path: "/home/modif-auto-exchange",
    //   name: "modifAutoExchange",
    //   component: () =>
    //     import("@/popup/views/home/pages/autoExchange/modif.vue"),
    //   meta: {
    //     auth: true,
    //   },
    // },
    // Open successful landing page
    // {
    //   path: "/home/create-exchange-success",
    //   name: "createExchangeSuccess",
    //   component: () =>
    //     import("@/popup/views/home/pages/autoExchange/success.vue"),
    //   meta: {
    //     auth: true,
    //   },
    // },
    // One key exchange legal terms
    // {
    //   path: "/home/create-exchange-articlesOfLaw",
    //   name: "createExchangeArticlesOfLaw",
    //   component: () =>
    //     import("@/popup/views/home/pages/autoExchange/articlesOfLaw.vue"),
    //   meta: {
    //     auth: true,
    //   },
    // },
    // snft list
    {
      path: "/home/coll-list",
      name: "coll-list",
      component: () => import("@/popup/views/home/pages/snft/list.vue"),
      meta: {
        auth: true,
        index: 2,
      },
    },
    // SNFT detail
    {
      path: "/home/coll-detail",
      name: "coll-detail",
      component: () => import("@/popup/views/home/pages/snft/detail.vue"),
      meta: {
        auth: true,
      },
    },
    // snft Aggregate list
    {
      path: "/home/snftcollection-step1",
      name: "snftcollection-step1",
      component: () => import("@/popup/views/home/pages/snft/collections.vue"),
      meta: {
        auth: true,
      },
    },
    // Miner pledge
    // {
    //   path: "/home/miner-pledge",
    //   name: "minerpledge",
    //   component: () =>
    //     import("@/popup/views/home/pages/minerPledge/index.vue"),
    //   meta: {
    //     auth: true,
    //   },
    // },
    {
      path: '/home/staker',
      name: 'staker',
      component: () => import('@/popup/views/home/pages/staker/staker.vue'),
      meta: {
        auth: true
      }
    },
  ],
};
