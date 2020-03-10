<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { Object3D, Vector3 } from 'three'
import { Parser } from 'expr-eval'
// import { getScreen } from './GetScreen'
// npm install expr-eval

export default {
  props: {
    mode: {},
    screen: {},
    layout: {},
    scroller: {},

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
      this.$emit('onadd')
    })
    this.$on('remove', (v) => {
      this.object3D.remove(v)
      this.$emit('onremove')
    })
  },
  watch: {
    visible () {
      this.object3D.visible = this.visible
    },

    layout () {
      this.sync(this.object3D)
    },
    screen () {
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
  computed: {
    rect () {
      return this.screen
    },
    padding () {
      let val = 0
      try {
        val = Parser.evaluate(`0.005 * rect.min`, this)
      } catch (e) {
        console.log(e)
      }
      return val
    },
    right () {
      let val = 0
      try {
        val = Parser.evaluate(`rect.width * 0.5 - scaleX * width * 0.5 - padding`, this)
      } catch (e) {
        console.log(e)
      }
      return val
    },
    left () {
      let val = 0
      try {
        val = Parser.evaluate(`rect.width * -0.5 + scaleX * width * 0.5 + padding`, this)
      } catch (e) {
        console.log(e)
      }
      return val
    },
    top () {
      let val = 0
      try {
        val = Parser.evaluate(`rect.height * 0.5 + scaleY * height * -0.5 - padding`, this)
      } catch (e) {
        console.log(e)
      }
      return val
    },
    bottom () {
      let val = 0
      try {
        val = Parser.evaluate(`rect.height * -0.5 + scaleY * height * 1 - padding`, this)
      } catch (e) {
        console.log(e)
      }
      return val
    }
  },
  data () {
    let object3D = new Object3D()
    return {
      world: new Vector3(),
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
      width: 1,
      height: 1,
      depth: 0,
      radius: 1,
      object3D
    }
  },
  methods: {
    sync (object3D) {
      object3D.visible = this.visible
      this.object3D.getWorldPosition(this.world)

      let run = (fnc) => {
        try {
          fnc()
        } catch (e) {
          console.log(e)
        }
      }
      if (this.layout) {
        run(() => { this.scaleX = object3D.scale.x = Parser.evaluate(this.layout.fsx || '1', this) })
        run(() => { this.scaleY = object3D.scale.y = Parser.evaluate(this.layout.fsy || '1', this) })
        run(() => { this.scaleZ = object3D.scale.z = Parser.evaluate(this.layout.fsz || '1', this) })

        run(() => { object3D.position.x = Parser.evaluate(this.layout.fpx || '0', this) })
        run(() => { object3D.position.y = Parser.evaluate(this.layout.fpy || '0', this) })
        run(() => { object3D.position.z = Parser.evaluate(this.layout.fpz || '0', this) })

        run(() => { object3D.rotation.x = Parser.evaluate(this.layout.frx || '0', this) })
        run(() => { object3D.rotation.y = Parser.evaluate(this.layout.fry || '0', this) })
        run(() => { object3D.rotation.z = Parser.evaluate(this.layout.frz || '0', this) })

        console.log('layout-update', JSON.stringify(this.layout))
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
    if (this.kn && this.base) {
      this.base[this.kn] = this.object3D
    }
    this.$parent.$emit('add', this.object3D)
  },
  beforeDestroy () {
    this.$parent.$emit('remove', this.object3D)
  }
}
</script>

<style>

</style>
