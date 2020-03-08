<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { Object3D } from 'three'
export default {
  props: {
    px: {
      default: 0
    },
    py: {
      default: 0
    },
    pz: {
      default: 0
    },

    sx: {
      default: 1
    },
    sy: {
      default: 1
    },
    sz: {
      default: 1
    },

    rx: {
      default: 0
    },
    ry: {
      default: 0
    },
    rz: {
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
    px () {
      this.object3D.position.x = this.px
    },
    py () {
      this.object3D.position.y = this.py
    },
    pz () {
      this.object3D.position.z = this.pz
    },

    rx () {
      this.object3D.rotation.x = this.rx
    },
    ry () {
      this.object3D.rotation.y = this.ry
    },
    rz () {
      this.object3D.rotation.z = this.rz
    },
    sx () {
      this.object3D.scale.x = this.sx
    },
    sy () {
      this.object3D.scale.y = this.sy
    },
    sz () {
      this.object3D.scale.z = this.sz
    }
  },
  data () {
    let object3D = new Object3D()
    object3D.visible = this.visible
    object3D.position.x = this.px
    object3D.position.y = this.py
    object3D.position.z = this.pz

    object3D.scale.x = this.sx
    object3D.scale.y = this.sy
    object3D.scale.z = this.sz

    object3D.rotation.x = this.rx
    object3D.rotation.y = this.ry
    object3D.rotation.z = this.rz
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
