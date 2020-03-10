<template>
  <div></div>
</template>
<script>
import { Refractor } from 'three/examples/jsm/objects/Refractor.js'
// import { WaterRefractionShader } from 'three/examples/jsm/shaders/WaterRefractionShader.js'
import { PlaneBufferGeometry, TextureLoader, Vector2 } from 'three'
import { BlurShader } from './BlurShader'
// import { getScreen } from '../../ReusableGraphics/GetScreen'
// import { getScreen } from '../../ReusableGraphics/GetScreen.js'

// export const visibleHeightAtZDepth = (depth, camera) => {
//   // compensate for cameras not positioned at z=0
//   const cameraOffset = camera.position.z
//   if (depth < cameraOffset) depth -= cameraOffset
//   else depth += cameraOffset

//   // vertical fov in radians
//   const vFOV = camera.fov * Math.PI / 180

//   // Math.abs to ensure the result is always positive
//   return 2 * Math.tan(vFOV / 2) * Math.abs(depth)
// }

// export const visibleWidthAtZDepth = (depth, camera) => {
//   const height = visibleHeightAtZDepth(depth, camera)
//   return height * camera.aspect
// }

export default {
  props: {
    // depth: {
    //   default: 0
    // },
    layout: {},
    color: {
      default: 0x999999
    },
    kn: {},
    screen: {
      default: false
    },
    base: {}
  },
  watch: {
    screen () {
      this.$emit('resize')
    }
  },
  async mounted () {
    let base = this.base
    let camera = await base.waitKN('camera')
    // let texture = await base.waitKN(this.texture)
    let glProxy = this.glProxy = {
      add: (v) => {
        this.$parent.$emit('add', v)
      },
      remove: (v) => {
        this.$parent.$emit('remove', v)
      }
    }

    let makeMesh = () => {
      let screen = this.screen
      let geo = new PlaneBufferGeometry(screen.width, screen.height, 2, 2)
      let mesh = new Refractor(geo, {
        color: this.color,
        textureWidth: 1024,
        textureHeight: 1024 * camera.aspect,
        shader: BlurShader
      })
      mesh.material.uniforms['tDudv'].value = new TextureLoader().load(require('./tex/waterdudv.jpg'))
      mesh.material.uniforms['resolution'].value = new Vector2(1024, 1024 * camera.aspect)
      return mesh
    }

    let mesh = false
    base.loop(() => {
      if (!mesh) {
        return
      }
      mesh.material.uniforms['time'].value = window.performance.now() * 0.001
    })
    let onRemake = () => {
      if (mesh) {
        glProxy.remove(mesh)
      }
      mesh = makeMesh()
      glProxy.add(mesh)
      base[this.kn] = mesh
    }
    this.$on('resize', onRemake)
    base.onResize(onRemake)
    this.$watch('layout', onRemake, {
      deep: true,
      immediate: true
    })

    // glProxy.add(mesh)
    console.log('done', this.kn)
  },
  async beforeDestroy () {
    let mesh = await this.base.waitKN(this.kn)
    this.glProxy.remove(mesh)
  }
}
</script>
