<template>
  <div></div>
</template>
<script>
// import { Refractor } from 'three/examples/jsm/objects/Refractor.js'
// import { WaterRefractionShader } from 'three/examples/jsm/shaders/WaterRefractionShader.js'
// import { CircleBufferGeometry } from 'three'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'
// import { BlurShader } from './BlurShader'
// import { getScreen } from '../../ReusableGraphics/GetScreen.js'

export default {
  props: {
    font: {},
    text: {},
    kn: {},
    depth: {
      default: 0
    },
    base: {}
  },
  async mounted () {
    // scene size
    var WIDTH = window.innerWidth
    var HEIGHT = window.innerHeight

    let base = this.base
    // let camera = await base.waitKN('camera')
    let makeFont = await base.waitKN(this.font)
    let glProxy = this.glProxy = {
      add: (v) => {
        this.$parent.$emit('add', v)
      },
      remove: (v) => {
        this.$parent.$emit('remove', v)
      }
    }

    let makeMesh = ({ geo }) => {
      var mirror = new Reflector(geo, {
        clipBias: 0.003,
        textureWidth: WIDTH * window.devicePixelRatio,
        textureHeight: HEIGHT * window.devicePixelRatio,
        color: 0x889999,
        recursion: 1
      })

      mirror.scale.x = 0.5
      mirror.scale.y = 0.5
      mirror.scale.z = 0.5

      geo.computeBoundingSphere()
      geo.computeBoundingBox()

      mirror.position.x = geo.boundingSphere.radius * -0.5
      mirror.position.y = (geo.boundingBox.min.y + geo.boundingBox.max.y) * -0.25
      mirror.needsUpdate = true
      return mirror
    }

    let mesh = false

    let onReady = ({ geo }) => {
      if (mesh) {
        glProxy.remove(mesh)
      }
      mesh = makeMesh({ geo })
      glProxy.add(mesh)
      base[this.kn] = mesh
    }
    makeFont({ text: this.text, onReady })
    console.log('mirror', this.kn)
  },
  async beforeDestroy () {
    let mesh = await this.base.waitKN(this.kn)
    this.glProxy.remove(mesh)
  }
}
</script>
