<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { Tree } from '../Reusable'
// import { Mesh, BoxBufferGeometry, MeshBasicMaterial } from 'three'
export default {
  name: 'O3D',
  mixins: [Tree],
  components: {
    // ...require('../webgl')
  },
  data () {
    return {
    }
  },
  mounted () {
    // let geo = new BoxBufferGeometry(50, 50, 50, 2, 2, 2)
    // let mat = new MeshBasicMaterial({ color: 0xff0000 })
    // let item = new Mesh(geo, mat)
    // this.o3d.add(item)
  },
  beforeDestroy () {
  }
}
</script>

<style>
</style>
