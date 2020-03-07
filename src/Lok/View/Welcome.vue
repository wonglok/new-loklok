<template>
  <div>
    <BaseAPI @ready="base = $event; onReady({ base })"></BaseAPI>
    <WebGLRenderer v-if="base" :base="base" kn="renderer"></WebGLRenderer>
    <PerspectiveCamera v-if="base" :base="base" :kn="'camera'"></PerspectiveCamera>

    <Scene v-if="base" :base="base" :kn="'scene'">
      <SkyDome v-if="base" :base="base" :texture="'skydome2D'" :kn="'skydome'"></SkyDome>
      <O3D :visible="visible">
        <ParametricRefraction v-if="base && sdk" :sdk="sdk" :base="base" :cube="'paleCube'" :setting="'parametric-1'" :kn="'parametric'"></ParametricRefraction>
        <CenterText v-if="base" :sdk="sdk" :base="base" :font="'lifeSaverFont'" :texture="'purpleCube'" :kn="'centerText'"></CenterText>
      </O3D>
    </Scene>

    <!-- Computed Intese Resources -->
    <!-- Controls -->
    <OrbitControls v-if="isDev && base" :base="base" :kn="'orbitControls'"></OrbitControls>

    <!-- Canvas2D -->
    <PaintCanvas v-if="base && sdk" :sdk="sdk" :base="base" :kn="'paleCanvas'" :settings="'paint-canvas'"></PaintCanvas>
    <PaintCanvasCustom v-if="base && sdk" :sdk="sdk" :base="base" :kn="'purpleCanvas'" :settings="'paint-canvas-purple'"></PaintCanvasCustom>

    <!-- Cube Texture -->
    <CubeTexture v-if="base" :base="base" :canvas="'paleCanvas'" :kn="'paleCube'"></CubeTexture>
    <CubeTexture v-if="base" :base="base" :canvas="'purpleCanvas'" :kn="'purpleCube'"></CubeTexture>

    <!-- Plane Texture -->
    <CanvasTexture v-if="base" :base="base" :canvas="'paleCanvas'" :kn="'skydome2D'"></CanvasTexture>

    <!-- Font -->
    <!-- <MakeFontResort v-if="base" :sdk="sdk" :base="base" :kn="'resortFont'"></MakeFontResort> -->
    <MakeFontLifeSaver v-if="base" :sdk="sdk" :base="base" :kn="'lifeSaverFont'"></MakeFontLifeSaver>

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
      visible: false,
      isDev: false && process.env.NODE_ENV === 'development',
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

      base.loop(() => {
        renderer.render(scene, camera)
      })

      await base.waitKN('centerText')
      this.visible = true
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
