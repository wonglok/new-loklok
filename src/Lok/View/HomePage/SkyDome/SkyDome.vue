<template>
  <div></div>
</template>
<script>
import { MeshBasicMaterial, Mesh, BackSide, SphereBufferGeometry } from 'three'

export const visibleHeightAtZDepth = (depth, camera) => {
  // compensate for cameras not positioned at z=0
  const cameraOffset = camera.position.z
  if (depth < cameraOffset) depth -= cameraOffset
  else depth += cameraOffset

  // vertical fov in radians
  const vFOV = camera.fov * Math.PI / 180

  // Math.abs to ensure the result is always positive
  return 2 * Math.tan(vFOV / 2) * Math.abs(depth)
}

export const visibleWidthAtZDepth = (depth, camera) => {
  const height = visibleHeightAtZDepth(depth, camera)
  return height * camera.aspect
}

export default {
  props: {
    kn: {},
    base: {},
    texture: {}
  },
  async mounted () {
    let base = this.base
    // let scene = await base.waitKN('scene')
    let camera = await base.waitKN('camera')
    let texture = await base.waitKN(this.texture)
    let glProxy = this.glProxy = {
      add: (v) => {
        this.$parent.$emit('add', v)
      },
      remove: (v) => {
        this.$parent.$emit('remove', v)
      }
    }

    let mat = new MeshBasicMaterial({ map: texture, side: BackSide })
    let mesh = new Mesh(undefined, mat)

    base.onResize(() => {
      let width = visibleWidthAtZDepth(camera.position.z, camera)
      let height = visibleHeightAtZDepth(camera.position.z, camera)
      let max = Math.max(width, height) * 100.0
      let geo = new SphereBufferGeometry(max, 16, 16)
      mesh.geometry = geo
      mesh.needsUpdate = true
    })

    base[this.kn] = mesh

    glProxy.add(mesh)
    console.log('done', this.kn)
  },
  async beforeDestroy () {
    // let scene = await this.base.waitKN('scene')
    let mesh = await this.base.waitKN(this.kn)
    this.glProxy.remove(mesh)
  }
}
</script>
