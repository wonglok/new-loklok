<template>
  <div>
    <div class="p-2 text-3xl">Please Choose Your Data Type</div>
    <button class="m-2 p-2 border border-green-400 px-3 bg-green-100 rounded-lg text-green-700" @click="choose(item, 'boolean')">Boolean</button>
    <button class="m-2 p-2 border border-green-400 px-3 bg-green-100 rounded-lg text-green-700" @click="choose(item, 'number')">Number</button>
    <button class="m-2 p-2 border border-green-400 px-3 bg-green-100 rounded-lg text-green-700" @click="choose(item, 'vec3')">Vector 3</button>
    <button class="m-2 p-2 border border-green-400 px-3 bg-green-100 rounded-lg text-green-700" @click="choose(item, 'vec2')">Vector 2</button>
    <button class="m-2 p-2 border border-green-400 px-3 bg-green-100 rounded-lg text-green-700" @click="choose(item, 'color')">Color</button>
    <button class="m-2 p-2 border border-green-400 px-3 bg-green-100 rounded-lg text-green-700" @click="choose(item, 'string')">String</button>
    <button class="m-2 p-2 border border-green-400 px-3 bg-green-100 rounded-lg text-green-700" @click="choose(item, 'layout')">Layout Formula XYZ</button>
  </div>
</template>

<script>
export default {
  props: {
    app: {},
    item: {}
  },
  methods: {
    choose (item, type) {
      if (type === 'number') {
        item.type = 'number'
        item.value = 0
        this.app.updateNow(item)
      }
      if (type === 'boolean') {
        item.type = 'boolean'
        item.value = true
        this.app.updateNow(item)
      }
      if (type === 'color') {
        item.type = 'color'
        item.value = {
          r: 0,
          g: 0,
          b: 0,
          a: 0
        }
        this.app.updateNow(item)
      }
      if (type === 'vec3') {
        item.type = 'vec3'
        item.value = {
          x: 0,
          y: 0,
          z: 0
        }
        this.app.updateNow(item)
      }
      if (type === 'layout') {
        item.type = 'layout'
        item.value = {
          fpx: '0',
          fpy: '0',
          fpz: '0',

          frx: '0',
          fry: '0',
          frz: '0',

          fsx: '1',
          fsy: '1',
          fsz: '1'
        }
        this.app.updateNow(item)
      }
      if (type === 'vec2') {
        item.type = 'vec2'
        item.value = {
          x: 0,
          y: 0
        }
        this.app.updateNow(item)
      }
      if (type === 'string') {
        item.type = 'string'
        item.value = ''
        this.app.updateNow(item)
      }
    }
  }
}
</script>

<style scoped>

</style>
