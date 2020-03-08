<template>
  <div class="full" ref="mounter">
    <WebGLRenderer v-if="base" :base="base" kn="renderer"></WebGLRenderer>
    <PerspectiveCamera v-if="base" :base="base" :kn="'camera'"></PerspectiveCamera>

    <!-- Controls -->
    <OrbitControls v-if="useOribt && base" :base="base" :kn="'orbitControls'"></OrbitControls>

    <!-- Scene -->
    <Scene v-if="base" :base="base" :kn="'scene'">
      <O3D :visible="visible" :base="base" :kn="'root'">
        <SkyDome v-if="base" :base="base" :texture="'skydome2D'" :kn="'skydome'"></SkyDome>
        <O3D :base="base" :kn="'heroSection'">
          <O3D :base="base" :kn="'ball1'">
            <ParametricRefraction v-if="base && sdk" :sdk="sdk" :base="base" :cube="'paleCube'" :setting="'parametric-1'" :kn="'parametric'"></ParametricRefraction>
          </O3D>
          <!-- <O3D :base="base" :kn="'text1'"> -->
            <CenterText :text="`WithLokLok.com`" v-if="base" :sdk="sdk" :base="base" :font="'resortFont'" :texture="'purpleCube'" :kn="'centerText'"></CenterText>
          <!-- </O3D> -->
        </O3D>
        <O3D :base="base" :kn="'page2'">
          <O3D :base="base" :kn="'underRefractorPosition'" :pz="2">
            <CenterText :text="`Happily Made...`" v-if="base" :sdk="sdk" :base="base" :font="'resortFont'" :texture="'purpleCube'" :kn="'section-2-text'"></CenterText>
          </O3D>
          <RefractionArea :base="base" :kn="'refractionArea'"></RefractionArea>
        </O3D>
      </O3D>
    </Scene>

    <!-- Compute Intese Resources -->

    <!-- Canvas2D Resource -->
    <PaintCanvas v-if="base && sdk" :sdk="sdk" :base="base" :kn="'paleCanvas'" :settings="'paint-canvas'"></PaintCanvas>
    <PaintCanvasCustom v-if="base && sdk" :sdk="sdk" :base="base" :kn="'purpleCanvas'" :settings="'paint-canvas-purple'"></PaintCanvasCustom>

    <!-- Cube Texture Resource -->
    <CubeTexture v-if="base" :base="base" :canvas="'paleCanvas'" :kn="'paleCube'"></CubeTexture>
    <CubeTexture v-if="base" :base="base" :canvas="'purpleCanvas'" :kn="'purpleCube'"></CubeTexture>

    <!-- Plane Texture Resource -->
    <CanvasTexture v-if="base" :base="base" :canvas="'paleCanvas'" :kn="'skydome2D'"></CanvasTexture>

    <!-- Font Resource -->
    <MakeFontResort v-if="base" :sdk="sdk" :base="base" :kn="'resortFont'"></MakeFontResort>
    <!-- <MakeFontLifeSaver v-if="base" :sdk="sdk" :base="base" :kn="'lifeSaverFont'"></MakeFontLifeSaver> -->

  </div>
</template>

<script>
import { makeSDK } from '../../human'
import { makeScroller } from './ReusableGraphics/Scroll.js'
import { makeBase } from './ReusableGraphics/BaseAPI.js'
import { getScreen } from './ReusableGraphics/GetScreen.js'

export default {
  components: {
    ...require('./graphics').default
  },
  data () {
    return {
      visible: false,
      useOribt: false && process.env.NODE_ENV === 'development',
      logs: [],
      base: false,
      sdk: false
    }
  },
  async mounted () {
    this.sdk = await makeSDK()
    this.base = await makeBase({ mounter: this.$refs['mounter'] })
    this.onReady()
  },
  methods: {
    async onReady () {
      let base = this.base
      let renderer = await base.waitKN('renderer')
      let scene = await base.waitKN('scene')
      let camera = await base.waitKN('camera')
      camera.position.z = 20

      let pageCount = 2
      // can scroll how many pages = limit.y
      let scroller = makeScroller({ base, touchTarget: renderer.domElement, limit: { y: pageCount } })
      let group = this.sdk.getGroup('page1-layout')
      base.loop(() => {
        let myscreen = getScreen({ camera, depth: camera.position.z })
        base.heroSection.position.z = (-scroller.value) * 30
        base.ball1.position.z = group.autoGet('ball-pos').z - 50

        base.page2.position.y = myscreen.height * 0.5 * (scroller.value - 1)

        renderer.render(scene, camera)
      })

      base.systemReady()
      setTimeout(() => {
        this.visible = true
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
