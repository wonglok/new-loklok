<template>
  <div></div>
</template>
<script>
import { MeshBasicMaterial, Mesh, Color, CubeReflectionMapping } from 'three'

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
    font: {},
    texture: {}
  },
  async mounted () {
    let base = this.base
    let scene = await base.waitKN('scene')
    // let camera = await base.waitKN('camera')
    let makeFont = await base.waitKN(this.font)
    let texture = await base.waitKN(this.texture)

    var mat = new MeshBasicMaterial({ color: 0xbababa, envMap: texture, opacity: 1.0, transparent: true })
    mat.color = new Color(`#fff`)
    mat.refractionRatio = 0.5
    mat.reflectionRatio = 0.5

    mat.envMap = texture
    mat.envMap.mapping = CubeReflectionMapping
    let mesh = false

    let onReady = ({ geo }) => {
      if (mesh) {
        scene.remove(mesh)
      }
      mesh = new Mesh(geo, mat)
      base[this.kn] = mesh
      scene.add(mesh)
      mesh.scale.x = 0.5
      mesh.scale.y = 0.5
      mesh.scale.z = 0.5

      geo.computeBoundingSphere()
      geo.computeBoundingBox()

      mesh.position.x = geo.boundingSphere.radius * -0.5
      mesh.needsUpdate = true
      console.log('geo font')
    }
    let text = 'With Lok Lok'
    makeFont({ text, onReady })
  },
  async beforeDestroy () {
    let scene = await this.base.waitKN('scene')
    scene.remove(this.base[this.kn])
  }
}
</script>
