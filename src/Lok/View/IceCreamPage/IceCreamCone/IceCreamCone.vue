<template>
  <O3D>
  </O3D>
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
    file: {},
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
    let loader = new GLTFLoader()
    loader.load(this.file, (result) => {
      // console.log(result.scene)
      result.scene.traverse(async (item) => {
        if (item.isMesh) {
          let paleCube = await this.base.waitKN('creamCube')
          var mat = new MeshBasicMaterial({ opacity: 1, transparent: true })
          // mat.map = await loadTexture(require('../Textures/demos/cat.png'))
          mat.color = new Color(`#fff`)
          mat.refractionRatio = 0.7
          mat.reflectionRatio = 0.7

          mat.envMap = paleCube
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
