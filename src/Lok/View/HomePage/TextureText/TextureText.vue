<template>
  <div></div>
</template>
<script>
// import MeshText from 'three-spritetext'
import TextTexture from '@seregpie/three.text-texture'

import { ShaderMaterial, Mesh, PlaneBufferGeometry } from 'three'

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
    align: {},
    kn: {},
    base: {},
    font: {},
    screen: {},
    texture: {}
  },
  async mounted () {
    let base = this.base
    let pattern = await base.waitKN(this.texture)

    let glProxy = this.glProxy = {
      add: (v) => {
        this.$parent.$emit('add', v)
      },
      remove: (v) => {
        this.$parent.$emit('remove', v)
      }
    }

    let texture = new TextTexture({
      align: this.align || 'center',
      fillStyle: 'white',
      fontFamily: 'sans-serif',
      fontSize: 140,
      fontStyle: 'normal',
      fontVariant: 'normal',
      fontWeight: 'normal',
      lineGap: 0.15,
      padding: 0.15,
      // mini text shadow
      strokeStyle: '#bababa',
      strokeWidth: 0.025,
      text: ''
    })
    /* eslint-disable */
    let material = new ShaderMaterial({
      transparent: true,
      uniforms: {
        patternTexture: { value: pattern },
        textTexture: { value: texture }
      },
      vertexShader: require('raw-loader!./text-vert.glsl').default,
      fragmentShader: require('raw-loader!./text-frag.glsl').default
    })
    /* eslint-enable */

    let makeGeo = () => {
      // let screen = this.screen
      let width = texture.image.width * 0.0075
      let height = texture.image.width * 0.0075 * (texture.image.height) / (texture.image.width)
      let geo = new PlaneBufferGeometry(width, height, 2, 2)

      geo.computeBoundingSphere()
      geo.computeBoundingBox()

      // mirror.position.x = geo.boundingSphere.radius * -0.5
      // mirror.position.y = (geo.boundingBox.min.y + geo.boundingBox.max.y) * -0.25
      // mirror.needsUpdate = true

      let sizing = {
        radius: width * 0.5,
        width: width,
        height: height,
        depth: 0
      }

      console.log(this.text, 'sizing', sizing)
      this.$parent.$emit('size', sizing)

      return geo
    }
    let sprite = new Mesh(makeGeo(), material)
    sprite.position.z = 1.0

    this.sprite = sprite
    texture.redraw()
    // sprite.scale
    //   .set(texture.image.width / texture.image.height, 1, 1)

    glProxy.add(sprite)

    let update = () => {
      texture.fontFamily = 'Arial, Helvetica, sans-serif'
      texture.text = this.text
      texture.redraw()
      sprite.geometry = makeGeo()
      sprite.needsUpdate = true
      // sprite.scale
      //   .set(texture.image.width / texture.image.height, 1, 1)
    }

    update()

    this.$watch('text', () => {
      update()
    })
    base.onResize(() => {
      update()
    })

    // let scene = await base.waitKN('scene')
    // let camera = await base.waitKN('camera')
    // let camera = await base.waitKN('camera')
    // let makeFont = await base.waitKN(this.font)

    // var mat = new MeshBasicMaterial({ color: 0xbababa, envMap: texture, opacity: 1.0, transparent: true })
    // mat.color = new Color(`#fff`)
    // mat.refractionRatio = 0.5
    // mat.reflectionRatio = 0.5

    // mat.envMap = texture
    // mat.envMap.mapping = CubeReflectionMapping
    // let mesh = false

    // let onReady = ({ geo }) => {
    //   if (mesh) {
    //     mesh.geometry.dispose()
    //     glProxy.remove(mesh)
    //   }
    //   mesh = new Mesh(geo, mat)
    //   base[this.kn] = mesh

    //   mesh.scale.x = 0.5
    //   mesh.scale.y = 0.5
    //   mesh.scale.z = 0.5

    //   geo.computeBoundingSphere()
    //   geo.computeBoundingBox()

    //   mesh.position.x = geo.boundingSphere.radius * -0.5
    //   mesh.position.y = (geo.boundingBox.min.y + geo.boundingBox.max.y) * -0.25

    //   this.$parent.$emit('size', {
    //     radius: geo.boundingSphere.radius * 0.5,
    //     width: geo.boundingSphere.radius,
    //     height: (geo.boundingBox.min.y + geo.boundingBox.max.y) * 0.5,
    //     depth: 0
    //   })

    //   // mesh.position.z = camera.position.z * 0.75
    //   mesh.needsUpdate = true

    //   // mesh.rotation.x = -0.08

    //   console.log('geo font', this.text)

    //   glProxy.add(mesh)
    // }
    // // let text = 'withloklok.com'
    // makeFont({ text: this.text, onReady })
  },
  async beforeDestroy () {
    let glProxy = this.glProxy
    glProxy.remove(this.sprite)
  }
}
</script>
