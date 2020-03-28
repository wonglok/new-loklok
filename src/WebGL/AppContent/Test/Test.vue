<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { Tree } from '../../Reusable'
import { LineSegments, BoxBufferGeometry, MeshBasicMaterial } from 'three'
export default {
  name: 'Test',
  mixins: [Tree],
  components: {
    ...require('../../webgl')
  },
  data () {
    return {
    }
  },
  mounted () {
    let geo = new BoxBufferGeometry(50, 50, 50, 20, 20, 20)
    let mat = new MeshBasicMaterial({ color: 0xff0000 })
    let item = new LineSegments(geo, mat)
    this.o3d.add(item)
  },
  beforeDestroy () {
  }
}
</script>

<style>
</style>
