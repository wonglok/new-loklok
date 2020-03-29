import { Parser } from 'expr-eval'
import { Object3D, Vector3 } from 'three'
import { getScreen } from './index.js'
let parent = (vm) => vm.$parent// || vm.getRootNode().host

// let getVal = (n, key) => n && n[key]

let lookup = (vm, key) => {
  if (parent(vm) && parent(vm)[key]) {
    return parent(vm)[key]
  } else {
    vm = parent(vm)
    if (!vm) {
      return false
    }
    return lookup(vm, key)
  }
}

let castdown = (vm, ev, data) => {
  if (vm && vm.children.length > 0) {
    vm.$emit(ev, data)
    vm.children.forEach((kid) => {
      castdown(kid, ev, data)
    })
  }
}

export const Tree = {
  props: {
    animated: {
      default: false
    },
    visible: {},
    layout: {}
  },
  data () {
    return {
      child: {
        width: 0.000000000000001,
        height: 0.000000000000001,
        depth: 0.000000000000001,
        radius: 0.000000000000001
      },
      o3d: new Object3D()
    }
  },
  created () {
    this.$on('add', (v) => {
      this.o3d.add(v)
    })
    this.$on('remove', (v) => {
      this.o3d.remove(v)
    })
    this.$on('child', (v) => {
      this.child = v
      this.$emit('syncFormula')
    })
    this.$on('syncFormula', () => {
      this.onSyncFormula()
    })
  },

  watch: {
    visible () {
      this.$emit('syncFormula')
    },
    layout () {
      this.$emit('syncFormula')
    },
    animated () {
      this.$emit('syncFormula')
    }
  },

  mounted () {
    this.$parent.$emit('add', this.o3d)
    this.$emit('syncFormula')
    if (this.animated) {
      this.lookup('base').onLoop(() => {
        this.$emit('syncFormula')
      })
    }
    if (this.lookup('base')) {
      this.lookup('base').onResize(() => {
        this.$emit('syncFormula')
      })
      // console.log(this.$options.name, this.lookup('base'))
    }
    console.log('Mounted:', this.$options.name)
  },

  beforeDestroy () {
    this.o3d.visible = false
    this.$parent.$emit('remove', this.o3d)
  },
  computed: {
    screen () {
      return this.getScreen()
    }
  },
  methods: {
    getScreen () {
      this.lookup('scene').updateMatrixWorld()
      this.tempVector3 = this.tempVector3 || new Vector3()
      this.tempVector3.setFromMatrixPosition(this.o3d.matrixWorld)
      // console.log(this.$options.name, this.tempVector3.z)
      return getScreen({ camera: lookup(this, 'camera'), depth: this.tempVector3.z })
    },

    castdown (ev, data) {
      return castdown(this, ev, data)
    },
    lookup (key) {
      return lookup(this, key)
    },

    getLayout () {
      let layoutMap = this.lookup('layouts')
      let layoutName = this.layout
      if (layoutMap && layoutName && layoutMap[layoutName]) {
        return layoutMap[layoutName]
      } else {
        return {}
      }
    },

    onSyncFormula () {
      let run = (fnc) => {
        try {
          fnc()
        } catch (e) {
          console.log(this.$option.name, e)
        }
      }

      let layout = this.getLayout()
      if (typeof layout.visible !== 'undefined') {
        run(() => { this.o3d.visible = Parser.evaluate('' + (layout.visible), this) })
      }

      if (typeof this.visible !== 'undefined') {
        run(() => { this.o3d.visible = Parser.evaluate('' + (this.visible), this) })
      }

      run(() => { this.o3d.rotation.x = Parser.evaluate('' + (layout.rx || '0'), this) })
      run(() => { this.o3d.rotation.y = Parser.evaluate('' + (layout.ry || '0'), this) })
      run(() => { this.o3d.rotation.z = Parser.evaluate('' + (layout.rz || '0'), this) })

      run(() => { this.o3d.scale.x = Parser.evaluate('' + (layout.sx || '1'), this) })
      run(() => { this.o3d.scale.y = Parser.evaluate('' + (layout.sy || '1'), this) })
      run(() => { this.o3d.scale.z = Parser.evaluate('' + (layout.sz || '1'), this) })

      run(() => { this.o3d.position.x = Parser.evaluate('' + (layout.px || '0'), this) })
      run(() => { this.o3d.position.y = Parser.evaluate('' + (layout.py || '0'), this) })
      run(() => { this.o3d.position.z = Parser.evaluate('' + (layout.pz || '0'), this) })
    }
  }
}
