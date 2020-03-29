<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { Tree } from '../../Reusable'
import { PlaneBufferGeometry, TextureLoader, Vector2 } from 'three'
import { Refractor } from 'three/examples/jsm/objects/Refractor'
import { FastBlurShader } from './FastBlurShader'
export default {
  name: 'RefactorArea',
  mixins: [Tree],
  props: {
    depth: {
      default: 20
    },
    blur: {},
    dudv: {},
    color: {
      default: 0x999999
    }
  },
  components: {
    ...require('../../webgl')
  },
  data () {
    return {
    }
  },
  mounted () {
    let RES_SIZE = 1024

    this.$on('init', () => {
      let camera = this.lookup('camera')
      let screen = this.getScreen(this.depth)
      let geo = new PlaneBufferGeometry(screen.width, screen.height, 20, 20)
      let item = new Refractor(geo, {
        color: this.color,
        textureWidth: RES_SIZE,
        textureHeight: RES_SIZE * camera.aspect,
        shader: FastBlurShader
      })

      if (this.dudv === 'diamond') {
        item.material.uniforms['tDudv'].value = new TextureLoader().load(require('./tex/diamond.jpg'))
      } else if (this.dudv === 'water') {
        item.material.uniforms['tDudv'].value = new TextureLoader().load(require('./tex/waterdudv.jpg'))
      } else if (this.dudv === 'cube') {
        item.material.uniforms['tDudv'].value = new TextureLoader().load(require('./tex/cube.jpg'))
      } else if (this.dudv === 'cross') {
        item.material.uniforms['tDudv'].value = new TextureLoader().load(require('./tex/cross.jpg'))
      } else if (this.dudv === 'cross-2') {
        item.material.uniforms['tDudv'].value = new TextureLoader().load(require('./tex/cross-2.jpg'))
      } else if (this.dudv === 'flower') {
        item.material.uniforms['tDudv'].value = new TextureLoader().load(require('./tex/flower.jpg'))
      }
      item.material.uniforms['resolution'].value = new Vector2(RES_SIZE, RES_SIZE * camera.aspect)

      this.o3d.children.forEach((v) => {
        this.o3d.remove(v)
      })
      this.o3d.add(item)

      this.lookup('base').onLoop(() => {
        if (item.material.uniforms['blur']) {
          item.material.uniforms['blur'].value = this.blur
        }
        item.material.uniforms['time'].value = window.performance.now() * 0.001
      })
    })
    this.$emit('init')
    this.lookup('base').onResize(() => {
      this.$emit('init')
    })
  },
  beforeDestroy () {
  }
}
</script>

<style>
</style>
