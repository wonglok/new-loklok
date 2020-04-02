// export const NavRow = () => import(/* webpackChunkName: "NavRow" */ './Shared/NavRow.vue')

// export const HeroUnit = () => import(/* webpackChunkName: "HeroUnit" */ './Home/HeroUnit.vue')
// export const IntroUnit = () => import(/* webpackChunkName: "IntroUnit" */ './Home/IntroUnit.vue')
// export const FeaturedCards = () => import(/* webpackChunkName: "FeaturedCards" */ './Home/FeaturedCards.vue')
// export const EffortsAndLove = () => import(/* webpackChunkName: "EffortsAndLove" */ './Home/EffortsAndLove.vue')

var path = require('path')
let exporter = {}

async function importAll (r, type) {
  r.keys().forEach(key => {
    let filename = path.basename(key).replace('.vue', '')
    exporter[filename] = () => new Promise((resolve) => {
      if (type === 'sync') {
        resolve(r(key).default)
      } else if (type === 'lazy') {
        r(key).then((mod) => {
          resolve(mod.default)
        })
      }
    })
  })
  return exporter
}

importAll(require.context('./Layout', true, /\.vue$/, 'sync'), 'sync')
importAll(require.context('./AppContent', true, /\.vue$/, 'sync'), 'sync')
importAll(require.context('./Reusable', true, /\.vue$/, 'sync'), 'sync')

export default exporter
