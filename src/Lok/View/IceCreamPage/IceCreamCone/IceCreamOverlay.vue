<template>
  <O3D>
    <O3D :layout="'ice-cream'">
      <O3D :px="-6">
        <IceCreamCone @remove="$removeClick($event)" @add="$addClick($event, () => { $router.push('/') })" :file="require('file-loader!./model/ice-cream.glb')" :base="base" :sdk="sdk"></IceCreamCone>
      </O3D>
      <O3D>
        <IceCreamCone @remove="$removeClick($event)" @add="$addClick($event, () => { $router.push('/') })" :file="require('file-loader!./model/ice-cream.glb')" :base="base" :sdk="sdk"></IceCreamCone>
      </O3D>
      <O3D :px="6">
        <IceCreamCone @remove="$removeClick($event)" @add="$addClick($event, () => { $router.push('/') })" :file="require('file-loader!./model/ice-cream.glb')" :base="base" :sdk="sdk"></IceCreamCone>
      </O3D>
    </O3D>
  </O3D>
</template>

<script>
import { Object3D } from 'three'
import { castDownEvent } from '../../ReusableGraphics/Scope.js'
export default {
  components: {
    ...require('../../graphics').default
  },
  props: {
    sdk: {},
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
      stub: false,
      o3d: new Object3D()
    }
  },
  mounted () {
    this.sdk.onStubGroup('icecream-overlay', (stub) => {
      this.stub = stub
      castDownEvent(this, 'relayout', {})
    })

    this.$parent.$emit('add', this.o3d)
  },
  beforeDestroy () {
    this.$parent.$emit('remove', this.o3d)
  }
}
</script>

<style>

</style>
