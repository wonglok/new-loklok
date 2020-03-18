<template>
  <div><slot></slot></div>
</template>
<script>
import { Scene } from 'three'
export default {
  props: {
    kn: {},
    base: {}
  },
  created () {
    this.$on('add', (v) => {
      this.scene.add(v)
    })
    this.$on('remove', (v) => {
      this.scene.remove(v)
    })
  },
  data () {
    return {
      scene: new Scene()
    }
  },
  mounted () {
    this.base[this.kn] = this.scene
    this.$emit('scene', this.scene)
  }
}
</script>
