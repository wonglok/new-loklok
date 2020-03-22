<template>
  <O3D v-if="screen">
    <O3D :pz="depth" :py="-screen.height * (scroller.maxY - scroller.value)" :px="screen.width * (animator.value + hider.value)">
      <O3D :layout="'open-menu'">
        <TextureText :text="'Thank you Gospel'" @remove="$removeClick($event)" @add="$addClick($event, () => { $emit('overlay', 'gospel') })" :align="'left'" :sdk="sdk" :base="base" :font="'SeasideResortNF'" :texture="'purple2DTexture'"></TextureText>
      </O3D>
    </O3D>

    <O3D :pz="0" :py="-screen.height * 2 * (scroller.maxY - scroller.value)">
      <O3D :layout="'cluster'">
        <O3D :rx="(animator.value + hider.value) * 3.141592">
          <ParametricCluster :sdk="sdk" :base="base" :cube="'paleCube'" :setting="'parametric-cluster'" :kn="'parametric'"></ParametricCluster>
        </O3D>
      </O3D>
      <O3D :layout="'ice-cream'">
        <IceCreamCone @remove="$removeClick($event)" @add="$addClick($event, () => { if (overlay) { return; } $router.push('/ice-cream') })" :base="base" :sdk="sdk" :cube="'paleCube'"></IceCreamCone>
      </O3D>
    </O3D>

    <O3D :pz="depth" :px="30 * (1.0 - animator.value)">
      <O3D :layout="'close-menu'">
        <TextureText :text="'CLOSE'" @remove="$removeClick($event)" @add="$addClick($event, () => { $emit('overlay', '') })" :align="'left'" :sdk="sdk" :base="base" :font="'SeasideResortNF'" :texture="'purple2DTexture'"></TextureText>
      </O3D>
    </O3D>

    <O3D :pz="depth" :px="(1.0 - animator.value) * screen.width">

      <O3D :visible="animator.value > 0.001">
        <RefractionArea :dudv="'cross'" :blur="animator.value * 0.96" v-if="base && screen" :screen="screen" :base="base" :color="'#aaaaaa'"></RefractionArea>
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
import { getScreen } from '../../ReusableGraphics/GetScreen'
import { Damper } from '../../ReusableGraphics/Damper.js'
import { castDownEvent } from '../../ReusableGraphics/Scope.js'

// import { Damper } from '../Damper.js'

// const TWEEN = require('@tweenjs/tween.js').default

// let castDown = (vm, ev, data) => {
//   if (vm && vm.$children.length > 0) {
//     vm.$emit(ev, data)
//     vm.$children.forEach((kid) => {
//       castDown(kid, ev, data)
//     })
//   }
// }

export default {
  components: {
    ...require('../../graphics').default
  },
  props: {
    scroller: {},
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

    this.sdk.onStubGroup('gospel-overlay', (stub) => {
      this.stub = stub
      castDownEvent(this, 'relayout', {})
    })

    let camera = await this.base.waitKN('camera')
    this.screen = getScreen({ camera, depth: this.depth })
    this.base.onResize(() => {
      this.screen = getScreen({ camera, depth: this.depth })
      castDownEvent(this, 'relayout', {})
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
