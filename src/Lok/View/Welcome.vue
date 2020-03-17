<template>
  <div class="full" ref="mounter">
    <WebGLRenderer v-if="base" :base="base" kn="renderer"></WebGLRenderer>
    <PerspectiveCamera v-if="base" :base="base" :kn="'camera'"></PerspectiveCamera>

    <!-- Controls -->
    <!-- <OrbitControls v-if="isDev && base" :base="base" :kn="'orbitControls'"></OrbitControls> -->

    <!-- Compute Intese Resources -->
    <PaintCanvas v-if="base && sdk" :sdk="sdk" :base="base" :kn="'paleCanvas'" :settings="'paint-canvas'"></PaintCanvas>
    <CubeTexture v-if="base" :base="base" :canvas="'paleCanvas'" :kn="'paleCube'"></CubeTexture>
    <CanvasTexture v-if="base" :base="base" :canvas="'paleCanvas'" :kn="'pale2DTexture'"></CanvasTexture>

    <!-- Raycaster -->
    <Raycaster v-if="base" :sdk="sdk" :base="base" :kn="'clickers'"></Raycaster>

    <!-- Scene -->
    <Scene v-if="base" :base="base" :kn="'scene'">

      <!-- Dome -->
      <SkyDome :base="base" :kn="'skydome'" :texture="'pale2DTexture'"></SkyDome>

      <!--  -->
      <O3D v-if="base && stub && screen && scroller && sdk">
        <!-- Menu -->
        <Gospel @overlay="$emit('overlay', $event)" :sdk="sdk" :scroller="scroller" :overlay="overlay" :base="base"></Gospel>
        <MenuFull @overlay="$emit('overlay', $event)" :sdk="sdk" :scroller="scroller" :overlay="overlay" :base="base"></MenuFull>

        <O3D :layout="'loklok'">
          <TextureText :text="'With Lok Lok'" @remove="$removeClick($event)" @add="$addClick($event, () => { $emit('overlay', 'menu') })" :align="'left'" :sdk="sdk" :base="base" :font="'SeasideResortNF'" :texture="'pale2DTexture'"></TextureText>
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
import Stats from 'stats.js'

const TWEEN = require('@tweenjs/tween.js').default

export default {
  components: {
    ...require('./graphics').default
  },
  data () {
    return {
      layers: {
        logo: false
      },
      overlay: '',
      stub: false,
      screen: false,
      ready: false,
      isDev: process.env.NODE_ENV === 'development',
      logs: [],
      base: false,
      sdk: false,
      // scroller: {},
      scroller: { value: 0 }
    }
  },
  created () {
  },
  async mounted () {
    this.sdk = await makeSDK()
    var stats = false
    if (this.isDev) {
      stats = new Stats()
      this.$refs.mounter.appendChild(stats.dom)
    }
    this.base = await makeBase({ stats, mounter: this.$refs['mounter'] })

    let castDown = (vm, ev, data) => {
      if (vm) {
        vm.$emit(ev, data)
        vm.$children.forEach((grandKid) => {
          castDown(grandKid, ev, data)
        })
      }
    }
    this.castDown = castDown
    this.sdk.onStubGroup('home-page', (stub) => {
      this.stub = stub
      castDown(this, 'relayout', {})
    })

    this.$on('overlay', (overlay) => {
      this.overlay = overlay
    })

    window.addEventListener('keydown', (evt) => {
      if (evt.keyCode === 27) {
        this.overlay = ''
      }
    }, false)

    this.onReady()
  },
  methods: {
    async onReady () {
      let base = this.base
      let renderer = await base.waitKN('renderer')
      let scene = await base.waitKN('scene')
      let camera = await base.waitKN('camera')

      camera.position.z = 200

      this.screen = getScreen({ camera, depth: 0.0 })
      base.onResize(() => {
        this.screen = getScreen({ camera, depth: 0.0 })
        this.castDown(this, 'relayout', {})
      })

      // let vm = this
      this.scroller = makeScroller({
        base,
        touchTarget: renderer.domElement,
        limit: {
          get canRun () {
            return true
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
        this.castDown(this, 'relayout', {})
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
