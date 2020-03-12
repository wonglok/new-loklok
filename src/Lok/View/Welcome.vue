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
    <!-- <CubeTexture v-if="base" :base="base" :canvas="'paleCanvas'" :kn="'paleCube'"></CubeTexture> -->
    <CubeTexture v-if="base" :base="base" :canvas="'purpleCanvas'" :kn="'purpleCube'"></CubeTexture>

    <!-- <BridgeMap v-if="base" :base="base" :kn="'photoCube'"></BridgeMap> -->
    <ProtossCube v-if="base" :base="base" :kn="'protossCube'"></ProtossCube>
    <!-- <BeachCube v-if="base" :base="base" :kn="'beachCube'"></BeachCube> -->
    <!-- <LimeCube v-if="base" :base="base" :kn="'limeCube'"></LimeCube>
    <PurpleCube v-if="base" :base="base" :kn="'purpleBallCube'"></PurpleCube> -->

    <!-- Plane Texture Resource -->
    <CanvasTexture v-if="base" :base="base" :canvas="'paleCanvas'" :kn="'pale2DTexture'"></CanvasTexture>
    <CanvasTexture v-if="base" :base="base" :canvas="'purpleCanvas'" :kn="'purple2DTexture'"></CanvasTexture>

    <!-- Font Resource -->
    <!-- <MakeFontResort v-if="base" :sdk="sdk" :base="base" :kn="'resortFont'"></MakeFontResort> -->
    <!-- <MakeFontLifeSaver v-if="base" :sdk="sdk" :base="base" :kn="'lifeSaverFont'"></MakeFontLifeSaver> -->

    <!-- Raycaster -->
    <Raycaster v-if="base" :sdk="sdk" :base="base" :kn="'clickers'"></Raycaster>

    <!-- Scene -->
    <Scene v-if="base" :base="base" :kn="'scene'">
      <!-- Menu -->
      <O3D :py="menuAnimator.value * 20">
        <O3D v-if="screen && layout" :screen="screen" :layout="layout['nav-menu']">
          <TextureText @remove="$removeClick($event)" @add="$addClick($event, () => { menuAnimator.value = 1; scroller.value = 0.0 })" :align="'left'" :screen="screen" :font="'SeasideResortNF'" :text="'MENU'" :sdk="sdk" :base="base" :texture="'purple2DTexture'" :kn="'section-2-text'"></TextureText>
        </O3D>
      </O3D>

      <!-- Logo -->
      <O3D v-if="screen && layout" :screen="screen" :layout="layout['nav-withloklok']">
        <TextureText @remove="$removeClick($event)" @add="$addClick($event, () => {  })" :align="'left'" :screen="screen" :font="'SeasideResortNF'" :text="'With Lok Lok'" :sdk="sdk" :base="base" :texture="'purple2DTexture'" :kn="'wihtloklok-text'"></TextureText>
      </O3D>

      <O3D v-if="screen && layout" :screen="screen" :layout="layout['nav-thx-gospel']">
        <O3D :py="(scroller.value) * -5 + 0.0">
          <O3D :py="(menuAnimator.value) * -5 + 0.00001">
            <TextureText @remove="$removeClick($event)" @add="$addClick($event, () => { scroller.value = 1 })" :align="'left'" :screen="screen" :font="'SeasideResortNF'" :text="'Than you Gospel'" :sdk="sdk" :base="base" :texture="'purple2DTexture'" :kn="'wihtloklok-text'"></TextureText>
          </O3D>
        </O3D>
        <O3D :py="(1.0 - scroller.value) * -5 + 0.0">
          <TextureText @remove="$removeClick($event)" @add="$addClick($event, () => { scroller.value = 0.0 })" :align="'left'" :screen="screen" :font="'SeasideResortNF'" :text="'Close'" :sdk="sdk" :base="base" :texture="'purple2DTexture'" :kn="'wihtloklok-text'"></TextureText>
        </O3D>
      </O3D>

      <!-- Dome -->
      <SkyDome :base="base" :texture="'pale2DTexture'" :kn="'skydome'"></SkyDome>

      <!-- Menu -->
      <MenuGL @close="menuAnimator.value = 0.0" :menu="menuAnimator" v-if="base && screen && sdk && layout" :layout="layout" :screen="screen" :sdk="sdk" :base="base" ></MenuGL>

      <O3D>
        <O3D :layout="layout['baller']">
          <O3D :pz="(-scroller.value + -0.1) * 90.0">
            <!-- Baller -->
            <ParametricBaller v-if="base" :sdk="sdk" :base="base" :cube="'protossCube'" :setting="'parametric-1'" :kn="'parametric'"></ParametricBaller>
          </O3D>
        </O3D>
        <!-- <GeoText :text="`WONG LOK`" :sdk="sdk" :base="base" :font="'resortFont'" :texture="'purpleCube'" :kn="'ball-slogan'"></GeoText> -->
        <!-- <GeoText :text="`WithLokLok.com`" :sdk="sdk" :base="base" :font="'resortFont'" :texture="'purpleCube'" :kn="'centerText'"></GeoText> -->
      </O3D>

      <O3D v-if="screen">

        <O3D :py="screen.height * 1.0 * scroller.value">
          <O3D :py="screen.height * -1">
            <!-- Group the bible -->
            <O3D v-if="screen && layout" :screen="screen" :layout="layout['gospel']">
              <TextureText :align="'left'" :screen="screen" :text="favouriteVerses" :sdk="sdk" :base="base" :font="'resortFont'" :texture="'purple2DTexture'" :kn="'section-2-text'"></TextureText>
            </O3D>
            <O3D>
              <PlaneArea :screen="screen" :base="base" :kn="'refractionArea'" :layout="layout" :color="layout['gospel-layer-color']"></PlaneArea>
              <!-- <RefractionArea :screen="screen" :base="base" :kn="'refractionArea'" :layout="layout" :color="layout['gospel-layer-color']"></RefractionArea> -->
            </O3D>
          </O3D>
        </O3D>

      </O3D>

    </Scene>

  </div>
</template>

<script>
// import Vue from 'vue'
import { makeSDK } from '../../human'
import { makeScroller } from './ReusableGraphics/Scroll.js'
import { makeBase } from './ReusableGraphics/BaseAPI.js'
import { getScreen } from './ReusableGraphics/GetScreen.js'
import { Damper } from './ReusableGraphics/Damper.js'
const TWEEN = require('@tweenjs/tween.js').default

export default {
  components: {
    ...require('./graphics').default
  },
  data () {
    return {
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
      // scroller: {},
      menuAnimator: { value: 0 },
      scroller: { value: 0 }
    }
  },
  created () {
    this.$on('get-base', (vm) => {
      vm['base'] = this.base
    })
  },
  async mounted () {
    this.sdk = await makeSDK()
    this.base = await makeBase({ mounter: this.$refs['mounter'] })
    this.sdk.onStubGroup('page1-layout', (stub) => {
      this.layout = stub
    })
    this.onReady()
    this.menuAnimator = new Damper(0, this.base)
    // this.scroller = new Damper(0, this.base)
  },
  methods: {
    async onReady () {
      let base = this.base
      let renderer = await base.waitKN('renderer')
      let scene = await base.waitKN('scene')
      let camera = await base.waitKN('camera')

      camera.position.z = 100

      this.screen = getScreen({ camera, depth: 0.0 })
      base.onResize(() => {
        this.screen = getScreen({ camera, depth: 0.0 })
      })

      let vm = this
      this.base.scroller = this.scroller = makeScroller({
        base,
        touchTarget: renderer.domElement,
        limit: {
          get canRun () {
            return vm.menuAnimator.value < 0.3
          },
          y: 1
        }
      })

      base.loop(() => {
        TWEEN.update()
        renderer.render(scene, camera)
      })

      base.systemReady()

      setTimeout(() => {
        this.ready = true
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
