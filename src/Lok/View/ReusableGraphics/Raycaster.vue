<template>
  <div><slot></slot></div>
</template>
<script>
import Vue from 'vue'
import { Raycaster, Vector2 } from 'three'
export default {
  props: {
    kn: {},
    base: {}
  },
  created () {
    this.$on('add', (v) => {
      this.raycaster.add(v)
    })
    this.$on('remove', (v) => {
      this.raycaster.remove(v)
    })
  },
  data () {
    return {
      both: [],
      o3dHovers: [],
      o3dClickers: [],
      raycaster: new Raycaster()
    }
  },
  async mounted () {
    let renderer = await this.base.waitKN('renderer')
    this.base[this.kn] = this.raycaster

    let bs = this.base
    bs.mouse = new Vector2(0, 0)

    Vue.prototype.$addClick = (v, handler = () => {}) => {
      console.log('add-clicker', v)
      v.userData = v.userData || {}
      v.userData.handler = handler
      this.o3dClickers.push(v)
      this.both.push(v)
    }

    Vue.prototype.$removeClick = (v) => {
      console.log('remove-clicker', v)
      this.o3dClickers.splice(this.o3dClickers.indexOf(v), 1)
      this.both.splice(this.both.indexOf(v), 1)
    }

    Vue.prototype.$addHover = (v, handler = () => {}) => {
      console.log('add-hover', v)
      v.userData = v.userData || {}
      v.userData.handler = handler
      this.o3dHovers.push(v)
      this.both.push(v)
    }

    Vue.prototype.$removeHover = (v) => {
      console.log('remove-hover', v)
      this.o3dHovers.splice(this.o3dHovers.indexOf(v), 1)
      this.both.splice(this.both.indexOf(v), 1)
    }

    function onDocumentMouseMove (event) {
      // event.preventDefault()
      bs.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      bs.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    }
    function onDocumentTouchMove (event) {
      let obj = event.touches[0]
      console.log(obj)
      bs.mouse.x = (obj.pageX / window.innerWidth) * 2 - 1
      bs.mouse.y = -(obj.pageY / window.innerHeight) * 2 + 1
    }

    let onDocumentClick = () => {
      let rc = this.raycaster
      if (bs.camera && bs.mouse && rc) {
        rc.setFromCamera(bs.mouse, bs.camera)

        // console.log(this.o3dClickers.children)

        var findings = rc.intersectObjects(this.o3dClickers)
        let event = (findings.length) > 0 ? findings[0] : null
        // console.log(first)
        if (event) {
          let obj = event.object
          let userData = obj.userData
          let handler = userData.handler
          if (handler) {
            handler({
              type: 'click',
              event,
              userData,
              object: obj
            })
          } else {
            console.error('handler not found')
          }
          console.log(event)
        }
      }
    }
    let onDocumentHover = () => {
      let rc = this.raycaster
      if (bs.camera && bs.mouse && rc) {
        rc.setFromCamera(bs.mouse, bs.camera)

        var findings = rc.intersectObjects(this.o3dHovers)
        var tryhover = rc.intersectObjects(this.both)
        if ((tryhover.length) > 0) {
          document.body.style.cursor = 'pointer !important'
        } else {
          document.body.style.cursor = ''
        }
        let event = (findings.length) > 0 ? findings[0] : null
        // console.log(first)
        if (event) {
          let obj = event.object
          let userData = obj.userData
          let handler = userData.handler
          if (handler) {
            handler({
              type: 'hover',
              event,
              userData,
              object: obj
            })
          } else {
            console.error('handler not found')
          }
        }
      }
    }

    renderer.domElement.addEventListener('touchstart', onDocumentTouchMove, { passive: false })
    renderer.domElement.addEventListener('touchmove', onDocumentTouchMove, { passive: false })
    renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, { passive: false })
    renderer.domElement.addEventListener('click', onDocumentClick, { passive: false })
    renderer.domElement.addEventListener('touchstart', onDocumentClick, { passive: false })
    bs.loop(onDocumentHover)
  }
}
</script>
