
export const install = ({ app, router }) => {
  router.addRoutes([
    {
      path: '/ui',
      component: () => import('./server-ui/TuneUI.vue')
    }
  ])
}
