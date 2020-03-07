<template>
  <div></div>
</template>

<script>
import { TextGeometry, Font } from 'three'

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
    sdk: {},
    kn: {},
    base: {},
    setting: {
      default: 'resort-font'
    }
  },
  async mounted () {
    var font = await import('../../Fonts/resort-display.json')
    var camera = await this.base.waitKN('camera')
    font = new Font(font)

    this.base[this.kn] = async ({ text, width = false, height = false, onReady }) => {
      // eslint-disable-next-line
      let group = this.sdk.getGroup(`${this.setting}`)
      let tout = 0
      let json = ''
      let setup = () => {
        clearTimeout(tout)
        setTimeout(() => {
          let swidth = visibleWidthAtZDepth(camera.position.z, camera)
          let sheight = visibleHeightAtZDepth(camera.position.z, camera)
          let min = Math.min(swidth, sheight)
          let params = {
            font: font,
            size: (width || (group.proxy.width / 100)) * min * text.length,
            height: height || (group.proxy.depth / 100 * 5),
            curveSegments: group.proxy.curveSegments / 100 * 100,
            bevelEnabled: group.proxy.bevelEnabled,
            bevelThickness: group.proxy.bevelThickness / 100,
            bevelSize: group.proxy.bevelSize / 100,
            bevelOffset: group.proxy.bevelOffset / 100,
            bevelSegments: group.proxy.bevelOffset / 100 * 10
          }
          let newJSON = JSON.stringify(params)
          if (newJSON !== json) {
            json = newJSON
            console.log(params)
            var geometry = new TextGeometry(text, params)
            onReady({ geo: geometry })
          }
        }, 150)
      }
      group.onResize(setup)
      group.autoPulse('width', setup)
      group.autoPulse('depth', setup)
      group.autoPulse('curveSegments', setup)
      group.autoPulse('bevelEnabled', setup)
      group.autoPulse('bevelThickness', setup)
      group.autoPulse('bevelSize', setup)
      group.autoPulse('bevelOffset', setup)
      group.autoPulse('bevelSegments', setup)
    }
  }
}
</script>

<style>

</style>
