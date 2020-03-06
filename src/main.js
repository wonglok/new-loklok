import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/postcss/shared.postcss'

Vue.config.productionTip = false

let app = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

if (process.env.NODE_ENV === 'development') {
  require('./human/installer').install({ app, router })
}
