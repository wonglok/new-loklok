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
    <O3D>
      <TextureText font="Arial" align="left" :text="gospel"></TextureText>
    </O3D>
    <O3D :animated="true" layout="cross">
      <RefactorArea dudv="cross-2" :depth="0" :blur="0.95"></RefactorArea>
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
      gospel: `Love is patient and kind;
love does not envy or boast;
It is not arrogant or rude.
It does not insist on its own way;
It is not irritable or resentful;
It does not rejoice at wrongdoing,
but rejoices with the truth.
Love bears all things,
believes all things,
hopes all things,
endures all things.
Love never ends.

1 Corinthians 13:4–8a`,
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
          pz: 20,
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
