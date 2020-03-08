<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { Object3D } from 'three'
import { Parser } from 'expr-eval'
// npm install expr-eval

// import * as THREE from 'three'
export default {
  props: {
    mode: {},
    screen: {},
    layout: {},

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
    this.$on('size', (v) => {
      this.width = v.width
      this.height = v.height
      this.depth = v.depth
      this.radius = v.radius
      this.sync(this.object3D)
    })
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

    layout () {
      this.sync(this.object3D)
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
    return {
      width: 1,
      height: 1,
      depth: 1,
      radius: 1,
      object3D
    }
  },
  methods: {
    sync (object3D) {
      object3D.visible = this.visible

      let run = (fnc) => {
        try {
          fnc()
        } catch (e) {
          console.log(e)
        }
      }
      if (this.layout) {
        run(() => { object3D.position.x = Parser.evaluate(this.layout.fpx || '0', this) })
        run(() => { object3D.position.y = Parser.evaluate(this.layout.fpy || '0', this) })
        run(() => { object3D.position.z = Parser.evaluate(this.layout.fpz || '0', this) })

        run(() => { object3D.rotation.x = Parser.evaluate(this.layout.frx || '0', this) })
        run(() => { object3D.rotation.y = Parser.evaluate(this.layout.fry || '0', this) })
        run(() => { object3D.rotation.z = Parser.evaluate(this.layout.frz || '0', this) })

        run(() => { object3D.scale.x = Parser.evaluate(this.layout.fsx || '1', this) })
        run(() => { object3D.scale.y = Parser.evaluate(this.layout.fsy || '1', this) })
        run(() => { object3D.scale.z = Parser.evaluate(this.layout.fsz || '1', this) })

        console.log(this.kn, JSON.stringify(this.layout))
      } else {
        object3D.position.x = this.px
        object3D.position.y = this.py
        object3D.position.z = this.pz

        object3D.scale.x = this.sx
        object3D.scale.y = this.sy
        object3D.scale.z = this.sz

        object3D.rotation.x = this.rx
        object3D.rotation.y = this.ry
        object3D.rotation.z = this.rz
      }
    }
  },
  mounted () {
    this.sync(this.object3D)
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
