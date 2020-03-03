import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/menu'
    // component: () => import(/* webpackChunkName: "home" */ '../Lok/View/Home.vue')
  },
  {
    path: '/cam',
    component: () => import(/* webpackChunkName: "home" */ '../Lok/View/Home.vue')
  },
  {
    path: '/menu',
    component: () => import(/* webpackChunkName: "home" */ '../Lok/View/Menu.vue')
  },
  {
    path: '/doi',
    component: () => import(/* webpackChunkName: "home" */ '../Lok/View/GetDomain.vue')
  },
  {
    path: '/lok',
    component: () => import(/* webpackChunkName: "lok" */ '../Lok/View/Lok.vue')
  },
  {
    path: '/depth-photo',
    component: () => import(/* webpackChunkName: "lok" */ '../Lok/View/DepthPhoto.vue')
  },
  {
    path: '/audio-visualisation',
    component: () => import(/* webpackChunkName: "lok" */ '../Lok/View/AudioVisualisation.vue')
  },
  {
    path: '/creative',
    component: () => import(/* webpackChunkName: "lok" */ '../Lok/View/CreativeLab.vue')
  },
  {
    path: '/bear',
    component: () => import(/* webpackChunkName: "voyagebear" */ '../Lok/View/VoyageBear.vue')
  },
  {
    path: '/jelly',
    component: () => import(/* webpackChunkName: "voyagebear" */ '../Lok/View/JellyStudio.vue')
  },
  {
    path: '/cascade',
    component: () => import(/* webpackChunkName: "voyagebear" */ '../Lok/View/Cascade.vue')
  },
  {
    path: '/bryant-and-jenni-2019',
    component: () => import(/* webpackChunkName: "bnj" */ '../Lok/View/BryantAndJenni2019.vue')
  },
  {
    path: '/words',
    component: () => import(/* webpackChunkName: "words" */ '../Lok/View/Words.vue')
  },
  {
    path: '/words-glowing',
    component: () => import(/* webpackChunkName: "words" */ '../Lok/View/WordsGlowing.vue')
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
