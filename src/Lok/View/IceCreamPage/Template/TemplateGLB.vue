<template>
  <O3D>
  </O3D>
</template>

<script>
import { Object3D } from 'three'
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
      stub: false,
      o3d: new Object3D()
    }
  },
  mounted () {
    let loader = new GLTFLoader()
    loader.load(this.file, (result) => {
      console.log(result.scene)
      this.o3d.add(result.scene)
    })

    this.$parent.$emit('add', this.o3d)
  },
  beforeDestroy () {
    this.$parent.$emit('remove', this.o3d)
  }
}
</script>

<style>

</style>
