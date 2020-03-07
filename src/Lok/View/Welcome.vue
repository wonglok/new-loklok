<template>
  <div class="full" ref="mounter">
    <WebGLRenderer v-if="base" :base="base" kn="renderer"></WebGLRenderer>
    <PerspectiveCamera v-if="base" :base="base" :kn="'camera'"></PerspectiveCamera>

    <Scene v-if="base" :base="base" :kn="'scene'">
      <SkyDome v-if="base" :base="base" :texture="'skydome2D'" :kn="'skydome'"></SkyDome>
      <ParametricRefraction v-if="base && sdk" :sdk="sdk" :base="base" :cube="'paleCube'" :setting="'parametric-1'" :kn="'parametric'"></ParametricRefraction>
      <CenterText v-if="base" :sdk="sdk" :base="base" :font="'resortFont'" :texture="'purpleCube'" :kn="'centerText'"></CenterText>
    </Scene>

    <!-- Computed Intese Resources -->
    <!-- Controls -->
    <OrbitControls v-if="useOribt && base" :base="base" :kn="'orbitControls'"></OrbitControls>

    <!-- Canvas2D -->
    <PaintCanvas v-if="base && sdk" :sdk="sdk" :base="base" :kn="'paleCanvas'" :settings="'paint-canvas'"></PaintCanvas>
    <PaintCanvasCustom v-if="base && sdk" :sdk="sdk" :base="base" :kn="'purpleCanvas'" :settings="'paint-canvas-purple'"></PaintCanvasCustom>

    <!-- Cube Texture -->
    <CubeTexture v-if="base" :base="base" :canvas="'paleCanvas'" :kn="'paleCube'"></CubeTexture>
    <CubeTexture v-if="base" :base="base" :canvas="'purpleCanvas'" :kn="'purpleCube'"></CubeTexture>

    <!-- Plane Texture -->
    <CanvasTexture v-if="base" :base="base" :canvas="'paleCanvas'" :kn="'skydome2D'"></CanvasTexture>

    <!-- Font -->
    <MakeFontResort v-if="base" :sdk="sdk" :base="base" :kn="'resortFont'"></MakeFontResort>
    <!-- <MakeFontLifeSaver v-if="base" :sdk="sdk" :base="base" :kn="'lifeSaverFont'"></MakeFontLifeSaver> -->

    <!-- Welcome :D
    <pre :key="kn" v-for="(log, kn) in logs">{{ JSON.stringify(log) }}</pre> -->
  </div>
</template>

<script>
import { makeSDK } from '../../human'
// import { makeScroller } from './ReusableGraphics/Scroll.js'
import { makeBase } from './ReusableGraphics/BaseAPI.js'

export default {
  components: {
    ...require('./graphics').default
  },
  data () {
    return {
      visible: true,
      useOribt: true && process.env.NODE_ENV === 'development',
      logs: [],
      base: false,
      sdk: false
    }
  },
  async mounted () {
    this.base = await makeBase({ mounter: this.$refs['mounter'] })
    this.sdk = await makeSDK()
    this.$nextTick(this.onReady)
  },
  methods: {
    onReady () {
      let base = this.base
      let renderer = base.renderer
      let scene = base.scene
      let camera = base.camera
      camera.position.z = 20

      // let scroller = makeScroller({ base, touchTarget: renderer.domElement })

      base.loop(() => {
        // base.page1.position.y = scroller.value * 20.0
        // base.ball1.scale.x = Math.max((1.0 - scroller.value), 0.0) / 1
        // base.ball1.scale.y = Math.max((1.0 - scroller.value), 0.0) / 1
        // base.ball1.scale.z = Math.max((1.0 - scroller.value), 0.0) / 1
        renderer.render(scene, camera)
      })
    },
    log (v) {
      this.logs.unshift(v)
      this.logs = this.logs.slice(0, 50)
    }
  },
  beforeDestroy () {
    this.base.destroy()
  }
}
</script>

<style scoped>
.full{
  width: 100%;
  height: 100%;
}
</style>
