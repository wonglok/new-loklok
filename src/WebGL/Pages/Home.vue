<template>
  <div class="full">

    <div class="full" ref="mounter"></div>
    <HappyLayout v-if="ready" layout="omg" @scene="scene = $event" @camera="camera = $event"></HappyLayout>
  </div>
</template>

<script>
import { makeSDK } from '../../human'
import { Renderer, PCamera, makeBase, Stats, Tree } from '../Reusable'
export default {
  name: 'Home',
  mixins: [Tree],
  components: {
    ...require('../webgl').default
  },
  data () {
    return {
      ready: false,
      scene: false,
      camera: false,
      base: makeBase()
    }
  },
  async mounted () {
    this.sdk = await makeSDK()
    this.mounter = this.$refs.mounter
    this.base.mounter = this.$refs.mounter

    this.renderer = new Renderer({ base: this.base, makeGIF: false })
    this.$refs.mounter.appendChild(this.renderer.domElement)
    this.touchDom = this.renderer.domElement

    // prepare camera
    this.camera = new PCamera({ base: this.base })
    this.camera.position.z = 200

    // prepare render loop
    this.base.onLoop(() => {
      if (this.scene) {
        this.renderer.render(this.scene, this.camera)
      }
    })

    // statistics
    if (process.env.NODE_ENV === 'development') {
      this.base.stats = new Stats({ mounter: this.$refs.stats })
    }

    this.base.onInit()
    this.ready = true
  },
  methods: {
  },
  beforeDestroy () {
    this.base.onClean()
  }
}
</script>

<style>

</style>
