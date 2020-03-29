<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import TextTexture from '@seregpie/three.text-texture'

import { Tree } from '../Reusable'
import { Mesh, PlaneBufferGeometry, MeshBasicMaterial } from 'three'
export default {
  props: {
    text: {},
    font: {
      default: 'SeasideResortNF'
    },
    align: {
      default: 'center'
    }
  },
  name: 'Test',
  mixins: [Tree],
  components: {
    ...require('../webgl')
  },
  data () {
    return {
    }
  },
  mounted () {
    this.$on('init', async () => {
      async function loadSeaside () {
        const font = new FontFace('SeasideResortNF', `url('/fonts/seaside/SeasideResortNF.eot?#iefix') format('embedded-opentype'),  url('/fonts/seaside/SeasideResortNF.woff') format('woff'), url('/fonts/seaside/SeasideResortNF.ttf')  format('truetype'), url('/fonts/seaside/SeasideResortNF.svg#SeasideResortNF') format('svg')`, {
          family: 'SeasideResortNF',
          style: 'normal',
          weight: `normal`
          // `font-weight: normal; font-style: normal;`
        })
        await font.load()
        document.fonts.add(font)
      }
      if (this.font === 'SeasideResortNF') {
        await loadSeaside()
      }
      let texture = new TextTexture({
        align: this.align || 'center',
        fillStyle: 'white',
        fontFamily: `${this.font || 'Arial'}, sans-serif`,
        fontSize: 140,
        fontStyle: 'normal',
        fontVariant: 'normal',
        fontWeight: 'normal',
        lineGap: 0.15,
        padding: 0.15,
        // mini text shadow
        strokeStyle: '#bababa',
        strokeWidth: 0.025,
        text: this.text
      })
      texture.redraw()

      let width = texture.image.width * 0.075
      let height = texture.image.width * 0.075 * (texture.image.height) / (texture.image.width)
      let geo = new PlaneBufferGeometry(width, height, 2, 2)

      geo.computeBoundingSphere()
      geo.computeBoundingBox()

      let sizing = {
        radius: width * 0.5,
        width: width,
        height: height,
        depth: 0
      }

      // console.log(this.text, 'sizing', sizing)
      this.$emit('child', sizing)
      this.$parent.$emit('child', sizing)

      let mat = new MeshBasicMaterial({ color: 0xffffff, map: texture, transparent: true })
      let item = new Mesh(geo, mat)
      this.o3d.children.forEach((v) => {
        this.o3d.remove(v)
      })
      this.o3d.add(item)
      this.o3d.position.z = 1
    })
    this.$emit('init')
    this.$watch('text', () => {
      this.$emit('init')
    })
    this.$watch('font', () => {
      this.$emit('init')
    })
    this.$watch('align', () => {
      this.$emit('init')
    })
  },
  beforeDestroy () {
  }
}
</script>

<style>
</style>
