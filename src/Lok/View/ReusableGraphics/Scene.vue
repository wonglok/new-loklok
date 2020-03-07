<template>
  <div></div>
</template>
<script>
import { Scene } from 'three'
export default {
  props: {
    kn: {},
    base: {}
  },
  mounted () {
    let scene = new Scene()
    this.$emit('scene', scene)
    this.base[this.kn] = scene
  }
}
</script>
