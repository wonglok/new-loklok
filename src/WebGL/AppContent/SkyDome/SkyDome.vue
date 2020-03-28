<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { Tree } from '../../Reusable'
import { Mesh, SphereBufferGeometry, BackSide, MeshBasicMaterial } from 'three'
export default {
  name: 'Test',
  mixins: [Tree],
  props: {
    texture: {
      default: null
    }
  },
  components: {
    ...require('../../webgl')
  },
  data () {
    return {
    }
  },
  mounted () {
    let mat = new MeshBasicMaterial({ map: this.texture, side: BackSide })
    let item = new Mesh(undefined, mat)
    let base = this.lookup('base')

    base.onResize(() => {
      let geo = new SphereBufferGeometry(this.screen.max * 200, 8, 8)
      item.geometry = geo
      item.needsUpdate = true
    })
    this.o3d.add(item)
  },
  beforeDestroy () {
  }
}
</script>

<style>
</style>
