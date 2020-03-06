<template>
  <div class="full">
    <!-- <button class="p-2 m-2 border bg-gray-300" @click="add">Add</button>
    <div :key="item.id" v-for="item in app.list">
      Group:
      <input type="text" v-model="item.group" @input="updateNow(item)">
      Key:
      <input type="text" v-model="item.key" @input="updateNow(item)">
      Later:
      <input type="range" v-model="item.notHappy" @input="updateLater(item)">
      <button class="p-2 m-2 border bg-gray-300 bg-red-200" @click="remove(item)">X</button>
    </div>
    <pre>{{ app.data }}</pre> -->
  </div>
</template>

<script>
import { makeAPI } from './uilogic'
// import { makeSDK } from '../index'
export default {
  components: {
    ...require('./uis')
  },
  data () {
    return {
      app: false
    }
  },
  async mounted () {
    this.app = await makeAPI({ ui: this })
  },
  methods: {
    updateNow (item) {
      this.app.updateNow(item)
    },
    updateLater (item) {
      this.app.updateLater(item)
    },
    add () {
      this.app.add({
        group: 'group1',
        key: 'k1',
        happy: 123,
        notHappy: 123
      })
    },
    remove (item) {
      this.app.remove(item)
    }
  }
}
</script>

<style scoped>
@import url(./tailwind.css);
</style>
