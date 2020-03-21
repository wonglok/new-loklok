import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    beforeEnter: (to, from, next) => {
      next('/welcome')
    }
  },
  {
    path: '/welcome',
    component: () => import(/* webpackChunkName: "home" */ '../Lok/View/Layouts/WelcomeLayout.vue')
  },
  {
    path: '/ice-cream',
    component: () => import(/* webpackChunkName: "home" */ '../Lok/View/Layouts/IceCreamLayout.vue')
  },
  {
    path: '/cam',
    component: () => import(/* webpackChunkName: "waha" */ '../Lok/View/Experiments/Cam.vue')
  },
  {
    path: '/menu',
    component: () => import(/* webpackChunkName: "waha" */ '../Lok/View/Experiments/Menu.vue')
  },
  {
    path: '/doi',
    component: () => import(/* webpackChunkName: "waha" */ '../Lok/View/Experiments/GetDomain.vue')
  },
  // {
  //   path: '/pdf',
  //   component: () => import(/* webpackChunkName: "waha" */ '../Lok/View/Experiments/PDFScanner/Layout.vue'),
  //   children: [
  //     {
  //       path: '',
  //       redirect: '/pdf/home'
  //     },
  //     {
  //       path: 'home',
  //       component: () => import(/* webpackChunkName: "waha" */ '../Lok/View/Experiments/PDFScanner/Home.vue')
  //     },
  //     {
  //       path: 'login',
  //       component: () => import(/* webpackChunkName: "waha" */ '../Lok/View/Experiments/PDFScanner/Login.vue')
  //     },
  //     {
  //       path: 'dash',
  //       component: () => import(/* webpackChunkName: "waha" */ '../Lok/View/Experiments/PDFScanner/Dashboard.vue')
  //     }
  //   ]
  // },
  {
    path: '/lok',
    component: () => import(/* webpackChunkName: "lok" */ '../Lok/View/Experiments/Lok.vue')
  },
  {
    path: '/depth-photo',
    component: () => import(/* webpackChunkName: "lok" */ '../Lok/View/Experiments/DepthPhoto.vue')
  },
  {
    path: '/audio-visualisation',
    component: () => import(/* webpackChunkName: "lok" */ '../Lok/View/Experiments/AudioVisualisation.vue')
  },
  {
    path: '/creative',
    component: () => import(/* webpackChunkName: "lok" */ '../Lok/View/Experiments/CreativeLab.vue')
  },
  {
    path: '/bear',
    component: () => import(/* webpackChunkName: "voyagebear" */ '../Lok/View/Experiments/VoyageBear.vue')
  },
  {
    path: '/jelly',
    component: () => import(/* webpackChunkName: "voyagebear" */ '../Lok/View/Experiments/JellyStudio.vue')
  },

  // {
  //   path: '/ice-cream',
  //   component: () => import(/* webpackChunkName: "voyagebear" */ '../Lok/View/Experiments/IceCream.vue')
  // },
  {
    path: '/cascade',
    component: () => import(/* webpackChunkName: "voyagebear" */ '../Lok/View/Experiments/Cascade.vue')
  },
  {
    path: '/bryant-and-jenni-2019',
    component: () => import(/* webpackChunkName: "bnj" */ '../Lok/View/Experiments/BryantAndJenni2019.vue')
  },
  {
    path: '/words',
    component: () => import(/* webpackChunkName: "words" */ '../Lok/View/Experiments/Words.vue')
  },
  {
    path: '/words-glowing',
    component: () => import(/* webpackChunkName: "words" */ '../Lok/View/Experiments/WordsGlowing.vue')
  }
]

let mode = 'history'

// if (process.env.NODE_ENV === 'development') {
//   mode = 'hash'
// }

const router = new VueRouter({
  mode,
  base: process.env.BASE_URL,
  routes
})

export default router
