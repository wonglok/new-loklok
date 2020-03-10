<template>
  <O3D>
    <O3D :pz="25" :rz="(1.0 - menu.value) * -0.5" :px="(1.0 - menu.value) * -rect.width  * 2.0">
      <RefractionArea v-if="base && rect" :screen="rect" :base="base" :layout="layout" :color="layout['menu-layer-color']"></RefractionArea>

      <O3D v-if="rect && layout" :screen="rect" :layout="layout['nav-menu-off']" :base="base" :kn="'nav-menu-off'">
        <TextureText :visible="menu.value > 0" @remove="$removeClick($event)" @add="$addClick($event, onClick)" :align="'left'" :screen="screen" :text="'CLOSE'" :sdk="sdk" :base="base" :font="'SeasideResortNF'" :texture="'purple2DTexture'" :kn="'section-2-text'"></TextureText>
      </O3D>

      <O3D :layout="layout['menu-ccl']">
        <TextureText @remove="$removeClick($event)" @add="$addClick($event, () => { openWin('https://creativecodelab.com') })" :align="'center'" :screen="screen" :font="'SeasideResortNF'" :text="'Creative Code Lab .com'" :sdk="sdk" :base="base" :texture="'purple2DTexture'" :kn="'wihtloklok-text'"></TextureText>
      </O3D>

      <O3D :layout="layout['menu-effectnode']">
        <TextureText @remove="$removeClick($event)" @add="$addClick($event, () => { openWin('https://effectnode.com') })" :align="'center'" :screen="screen" :font="'SeasideResortNF'" :text="'Effect Node .com'" :sdk="sdk" :base="base" :texture="'purple2DTexture'" :kn="'wihtloklok-text'"></TextureText>
      </O3D>

      <O3D :layout="layout['menu-igraph']">
        <TextureText @remove="$removeClick($event)" @add="$addClick($event, () => { openWin('https://igraph.effectnode.com') })" :align="'center'" :screen="screen" :font="'SeasideResortNF'" :text="'iGraph . Effect Node .com'" :sdk="sdk" :base="base" :texture="'purple2DTexture'" :kn="'wihtloklok-text'"></TextureText>
      </O3D>

      <O3D :layout="layout['menu-wonglok']">
        <TextureText @remove="$removeClick($event)" @add="$addClick($event, () => { openWin('https://www.wonglok.com') })" :align="'center'" :screen="screen" :font="'SeasideResortNF'" :text="'Wong lok .com'" :sdk="sdk" :base="base" :texture="'purple2DTexture'" :kn="'wihtloklok-text'"></TextureText>
      </O3D>

    </O3D>
    <!-- <O3D v-if="screen && layout" :screen="screen" :layout="layout['menu-title']">
      <TextureText @add="$addClick($event, onClick)" @remove="$removeClick($event)" @clicker="() => {}" :align="'center'" :screen="screen" :text="'Menu'" :sdk="sdk" :base="base" :font="'resortFont'" :texture="'purple2DTexture'" :kn="'section-2-text'"></TextureText>
    </O3D> -->
    <!-- Hamburger Menu -->

    <slot></slot>
  </O3D>
</template>
<script>
import { Object3D } from 'three'
import { getScreen } from '../GetScreen'
// const TWEEN = require('@tweenjs/tween.js').default

export default {
  components: {
    ...require('../../graphics').default
  },
  props: {
    menu: {},
    sdk: {},
    open: {},
    layout: {},
    screen: {},
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
      rect: false,
      o3d: new Object3D()
    }
  },
  watch: {
  },
  methods: {
    onClick () {
      this.$emit('close')
    },
    openWin (v) {
      window.open(v)
    }
    // sync () {
    //   TWEEN.removeAll()
    //   if (this.open) {
    //     new TWEEN.Tween(this)
    //       .to({
    //         menu.value: 1
    //       }, 1500)
    //       .easing(TWEEN.Easing.Quadratic.InOut)
    //       .start()
    //   } else {
    //     new TWEEN.Tween(this)
    //       .to({
    //         menu.value: 0
    //       }, 1500)
    //       .easing(TWEEN.Easing.Quadratic.InOut)
    //       .start()
    //   }
    // }
  },
  async mounted () {
    let camera = await this.base.waitKN('camera')
    this.rect = getScreen({ camera, depth: 25 })
    this.base.onResize(() => {
      this.rect = getScreen({ camera, depth: 25 })
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
