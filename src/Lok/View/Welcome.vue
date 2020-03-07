<template>
  <div>
    <BaseAPI @ready="base = $event; onReady({ base })"></BaseAPI>
    <WebGLRenderer v-if="base" :base="base" kn="renderer"></WebGLRenderer>
    <PerspectiveCamera v-if="base" :base="base" :kn="'camera'"></PerspectiveCamera>
    <Scene v-if="base" :base="base" :kn="'scene'"></Scene>
    <OrbitControls v-if="base" :base="base" :kn="'orbitControls'"></OrbitControls>
    <PaintCanvas v-if="base && sdk" :sdk="sdk" :base="base" :kn="'paintCanvas'" :settings="'paint-canvas'"></PaintCanvas>
    <PaintCanvasCustom v-if="base && sdk" :sdk="sdk" :base="base" :kn="'paintCanvasPurple'" :settings="'paint-canvas-purple'"></PaintCanvasCustom>
    <CubeTexture v-if="base" :base="base" :canvas="'paintCanvasPurple'" :kn="'paintingCubeTexture'"></CubeTexture>
    <CanvasTexture v-if="base" :base="base" :canvas="'paintCanvas'" :kn="'paintingTexture'"></CanvasTexture>
    <SphereSkyDome v-if="base" :base="base" :texture="'paintingTexture'" :kn="'skydome'"></SphereSkyDome>
    <MakeFontResort v-if="base" :sdk="sdk" :base="base" :kn="'makeFontResort'"></MakeFontResort>
    <CenterText v-if="base" :sdk="sdk" :base="base" :font="'makeFontResort'" :texture="'paintingCubeTexture'" :kn="'centerText'"></CenterText>

    <!-- Welcome :D
    <pre :key="kn" v-for="(log, kn) in logs">{{ JSON.stringify(log) }}</pre> -->
  </div>
</template>

<script>
import { makeSDK } from '../../human'
export default {
  components: {
    ...require('./graphics').default
  },
  data () {
    return {
      logs: [],
      base: false,
      sdk: false
    }
  },
  async mounted () {
    this.sdk = await makeSDK()
    // this.camera.asdasd

    // let group = this.sdk.getGroup('test')

    // let assign = (obj, key) => (val) => {
    //   obj[key] = val
    // }

    // group.autoPulse('k0', console.log)
    // group.autoPulse('k1', console.log)
    // group.autoPulse('k2', console.log)
    // group.autoPulse('k3', console.log)
    // group.autoPulse('k4', console.log)
    // group.autoPulse('k5', console.log)
    // group.autoPulse('k6', console.log)

    // let groupOne = this.sdk.getGroup('group1')
    // let k1 = groupOne.get('k1')
    // this.log(k1)
    // groupOne.pulse('k1', () => {
    //   this.log(groupOne.get('k1'))
    // })
  },
  methods: {
    async onReady ({ base }) {
      let renderer = await base.waitKN('renderer')
      let scene = await base.waitKN('scene')
      let camera = await base.waitKN('camera')
      camera.position.z = 20

      // let paintCanvas = await base.waitKN('paintCanvas')

      // scene.background = paintCanvas

      base.loop(() => {
        renderer.render(scene, camera)
      })

      console.log('Running')
    },
    log (v) {
      this.logs.unshift(v)
      this.logs = this.logs.slice(0, 50)
    }
  }
}
</script>

<style>

</style>
