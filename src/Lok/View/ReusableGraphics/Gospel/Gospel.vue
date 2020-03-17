<template>
  <O3D  :pz="depth" v-if="screen">
    <O3D :px="10 * (animator.value + hider.value)">
      <O3D :layout="'open-menu'">
        <TextureText :text="'Thank you Gospel'" @remove="$removeClick($event)" @add="$addClick($event, () => { $emit('overlay', 'gospel') })" :align="'left'" :sdk="sdk" :base="base" :font="'SeasideResortNF'" :texture="'purple2DTexture'"></TextureText>
      </O3D>
    </O3D>

    <O3D :px="30 * (1.0 - animator.value)">
      <O3D :layout="'close-menu'">
        <TextureText :text="'CLOSE'" @remove="$removeClick($event)" @add="$addClick($event, () => { $emit('overlay', '') })" :align="'left'" :sdk="sdk" :base="base" :font="'SeasideResortNF'" :texture="'purple2DTexture'"></TextureText>
      </O3D>
    </O3D>
    <O3D :px="(1.0 - animator.value) * screen.width">
      <O3D :visible="animator.value > 0.001">
        <RefractionArea v-if="base && screen" :screen="screen" :base="base" :color="'#aaaaaa'"></RefractionArea>
      </O3D>

      <O3D :layout="'bible'">
        <TextureText :align="'left'" :text="favouriteVerses" :sdk="sdk" :base="base" :font="'resortFont'" :texture="'purple2DTexture'"></TextureText>
      </O3D>

    </O3D>

    <slot></slot>
  </O3D>
</template>
<script>
import { Object3D } from 'three'
import { getScreen } from '../GetScreen'
import { Damper } from '../Damper.js'

// import { Damper } from '../Damper.js'

// const TWEEN = require('@tweenjs/tween.js').default

export default {
  components: {
    ...require('../../graphics').default
  },
  props: {
    overlay: {},
    // animator: {},
    sdk: {},
    open: {},
    // screen: {},
    kn: {},
    base: {}
  },
  created () {
    this.$on('add', (v) => {
      this.o3d.add(v)
    })
    this.$on('remove', (v) => {
      this.o3d.remove(v)
    })
  },
  data () {
    return {
      hider: false,
      animator: false,
      stub: false,
      depth: 100,
      favouriteVerses: `Love is patient and kind;
love does not envy or boast;
It is not arrogant or rude.
It does not insist on its own way;
It is not irritable or resentful;
It does not rejoice at wrongdoing,
but rejoices with the truth.
Love bears all things,
believes all things,
hopes all things,
endures all things.
Love never ends.

1 Corinthians 13:4–8a`,
      screen: false,
      o3d: new Object3D()
    }
  },
  watch: {
  },
  methods: {
    onClick () {
      this.$emit('close')
    },
    openWin (href) {
      window.location = href
    }
    // sync () {
    //   TWEEN.removeAll()
    //   if (this.open) {
    //     new TWEEN.Tween(this)
    //       .to({
    //         animator.value: 1
    //       }, 1500)
    //       .easing(TWEEN.Easing.Quadratic.InOut)
    //       .start()
    //   } else {
    //     new TWEEN.Tween(this)
    //       .to({
    //         animator.value: 0
    //       }, 1500)
    //       .easing(TWEEN.Easing.Quadratic.InOut)
    //       .start()
    //   }
    // }
  },
  async mounted () {
    this.animator = new Damper(0, this.base)
    this.hider = new Damper(0, this.base)
    this.sync = () => {
      if (this.overlay !== '') {
        this.hider.value = 1
      } else {
        this.hider.value = 0
      }
      if (this.overlay === 'gospel') {
        this.animator.value = 1
      } else {
        this.animator.value = 0
      }
    }
    this.sync()
    this.$watch('overlay', this.sync)

    let castDown = (vm, ev, data) => {
      if (vm && vm.$children.length > 0) {
        vm.$emit(ev, data)
        vm.$children.forEach((kid) => {
          castDown(kid, ev, data)
        })
      }
    }
    // this.animator = new Damper(0, this.base)

    this.sdk.onStubGroup('gospel-overlay', (stub) => {
      this.stub = stub
      castDown(this, 'relayout', {})
    })

    let camera = await this.base.waitKN('camera')
    this.screen = getScreen({ camera, depth: this.depth })
    this.base.onResize(() => {
      this.screen = getScreen({ camera, depth: this.depth })
    })
    // this.sync()
    this.$parent.$emit('add', this.o3d)
    if (this.base && this.kn) {
      this.base[this.kn] = this.o3d
    }
  },
  beforeDestroy () {
    this.$parent.$emit('remove', this.o3d)
  }
}
</script>
