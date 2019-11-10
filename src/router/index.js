import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: () => import(/* webpackChunkName: "home" */ '../Lok/View/Home.vue')
  },
  {
    path: '/lok',
    component: () => import(/* webpackChunkName: "lok" */ '../Lok/View/Lok.vue')
  },
  {
    path: '/bear',
    component: () => import(/* webpackChunkName: "voyagebear" */ '../Lok/View/VoyageBear.vue')
  },
  {
    path: '/bryant-and-jenni-2019',
    component: () => import(/* webpackChunkName: "bnj" */ '../Lok/View/BryantAndJenni2019.vue')
  },
  {
    path: '/words',
    component: () => import(/* webpackChunkName: "words" */ '../Lok/View/Words.vue')
  }
]
let mode = 'history'
if (process.env.NODE_ENV === 'development') {
  mode = 'hash'
}
const router = new VueRouter({
  mode,
  base: process.env.BASE_URL,
  routes
})

export default router
