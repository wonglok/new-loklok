<template>
  <O3D>
    <ParametricBall v-if="paintCanvasCube"></ParametricBall>
  </O3D>
</template>

<script>
import { Tree, makePaintCanvas } from '../Reusable'
import { Scene, CubeTexture, EquirectangularReflectionMapping } from 'three'
export default {
  name: 'HappyLayout',
  components: {
    ...require('../webgl').default
  },
  mixins: [Tree],
  data () {
    return {
      scene: new Scene(),
      paintCanvasCube: false,
      layouts: {}
    }
  },
  async mounted () {
    this.scene.add(this.o3d)
    this.$emit('scene', this.scene)
    let paintCanvas = makePaintCanvas({ sdk: this.lookup('sdk'), setting: 'paint-canvas', domElement: this.lookup('touchDom'), base: this.lookup('base') })
    this.paintCanvasCube = new CubeTexture([
      paintCanvas.canvas,
      paintCanvas.canvas,
      paintCanvas.canvas,
      paintCanvas.canvas,
      paintCanvas.canvas,
      paintCanvas.canvas
    ])
    this.paintCanvasCube.mapping = EquirectangularReflectionMapping
    // this.paintCanvasCube.mapping = EquirectangularRefractionMapping
    this.scene.background = this.paintCanvasCube

    this.lookup('base').onLoop(() => {
      this.paintCanvasCube.needsUpdate = true

      let time = window.performance.now() * 0.001
      this.layouts = {
        omg: {
          px: Math.sin(time * 3.0) * 50.0,
          py: Math.sin(time * 3.0) * 50.0,
          ry: Math.sin(time * 3.0) * 3.1415,
          rz: Math.sin(time * 3.0) * 3.1415
        }
      }
    })
  },
  methods: {
  }
}
</script>

<style>

</style>
