<template>
  <div></div>
</template>
<script>
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
export default {
  props: {
    // canvas: {},
    kn: {},
    base: {}
  },
  async mounted () {
    let base = this.base
    let camera = await this.base.waitKN('camera')
    let renderer = await this.base.waitKN('renderer')
    let controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    base.loop(() => {
      controls.update()
    })
    // let ct = await this.base.waitKN(this.canvas)
    // let texture = new CanvasTexture(ct)
    // this.base.loop(() => {
    //   texture.needsUpdate = true
    // })
    // this.base[this.kn] = texture
  }
}
</script>
