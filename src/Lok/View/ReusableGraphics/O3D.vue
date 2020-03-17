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
    // mode: {},
    // screen: {},
    // scroller: {},

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
    visible: {
      default: true
    }
  },

  watch: {
    visible () {
      this.object3D.visible = this.visible
    },

    layout () {
      this.sync()
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
    // rect () {
    //   return this.screen
    // },
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
      layoutObj: false,
      stub: false,
      time: 0,
      base: false,
      world: new Vector3(),
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
      width: 1,
      height: 1,
      depth: 0,
      radius: 1,
      object3D,
      ...Math
    }
  },
  methods: {
    sync () {
      let looker = (parent, key, target) => {
        if (parent[key]) {
          target[key] = parent[key]
        } else {
          let gradParent = parent.$parent
          if (gradParent) {
            looker(gradParent, key, target)
          }
        }
      }
      looker(this.$parent, 'base', this)
      looker(this.$parent, 'screen', this)
      looker(this.$parent, 'stub', this)

      this.rect = this.screen || {}

      let object3D = this.object3D
      if (this.stub && this.layout) {
        this.layoutObj = this.stub[this.layout]
      }

      object3D.visible = this.visible

      let run = (fnc) => {
        try {
          fnc()
        } catch (e) {
          console.log(e)
        }
      }
      object3D.position.x = this.px
      object3D.position.y = this.py
      object3D.position.z = this.pz

      object3D.scale.x = this.sx
      object3D.scale.y = this.sy
      object3D.scale.z = this.sz

      object3D.rotation.x = this.rx
      object3D.rotation.y = this.ry
      object3D.rotation.z = this.rz

      if (this.layout && this.layoutObj) {
        // this.time = window.performance.now() * 0.001

        run(() => { object3D.rotation.x = Parser.evaluate(this.layoutObj.frx || '0', this) })
        run(() => { object3D.rotation.y = Parser.evaluate(this.layoutObj.fry || '0', this) })
        run(() => { object3D.rotation.z = Parser.evaluate(this.layoutObj.frz || '0', this) })

        run(() => { this.scaleX = object3D.scale.x = Parser.evaluate(this.layoutObj.fsx || '1', this) })
        run(() => { this.scaleY = object3D.scale.y = Parser.evaluate(this.layoutObj.fsy || '1', this) })
        run(() => { this.scaleZ = object3D.scale.z = Parser.evaluate(this.layoutObj.fsz || '1', this) })

        run(() => { object3D.position.x = Parser.evaluate(this.layoutObj.fpx || '0', this) })
        run(() => { object3D.position.y = Parser.evaluate(this.layoutObj.fpy || '0', this) })
        run(() => { object3D.position.z = Parser.evaluate(this.layoutObj.fpz || '0', this) })

        // console.log('layout-update', JSON.stringify(this.layoutObj))
      } else if (this.layout && !this.layoutObj) {
        console.log(this.layout, 'not found stub / layout')
        setTimeout(() => {
          this.$emit('retry')
        }, 100)
      }
    }
  },
  created () {
    this.$on('relayout', () => {
      this.sync()
    })
    this.$on('retry', () => {
      this.sync()
    })

    this.$on('size', (v) => {
      this.width = v.width
      this.height = v.height
      this.depth = v.depth
      this.radius = v.radius
      this.sync()
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
  mounted () {
    this.sync()
    this.$parent.$emit('add', this.object3D)
  },
  beforeDestroy () {
    this.$parent.$emit('remove', this.object3D)
  }
}
</script>

<style>

</style>
