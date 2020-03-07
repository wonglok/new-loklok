<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { Object3D } from 'three'
export default {
  created () {
    this.$on('add', (v) => {
      this.object3D.add(v)
    })
    this.$on('remove', (v) => {
      this.object3D.remove(v)
    })
  },
  data () {
    return {
      object3D: new Object3D()
    }
  },
  mounted () {
    this.$parent.$emit('add', this.object3D)
  },
  beforeDestroy () {
    this.$parent.$emit('remove', this.object3D)
  }
}
</script>

<style>

</style>
