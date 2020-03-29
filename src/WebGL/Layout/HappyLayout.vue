<template>
  <O3D>
    <!-- <O3D :animated="true" layout="ball">
      <ParametricBall v-if="paintCubeTex" :tCube="paintCubeTex"></ParametricBall>
    </O3D> -->
    <O3D :animated="true" layout="cluster">
      <ParametricCluster v-if="paintCubeTex" :tCube="paintCubeTex"></ParametricCluster>
    </O3D>
    <O3D :animated="true" layout="dome">
      <SkyDome v-if="paint2DTex" :texture="paint2DTex"></SkyDome>
    </O3D>
    <O3D :animated="true" layout="cross">
      <RefactorArea dudv="cross" :blur="0.6"></RefactorArea>
    </O3D>
  </O3D>
</template>

<script>
import { Tree, makePaintCanvas, makeScroller } from '../Reusable'
import { Scene, CubeTexture } from 'three'
export default {
  name: 'HappyLayout',
  components: {
    ...require('../webgl').default
  },
  mixins: [Tree],
  data () {
    return {
      scene: new Scene(),
      paint2DTex: false,
      paintCubeTex: false,
      layouts: {}
    }
  },
  created () {
    let paintCanvas = makePaintCanvas({ pixel: 64, sdk: this.lookup('sdk'), setting: 'paint-canvas', domElement: this.lookup('touchDom'), base: this.lookup('base') })
    this.paintCubeTex = new CubeTexture([
      paintCanvas.canvas,
      paintCanvas.canvas,
      paintCanvas.canvas,
      paintCanvas.canvas,
      paintCanvas.canvas,
      paintCanvas.canvas
    ])
  },
  async mounted () {
    this.scene.add(this.o3d)
    this.$emit('scene', this.scene)
    this.scene.background = this.paintCubeTex

    this.limit = {
      canRun: true,
      y: 1
    }
    this.scroller = makeScroller({ base: this.lookup('base'), mounter: this.lookup('mounter'), limit: this.limit, onMove: () => { this.$emit('onMove') } })

    this.lookup('base').onLoop(() => {
      // let time = window.performance.now() * 0.001
      // this.paint2DTex.needsUpdate = true
      this.paintCubeTex.needsUpdate = true

      this.layouts = {
        cross: {
          py: this.scroller.value * (this.screen.height)
        },
        ball: {
          py: this.scroller.value * (this.screen.height * 0.5)
        },
        cluster: {
          pz: -200,
          rx: this.scroller.value * (Math.PI)
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
