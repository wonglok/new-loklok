<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { Object3D } from 'three'
export default {
  props: {
    visible: {}
  },
  created () {
    this.$on('add', (v) => {
      this.object3D.add(v)
    })
    this.$on('remove', (v) => {
      this.object3D.remove(v)
    })
  },
  watch: {
    visible () {
      this.object3D.visible = this.visible
    }
  },
  data () {
    let object3D = new Object3D()
    object3D.visible = this.visible
    return {
      object3D
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
