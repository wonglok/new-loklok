<template>
  <div class="full" ref="mounter">
    <WebGLRenderer v-if="base" :base="base" kn="renderer"></WebGLRenderer>
    <PerspectiveCamera v-if="base" :base="base" :kn="'camera'"></PerspectiveCamera>

    <!-- Controls -->
    <OrbitControls v-if="useOribt && base" :base="base" :kn="'orbitControls'"></OrbitControls>

    <!-- Compute Intese Resources -->
    <!-- Canvas2D Resource -->
    <PaintCanvas v-if="base && sdk" :sdk="sdk" :base="base" :kn="'paleCanvas'" :settings="'paint-canvas'"></PaintCanvas>
    <PaintCanvasCustom v-if="base && sdk" :sdk="sdk" :base="base" :kn="'purpleCanvas'" :settings="'paint-canvas-purple'"></PaintCanvasCustom>

    <!-- Cube Texture Resource -->
    <CubeTexture v-if="base" :base="base" :canvas="'paleCanvas'" :kn="'paleCube'"></CubeTexture>
    <CubeTexture v-if="base" :base="base" :canvas="'purpleCanvas'" :kn="'purpleCube'"></CubeTexture>

    <!-- Plane Texture Resource -->
    <CanvasTexture v-if="base" :base="base" :canvas="'paleCanvas'" :kn="'pale2DTexture'"></CanvasTexture>
    <CanvasTexture v-if="base" :base="base" :canvas="'purpleCanvas'" :kn="'purple2DTexture'"></CanvasTexture>

    <!-- Font Resource -->
    <MakeFontResort v-if="base" :sdk="sdk" :base="base" :kn="'resortFont'"></MakeFontResort>
    <!-- <MakeFontLifeSaver v-if="base" :sdk="sdk" :base="base" :kn="'lifeSaverFont'"></MakeFontLifeSaver> -->

    <!-- Raycaster -->
    <Raycaster v-if="base" :sdk="sdk" :base="base" :kn="'clickers'"></Raycaster>

    <!-- Scene -->
    <Scene v-if="base" :base="base" :kn="'scene'">
      <!-- Brand -->
      <!-- <O3D v-if="screen && layout" :screen="screen" :layout="layout['nav-topleft']" :base="base" :kn="'topnav-l'">
        <GeoText :text="`withloklok.com`" :sdk="sdk" :base="base" :font="'resortFont'" :texture="'purpleCube'" :kn="'nav-slogan'"></GeoText>
      </O3D> -->

      <!-- Thank you -->
      <!-- <O3D v-if="screen && layout" :screen="screen" :layout="layout['nav-topright']" :base="base" :kn="'topnav-r'">
        <TextureText v-if="screen" @remove="$removeClick($event)" @add="$addClick($event, () => {})" :align="'left'" :screen="screen" :font="'SeasideResortNF'" :text="'Thank you Gospel'" :sdk="sdk" :base="base" :texture="'pale2DTexture'" :kn="'section-2-text'"></TextureText>
      </O3D> -->

      <!-- Hamburger Menu -->
      <O3D v-if="screen && layout" :screen="screen" :layout="layout['nav-menu']" :base="base" :kn="'nav-menu'">
        <TextureText :visible="!openMenu" @remove="$removeClick($event)" @add="$addClick($event, () => { if (!openMenu) { openMenu = true; $forceUpdate() } })" :align="'left'" :screen="screen" :font="'SeasideResortNF'" :text="'MENU'" :sdk="sdk" :base="base" :texture="'purple2DTexture'" :kn="'section-2-text'"></TextureText>
      </O3D>

      <!-- With Lok Lok Menu -->
      <O3D v-if="screen && layout" :screen="screen" :layout="layout['nav-withloklok']" :base="base" :kn="'nav-withloklok-'">
        <TextureText @remove="$removeClick($event)" @add="$addClick($event, () => {  })" :align="'left'" :screen="screen" :font="'SeasideResortNF'" :text="'With Lok Lok'" :sdk="sdk" :base="base" :texture="'purple2DTexture'" :kn="'wihtloklok-text'"></TextureText>
      </O3D>

      <!-- With Lok Lok Menu -->
      <O3D v-if="screen && layout" :screen="screen" :layout="layout['nav-thx-gospel']" :base="base" :kn="'nav-withloklok-'">
        <TextureText @remove="$removeClick($event)" @add="$addClick($event, () => { scroller.value = 1 })" :align="'left'" :screen="screen" :font="'SeasideResortNF'" :text="'Swipe Up'" :sdk="sdk" :base="base" :texture="'purple2DTexture'" :kn="'wihtloklok-text'"></TextureText>
      </O3D>

      <!-- Dome -->
      <SkyDome :base="base" :texture="'pale2DTexture'" :kn="'skydome'"></SkyDome>

      <!-- Menu -->
      <MenuGL @close="openMenu = false" :open="openMenu" v-if="base && screen && sdk && layout" :layout="layout" :screen="screen" :sdk="sdk" :base="base" ></MenuGL>

      <O3D :base="base" :kn="'zoomSection'">
        <O3D :layout="layout['baller']">
          <ParametricBaller v-if="base" :sdk="sdk" :base="base" :cube="'paleCube'" :setting="'parametric-1'" :kn="'parametric'"></ParametricBaller>
        </O3D>
        <!-- <GeoText :text="`WONG LOK`" :sdk="sdk" :base="base" :font="'resortFont'" :texture="'purpleCube'" :kn="'ball-slogan'"></GeoText> -->
        <!-- <GeoText :text="`WithLokLok.com`" :sdk="sdk" :base="base" :font="'resortFont'" :texture="'purpleCube'" :kn="'centerText'"></GeoText> -->
      </O3D>

      <O3D :base="base" :kn="'scrollSection'" v-if="screen">
        <!-- Page2 -->
        <O3D :py="screen.height * -1">
          <!-- Group the bible -->
          <O3D v-if="screen && layout" :screen="screen" :layout="layout['gospel']">
            <TextureText :align="'left'" :screen="screen" :text="favouriteVerses" :sdk="sdk" :base="base" :font="'resortFont'" :texture="'purple2DTexture'" :kn="'section-2-text'"></TextureText>
          </O3D>
          <O3D>
            <RefractionArea :screen="screen" :base="base" :kn="'refractionArea'"></RefractionArea>
          </O3D>
        </O3D>
      </O3D>

    </Scene>

  </div>
</template>

<script>
import Vue from 'vue'
import { makeSDK } from '../../human'
import { makeScroller } from './ReusableGraphics/Scroll.js'
import { makeBase } from './ReusableGraphics/BaseAPI.js'
import { getScreen } from './ReusableGraphics/GetScreen.js'
const TWEEN = require('@tweenjs/tween.js').default

export default {
  components: {
    ...require('./graphics').default
  },
  data () {
    return {
      openMenu: false,
      favouriteVerses: `Love is patient and kind;
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
      layout: false,
      screen: false,
      ready: false,
      useOribt: false && process.env.NODE_ENV === 'development',
      logs: [],
      base: false,
      sdk: false,
      scroller: {}
    }
  },
  async mounted () {
    this.sdk = await makeSDK()
    this.base = await makeBase({ mounter: this.$refs['mounter'] })
    this.sdk.onStubGroup('page1-layout', (stub) => {
      this.layout = stub
    })
    this.onReady()
  },
  methods: {
    async onReady () {
      let base = this.base
      let renderer = await base.waitKN('renderer')
      let scene = await base.waitKN('scene')
      let camera = await base.waitKN('camera')

      camera.position.z = 100

      Vue.prototype.$currentCamera = camera

      this.screen = getScreen({ camera, depth: 0.0 })
      base.onResize(() => {
        this.screen = getScreen({ camera, depth: 0.0 })
        // this.$forceUpdate()
      })

      // can scroll how many pages = limit.y
      let scroller = this.scroller = makeScroller({ base, touchTarget: renderer.domElement, limit: { canRun: true, y: 1 } })
      // let group = this.sdk.getGroup('page1-layout')
      // // this.layout = group
      // group.autoPulse('ball-pos', (v) => {
      //   base.ball1.position.z = v.z - 50
      // })

      base.loop(() => {
        TWEEN.update()

        base.zoomSection.position.z = (-scroller.value + -0.1) * 90.0
        base.scrollSection.position.y = (this.screen.height * (1)) * (scroller.value)

        renderer.render(scene, camera)
      })

      base.systemReady()

      setTimeout(() => {
        this.ready = true
        // this.openMenu = true
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
