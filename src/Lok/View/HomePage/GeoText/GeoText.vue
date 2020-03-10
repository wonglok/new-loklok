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
    text: {
      default: 'With Lok Lok .com'
    },
    kn: {},
    base: {},
    font: {},
    texture: {}
  },
  async mounted () {
    let base = this.base
    let container = this.container = {
      add: (v) => {
        this.$parent.$emit('add', v)
      },
      remove: (v) => {
        this.$parent.$emit('remove', v)
      }
    }
    // let scene = await base.waitKN('scene')
    // let camera = await base.waitKN('camera')
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
        mesh.geometry.dispose()
        container.remove(mesh)
      }
      mesh = new Mesh(geo, mat)
      base[this.kn] = mesh

      mesh.scale.x = 0.5
      mesh.scale.y = 0.5
      mesh.scale.z = 0.5

      geo.computeBoundingSphere()
      geo.computeBoundingBox()

      mesh.position.x = geo.boundingSphere.radius * -0.5
      mesh.position.y = (geo.boundingBox.min.y + geo.boundingBox.max.y) * -0.25

      this.$parent.$emit('size', {
        radius: geo.boundingSphere.radius * 0.5,
        width: geo.boundingSphere.radius,
        height: (geo.boundingBox.min.y + geo.boundingBox.max.y) * 0.5,
        depth: 0
      })

      // mesh.position.z = camera.position.z * 0.75
      mesh.needsUpdate = true

      // mesh.rotation.x = -0.08

      console.log('geo font', this.text)

      container.add(mesh)
    }

    // let text = 'withloklok.com'
    // let width = visibleWidthAtZDepth({ depth: camera.position.z, camera })
    makeFont({ text: this.text, onReady })
  },
  async beforeDestroy () {
    let container = this.container
    container.remove(this.base[this.kn])
  }
}
</script>
