<template>
  <div>
  </div>
</template>

<script>
import { Object3D, CubeRefractionMapping, CubeReflectionMapping, MeshBasicMaterial, Color } from 'three'
// import { castDownEvent } from '../../ReusableGraphics/Scope.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default {
  components: {
    ...require('../../graphics').default
  },
  props: {
    cube: {},
    // file: {},
    sdk: {},
    base: {}
  },
  created () {
    this.$on('add', (v) => {
      this.o3d.add(v)
    })
    this.$on('remove', (v) => {
      this.o3d.remove(v)
    })
  },
  data () {
    return {
      proxy: {},
      stub: false,
      o3d: new Object3D()
    }
  },
  mounted () {
    let proxy = this.proxy = {
      stuff: [],
      add: (v) => {
        proxy.stuff.push(v)
        this.$emit('add', v)
        this.$parent.$emit('add', v)
      },
      clean: () => {
        proxy.stuff.forEach(proxy.remove)
      },
      remove: (v) => {
        this.$emit('remove', v)
        this.$parent.$emit('remove', v)
      }
    }
    // eslint-disable-next-line
    let file = require('file-loader!./model/ice-cream.glb')
    let loader = new GLTFLoader()
    loader.load(file, (result) => {
      // console.log(result.scene)
      result.scene.traverse(async (item) => {
        if (item.isMesh) {
          let envMap = await this.base.waitKN(this.cube)
          var mat = new MeshBasicMaterial({ opacity: 1, transparent: true })
          // mat.map = await loadTexture(require('../Textures/demos/cat.png'))
          mat.color = new Color(`#fff`)
          mat.refractionRatio = 0.7
          mat.reflectionRatio = 0.7

          mat.envMap = envMap
          mat.envMap.mapping = CubeReflectionMapping
          mat.envMap.mapping = CubeRefractionMapping
          mat.needsUpdate = true
          item.material = mat

          item.geometry.computeBoundingSphere()
          let radius = item.geometry.boundingSphere.radius
          item.position.y = radius * -0.25
          item.scale.setScalar(0.5)
          this.base.loop(() => {
            item.rotateZ(-0.046)
          })
          proxy.add(item)
          // item.material =
        }
      })
    })
  },
  beforeDestroy () {
    this.proxy.clean()
  }
}
</script>

<style>

</style>
