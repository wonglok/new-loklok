import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: () => import(/* webpackChunkName: "home" */ '../Lok/View/Home.vue')
  },
  {
    path: '/bear',
    component: () => import(/* webpackChunkName: "home" */ '../Lok/View/VoyageBear.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
