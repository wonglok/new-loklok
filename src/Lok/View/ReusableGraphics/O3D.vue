<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { Object3D } from 'three'
export default {
  props: {
    pz: {
      default: 0
    },
    kn: {},
    base: {},
    visible: {
      default: true
    }
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
    },
    pz () {
      this.object3D.position.z = this.pz
    }
  },
  data () {
    let object3D = new Object3D()
    object3D.visible = this.visible
    object3D.position.z = this.pz
    return {
      object3D
    }
  },
  mounted () {
    this.base[this.kn] = this.object3D
    this.$parent.$emit('add', this.object3D)
  },
  beforeDestroy () {
    this.$parent.$emit('remove', this.object3D)
  }
}
</script>

<style>

</style>
