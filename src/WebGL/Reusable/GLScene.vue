<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { Scene } from 'three'
import { Tree } from '../Reusable'
export default {
  name: 'GLScene',
  mixins: [Tree],
  data () {
    return {
      scene: new Scene()
    }
  },
  mounted () {
    this.$emit('scene', this.scene)
    this.scene.add(this.o3d)
  },
  created () {
  },
  beforeDestroy () {
  }
}
</script>

<style>

</style>
